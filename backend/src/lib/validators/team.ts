import { date, objectId, stringField, type JsonSchema } from "./primitives";

export const teamValidator: JsonSchema = {
  bsonType: "object",
  required: ["name", "code", "createdBy", "createdAt", "updatedAt"],
  properties: {
    _id: objectId,
    name: stringField(100),
    code: stringField(8, 8),
    createdBy: stringField(128),
    createdAt: date,
    updatedAt: date,
  },
  additionalProperties: false,
};
