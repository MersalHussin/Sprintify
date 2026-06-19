import { Schema, model, type InferSchemaType, type Types } from "mongoose";

const teamSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true },
);

export type TeamDocument = InferSchemaType<typeof teamSchema> & { _id: Types.ObjectId };

export const Team = model("Team", teamSchema);
