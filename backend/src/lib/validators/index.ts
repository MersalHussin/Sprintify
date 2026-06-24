import { getDBClient } from "../db";

import { COLLECTION_VALIDATORS } from "./registry";

const VALIDATION_OPTIONS = {
  validationLevel: "moderate" as const,
  validationAction: "warn" as const,
};

export async function applySchemaValidators(): Promise<void> {
  const db = await getDBClient();

  for (const { model, schema } of COLLECTION_VALIDATORS) {
    const collectionName = model.collection.name;
    const validator = { $jsonSchema: schema };

    try {
      await db.command({
        collMod: collectionName,
        validator,
        ...VALIDATION_OPTIONS,
      });
    } catch (error) {
      const mongoError = error as { codeName?: string };
      if(mongoError.codeName !== "NamespaceNotFound") throw error;

      await db.createCollection(collectionName, {
        validator,
        ...VALIDATION_OPTIONS,
      });
    }
  }

  console.log("MongoDB schema validators applied");
}

export { COLLECTION_VALIDATORS } from "./registry";
