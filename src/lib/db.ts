import mongoose from "mongoose";

import env from "../lib/env";

type Db = NonNullable<typeof mongoose.connection.db>;

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var _mongooseConnection: MongooseCache | undefined;
}

const mongoURI = env.mongoURI;

const cached: MongooseCache =
  global._mongooseConnection ?? (global._mongooseConnection = { conn: null, promise: null });

export const connectDB = async (): Promise<typeof mongoose> => {
  if (cached.conn) return cached.conn;

  if (!cached.promise)
    cached.promise = mongoose
      .connect(mongoURI)
      .then((mongooseInstance) => {
        console.log("Database connected successfully");
        return mongooseInstance;
      })
      .catch((err: unknown) => {
        console.error("Database connection error:", err);
        throw err;
      });

  cached.conn = await cached.promise;

  const { applySchemaValidators } = await import("./schema-validators");
  await applySchemaValidators();

  return cached.conn;
};

export const getDBClient = async (): Promise<Db> => {
  const conn = await connectDB();
  const db = conn.connection.db;

  if (!db) throw new Error("MongoDB database handle unavailable");

  return db;
};
