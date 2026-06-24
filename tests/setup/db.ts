import { afterAll, afterEach, beforeAll } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongo: MongoMemoryServer | undefined;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create({
    binary: { version: "6.0.19" },
  });
  process.env.MONGODB_URI = mongo.getUri();
  await mongoose.connect(mongo.getUri());
}, 300_000);

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const collection of Object.values(collections)) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if(mongo) await mongo.stop();
});
