import { PRIORITIES, STATUSES } from "../../models/task";

import { date, objectId, stringField, type JsonSchema } from "./primitives";

export const taskValidator: JsonSchema = {
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
