import { Schema, model, type InferSchemaType, type Types } from "mongoose";

const invitationSchema = new Schema(
    {
        teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        token: { type: String, required: true, unique: true },
        invitedBy: { type: Schema.Types.ObjectId, ref: "TeamMembership", required: true },
        expiresAt: { type: Date, required: true }
    }, { timestamps: true }
);

invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
invitationSchema.index({ teamId: 1, email: 1 }, { unique: true });

export type InvitationDocument = InferSchemaType<typeof invitationSchema> & {
    _id: Types.ObjectId
};

export const Invitation = model("Invitation", invitationSchema);