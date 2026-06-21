import { Schema, model, type InferSchemaType, type Types } from "mongoose";

export const PRIORITIES = ["Urgent", "High", "Medium", "Low"] as const;
export const STATUSES   = ["Backlog", "To Do", "In Progress", "Review", "Done"] as const;

const taskSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },

        priority: { type: String, enum: PRIORITIES, default: "Medium" },
        status: { type: String, enum: STATUSES, default: "Backlog" },
        category: { type: String, required: false },

        subtasks: [{ 
            name: { type: String, required: true, trim: true },
            completed: { type: Boolean, default: false },
        }],

        comments: [{
            author: { type: String, required: true },
            content: { type: String, required: true, trim: true },
            createdAt: { type: Date, default: Date.now, required: true },
        }],

        assignees: [{ type: String }],

        projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
        teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
        sprintId: { type: Schema.Types.ObjectId, ref: "Sprint" },
        createdBy: { type: String, required: true }
    }, { timestamps: true }
);

taskSchema.index({ projectId: 1, sprintId: 1 });
taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ teamId: 1 });
taskSchema.index({ assignees: 1 });

export type TaskDocument = InferSchemaType<typeof taskSchema> & {
    _id: Types.ObjectId
};

export const Task = model("Task", taskSchema);