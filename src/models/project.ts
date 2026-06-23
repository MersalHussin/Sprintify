import { Schema, model, type InferSchemaType, type Types } from "mongoose";

const projectSchema = new Schema(
    {
        name: { type: String, required: true, trim: true, minlength: 1, maxlength: 100 },
        teamId: {
            type: Schema.Types.ObjectId,
            ref: "Team",
            required: true,
        },
        createdBy: {
            type: String,
            ref: "User",
            required: true,
        }
    }, { timestamps: true }
);

projectSchema.index({ teamId: 1 });

export type ProjectDocument = InferSchemaType<typeof projectSchema> & { 
    _id: Types.ObjectId
};

export const Project = model("Project", projectSchema);