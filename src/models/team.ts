import { Schema, model, type InferSchemaType, type Types } from "mongoose";
import { Project } from "./project";
import { Invitation } from "./invitation";
import { TeamMembership } from "./team-memberships";
import { Sprint } from "./sprint";

const teamSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true },
);

teamSchema.pre("deleteOne", async function(next) {
    const teamId = this.getQuery()._id as Types.ObjectId;
    await Project.deleteMany({ teamId });
    await Invitation.deleteMany({ teamId });
    await TeamMembership.deleteMany({ teamId });
    await Sprint.deleteMany({ teamId });
});

export type TeamDocument = InferSchemaType<typeof teamSchema> & { _id: Types.ObjectId };

export const Team = model("Team", teamSchema);
