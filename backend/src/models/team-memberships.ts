import { Schema, model, type InferSchemaType, type Types } from "mongoose";

import { TEAM_ROLES } from "../types/team";

const teamMembershipSchema = new Schema(
  {
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    userId: { type: String, ref: "User", required: true },
    role: { type: String, enum: TEAM_ROLES, default: "member", required: true },
    joinedAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true },
);

teamMembershipSchema.index({ teamId: 1, userId: 1 }, { unique: true });
teamMembershipSchema.index({ userId: 1 });
teamMembershipSchema.index({ userId: 1, teamId: 1 });

teamMembershipSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "uid",
  justOne: true,
});

export type TeamMembershipDocument = InferSchemaType<typeof teamMembershipSchema> & {
  _id: Types.ObjectId;
};

export const TeamMembership = model("TeamMembership", teamMembershipSchema);
