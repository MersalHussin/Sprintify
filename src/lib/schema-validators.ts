import countries from "../constants/countries.json";
import { getDBClient } from "./db";
import { Invitation } from "../models/invitation";
import { Project } from "../models/project";
import { Sprint } from "../models/sprint";
import { PRIORITIES, STATUSES, Task } from "../models/task";
import { TaskComment } from "../models/task-comment";
import { Team } from "../models/team";
import { TeamMembership } from "../models/team-memberships";
import { User } from "../models/user";
import { TEAM_ROLES } from "../types/team";

const TIMEZONES = Intl.supportedValuesOf("timeZone");
const COUNTRIES = countries.map(({ value }) => value);
const GENDERS = ["male", "female", "prefer-not-to-say"] as const;

const objectId = { bsonType: "objectId" } as const;
const date = { bsonType: "date" } as const;

const stringField = (maxLength: number, minLength = 1) => ({
  bsonType: "string",
  minLength,
  maxLength,
});

const userValidator: Record<string, unknown> = {
  bsonType: "object",
  required: [
    "uid",
    "firstName",
    "lastName",
    "professionalTitle",
    "gender",
    "timezone",
    "country",
    "createdAt",
    "updatedAt",
  ],
  properties: {
    _id: objectId,
    uid: stringField(128),
    firstName: stringField(50),
    lastName: stringField(50),
    professionalTitle: stringField(100),
    gender: { enum: [...GENDERS] },
    timezone: { enum: TIMEZONES },
    country: { enum: COUNTRIES },
    createdAt: date,
    updatedAt: date,
  },
  additionalProperties: false,
};

const teamValidator: Record<string, unknown> = {
  bsonType: "object",
  required: ["name", "createdBy", "createdAt", "updatedAt"],
  properties: {
    _id: objectId,
    name: stringField(100),
    createdBy: stringField(128),
    createdAt: date,
    updatedAt: date,
  },
  additionalProperties: false,
};

const teamMembershipValidator: Record<string, unknown> = {
  bsonType: "object",
  required: ["teamId", "userId", "role", "joinedAt", "createdAt", "updatedAt"],
  properties: {
    _id: objectId,
    teamId: objectId,
    userId: stringField(128),
    role: { enum: [...TEAM_ROLES] },
    joinedAt: date,
    createdAt: date,
    updatedAt: date,
  },
  additionalProperties: false,
};

const projectValidator: Record<string, unknown> = {
  bsonType: "object",
  required: ["name", "teamId", "createdBy", "createdAt", "updatedAt"],
  properties: {
    _id: objectId,
    name: stringField(100),
    teamId: objectId,
    createdBy: stringField(128),
    createdAt: date,
    updatedAt: date,
  },
  additionalProperties: false,
};

const taskValidator: Record<string, unknown> = {
  bsonType: "object",
  required: ["name", "projectId", "teamId", "createdBy", "createdAt", "updatedAt"],
  properties: {
    _id: objectId,
    name: stringField(200),
    description: { bsonType: ["string", "null"], maxLength: 2500 },
    priority: { enum: [...PRIORITIES] },
    status: { enum: [...STATUSES] },
    category: { bsonType: ["string", "null"], maxLength: 100 },
    subtasks: {
      bsonType: "array",
      maxItems: 100,
      items: {
        bsonType: "object",
        required: ["name", "completed"],
        properties: {
          _id: objectId,
          name: stringField(200),
          completed: { bsonType: "bool" },
        },
        additionalProperties: false,
      },
    },
    assignees: {
      bsonType: "array",
      maxItems: 50,
      items: stringField(128),
    },
    projectId: objectId,
    teamId: objectId,
    sprintId: objectId,
    createdBy: stringField(128),
    createdAt: date,
    updatedAt: date,
  },
  additionalProperties: false,
};

const sprintValidator: Record<string, unknown> = {
  bsonType: "object",
  required: ["projectId", "teamId", "name", "status", "startDate", "createdAt", "updatedAt"],
  properties: {
    _id: objectId,
    projectId: objectId,
    teamId: objectId,
    name: stringField(100),
    goal: { bsonType: ["string", "null"], maxLength: 500 },
    status: { enum: ["active", "completed"] },
    startDate: date,
    endDate: date,
    completedAt: date,
    createdAt: date,
    updatedAt: date,
  },
  additionalProperties: false,
};

const invitationValidator: Record<string, unknown> = {
  bsonType: "object",
  required: ["teamId", "email", "token", "invitedBy", "expiresAt", "createdAt", "updatedAt"],
  properties: {
    _id: objectId,
    teamId: objectId,
    email: stringField(254, 3),
    token: stringField(256),
    invitedBy: stringField(128),
    expiresAt: date,
    createdAt: date,
    updatedAt: date,
  },
  additionalProperties: false,
};

const taskCommentValidator: Record<string, unknown> = {
  bsonType: "object",
  required: ["taskId", "author", "content", "createdAt"],
  properties: {
    _id: objectId,
    taskId: objectId,
    author: stringField(128),
    content: stringField(5000),
    createdAt: date,
  },
  additionalProperties: false,
};

const COLLECTION_VALIDATORS: { model: { collection: { name: string } }; schema: Record<string, unknown> }[] = [
  { model: User, schema: userValidator },
  { model: Team, schema: teamValidator },
  { model: TeamMembership, schema: teamMembershipValidator },
  { model: Project, schema: projectValidator },
  { model: Task, schema: taskValidator },
  { model: Sprint, schema: sprintValidator },
  { model: Invitation, schema: invitationValidator },
  { model: TaskComment, schema: taskCommentValidator },
];

const VALIDATION_OPTIONS = {
  validationLevel: "moderate" as const,
  validationAction: "warn" as const,
};

export async function applySchemaValidators(): Promise<void> {
  const db = await getDBClient();

  for (const { model, schema } of COLLECTION_VALIDATORS) {
    const collectionName = model.collection.name;
    const validator = { $jsonSchema: schema };

    try {
      await db.command({
        collMod: collectionName,
        validator,
        ...VALIDATION_OPTIONS,
      });
    } catch (error) {
      const mongoError = error as { codeName?: string };
      if (mongoError.codeName !== "NamespaceNotFound") throw error;

      await db.createCollection(collectionName, {
        validator,
        ...VALIDATION_OPTIONS,
      });
    }
  }

  console.log("MongoDB schema validators applied");
}
