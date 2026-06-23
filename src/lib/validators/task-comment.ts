import { date, objectId, stringField, type JsonSchema } from "./primitives";

export const taskCommentValidator: JsonSchema = {
  bsonType: "object",
  required: ["taskId", "author", "content", "createdAt"],
  properties: {
    _id: objectId,
    taskId: objectId,
    author: stringField(128),
    content: stringField(5000),
    createdAt: date,
  },
  additionalProperties: false,
};
