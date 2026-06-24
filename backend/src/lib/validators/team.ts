import { date, objectId, stringField, type JsonSchema } from "./primitives";

export const teamValidator: JsonSchema = {
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
