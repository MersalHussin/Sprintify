export const objectId = { bsonType: "objectId" } as const;
export const date = { bsonType: "date" } as const;

export const stringField = (maxLength: number, minLength = 1) => ({
  bsonType: "string",
  minLength,
  maxLength,
});

export type JsonSchema = Record<string, unknown>;
