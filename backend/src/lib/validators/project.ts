import { date, objectId, stringField, type JsonSchema } from "./primitives";

export const projectValidator: JsonSchema = {
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
