import { date, objectId, stringField, type JsonSchema } from "./primitives";

export const invitationValidator: JsonSchema = {
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
