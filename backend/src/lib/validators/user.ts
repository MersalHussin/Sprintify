import countries from "../../constants/countries.json";

import { date, objectId, stringField, type JsonSchema } from "./primitives";

const TIMEZONES = Intl.supportedValuesOf("timeZone");
const COUNTRIES = countries.map(({ value }) => value);
const GENDERS = ["male", "female", "prefer-not-to-say"] as const;

export const userValidator: JsonSchema = {
  bsonType: "object",
  required: [
    "uid",
    "firstName",
    "lastName",
    "professionalTitle",
    "gender",
    "timezone",
    "country",
    "createdAt",
    "updatedAt",
  ],
  properties: {
    _id: objectId,
    uid: stringField(128),
    firstName: stringField(50),
    lastName: stringField(50),
    professionalTitle: stringField(100),
    gender: { enum: [...GENDERS] },
    timezone: { enum: TIMEZONES },
    country: { enum: COUNTRIES },
    createdAt: date,
    updatedAt: date,
  },
  additionalProperties: false,
};
