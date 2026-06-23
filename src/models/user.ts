import { Schema, model, type InferSchemaType, type Types } from "mongoose";
import countries from "../constants/countries.json";

const TIMEZONES = Intl.supportedValuesOf("timeZone");
const COUNTRIES = countries.map(({ value }) => value);
const GENDERS   = ["male", "female", "prefer-not-to-say"] as const;

const userSchema = new Schema(
    {
        uid: { type: String, required: true },

        firstName: { type: String, required: true, trim: true, minlength: 1, maxlength: 50 },
        lastName: { type: String, required: true, trim: true, minlength: 1, maxlength: 50 },
        professionalTitle: { type: String, required: true, trim: true, minlength: 1, maxlength: 100 },
        
        gender: { type: String, enum: GENDERS, required: true },
        timezone: { type: String, enum: TIMEZONES, required: true },
        country: { type: String, enum: COUNTRIES, required: true },
    }, { timestamps: true }
);

userSchema.index({ uid: 1 }, { unique: true });

export type UserDocument = InferSchemaType<typeof userSchema>;

export const User = model("User", userSchema);