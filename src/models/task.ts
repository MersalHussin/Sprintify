import { Schema, model, type InferSchemaType, type Types } from "mongoose";

export const PRIORITIES = ["Urgent", "High", "Medium", "Low"] as const;
export const STATUSES   = ["Backlog", "To Do", "In Progress", "Review", "Done"] as const;

const taskSchema = new Schema(
    {
        name: { type: String, required: true, trim: true, minlength: 1, maxlength: 200 },
        description: { type: String, trim: true, maxlength: 2500 },

        priority: { type: String, enum: PRIORITIES, default: "Medium" },
        status: { type: String, enum: STATUSES, default: "Backlog" },
        category: { type: String, required: false, maxlength: 100 },

        subtasks: {
            type: [{
                name: { type: String, required: true, trim: true, minlength: 1, maxlength: 200 },
                completed: { type: Boolean, default: false },
            }],
            default: [],
            validate: {
                validator: (value: unknown[]) => value.length <= 100,
                message: "A task cannot have more than 100 subtasks",
            },
        },

        assignees: {
            type: [{ type: String, ref: "User" }],
            default: [],
            validate: {
                validator: (value: unknown[]) => value.length <= 50,
                message: "A task cannot have more than 50 assignees",
            },
        },

        projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
        teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
        sprintId: { type: Schema.Types.ObjectId, ref: "Sprint" },
        createdBy: { type: String, ref: "User", required: true }
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