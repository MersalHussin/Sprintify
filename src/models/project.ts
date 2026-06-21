import { Schema, model, type InferSchemaType, type Types } from "mongoose";
import { Task } from "./task";
import { Sprint } from "./sprint";

const projectSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        teamId: {
            type: Schema.Types.ObjectId,
            ref: "Team",
            required: true,
        },
        createdBy: {
            type: String,
            required: true,
        }
    }, { timestamps: true }
);

projectSchema.index({ teamId: 1 });

projectSchema.pre("deleteOne", async function () {
    const projectId = this.getQuery()._id as Types.ObjectId;
    await Task.deleteMany({ projectId });
    await Sprint.deleteMany({ projectId });
});

export type ProjectDocument = InferSchemaType<typeof projectSchema> & { 
    _id: Types.ObjectId
};

export const Project = model("Project", projectSchema);