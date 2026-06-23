import { Schema, model, type InferSchemaType, type Types } from "mongoose";

const taskCommentSchema = new Schema(
  {
    taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    author: { type: String, ref: "User", required: true },
    content: { type: String, required: true, trim: true, minlength: 1, maxlength: 5000 },
    createdAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: false },
);

taskCommentSchema.index({ taskId: 1, createdAt: -1 });

export type TaskCommentDocument = InferSchemaType<typeof taskCommentSchema> & {
  _id: Types.ObjectId;
};

export const TaskComment = model("TaskComment", taskCommentSchema);
