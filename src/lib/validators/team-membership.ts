import { TEAM_ROLES } from "../../types/team";

import { date, objectId, stringField, type JsonSchema } from "./primitives";

export const teamMembershipValidator: JsonSchema = {
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
