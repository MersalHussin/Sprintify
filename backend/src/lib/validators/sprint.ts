import { date, objectId, stringField, type JsonSchema } from "./primitives";

export const sprintValidator: JsonSchema = {
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
