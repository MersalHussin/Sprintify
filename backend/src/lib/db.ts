import dns from "dns";
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

if (mongoURI.startsWith("mongodb+srv://")) dns.setServers(["8.8.8.8", "1.1.1.1"]);

const cached: MongooseCache =
  global._mongooseConnection ?? (global._mongooseConnection = { conn: null, promise: null });

export const connectDB = async (): Promise<typeof mongoose> => {
  if(mongoose.connection.readyState === 1) {
    cached.conn = mongoose;
    return mongoose;
  }

  if(cached.conn) return cached.conn;

  if(!cached.promise)
    cached.promise = mongoose
      .connect(mongoURI, {
        maxPoolSize: 20,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
      })
      .then((mongooseInstance) => {
        console.log("Database connected successfully");
        return mongooseInstance;
      })
      .catch((err: unknown) => {
        console.error("Database connection error:", err);
        throw err;
      });

  cached.conn = await cached.promise;

  const { applySchemaValidators } = await import("./validators");
  await applySchemaValidators();

  return cached.conn;
};

export const getDBClient = async (): Promise<Db> => {
  const conn = await connectDB();
  const db = conn.connection.db;

  if(!db) throw new Error("MongoDB database handle unavailable");

  return db;
};
