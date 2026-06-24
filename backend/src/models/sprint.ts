import { Schema, model, type InferSchemaType, type Types } from "mongoose";

const sprintSchema = new Schema(
    {
        projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
        teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },

        name: { type: String, required: true, trim: true, minlength: 1, maxlength: 100 },
        goal: { type: String, trim: true, maxlength: 500 },
        status: { type: String, enum: ["active", "completed"], default: "active", required: true },

        startDate: { type: Date, required: true, default: Date.now },
        endDate: { type: Date },
        completedAt: { type: Date },
    }, { timestamps: true }
);

sprintSchema.index({ projectId: 1, status: 1 });
sprintSchema.index({ teamId: 1 });

export type SprintDocument = InferSchemaType<typeof sprintSchema> & {
    _id: Types.ObjectId
};

export const Sprint = model("Sprint", sprintSchema);