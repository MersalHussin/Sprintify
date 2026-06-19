import { Schema, model, type InferSchemaType, type Types } from "mongoose";

const PRIORITIES = ["Urgent", "High", "Medium", "Low"] as const;
const STATUSES   = ["Backlog", "To Do", "In Progress", "Review", "Done"] as const;

const taskSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },

        category: { type: String, default: "" },
        priority: { type: String, enum: PRIORITIES, default: "Medium" },
        status: { type: String, enum: STATUSES, default: "Backlog" },

        subtasks: [{ 
            name: { type: String, required: true, trim: true },
            completed: { type: Boolean, default: false },
        }],

        comments: [{
            author: { type: Schema.Types.ObjectId, ref: "TeamMembership", required: true },
            content: { type: String, required: true, trim: true },
            createdAt: { type: Date, default: Date.now, required: true },
        }],

        assignees: [{ type: Schema.Types.ObjectId, ref: "TeamMembership" }],

        projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
        teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
        createdBy: { type: String, required: true }
    }, { timestamps: true }
);

export type TaskDocument = InferSchemaType<typeof taskSchema> & { _id: Types.ObjectId };

export const Task = model("Task", taskSchema);