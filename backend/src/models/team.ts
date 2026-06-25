import { Schema, model, type InferSchemaType, type Types } from "mongoose";

const teamSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 100 },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, minlength: 8, maxlength: 8 },
    createdBy: { type: String, ref: "User", required: true },
  },
  { timestamps: true },
);

export type TeamDocument = InferSchemaType<typeof teamSchema> & {
  _id: Types.ObjectId
};

export const Team = model("Team", teamSchema);
