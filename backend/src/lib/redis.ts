import { createClient, type RedisClientType } from 'redis';
import env from './env';

declare global {
    var _redisClient: RedisClientType | undefined;
}

export async function getRedis(): Promise<RedisClientType> {
    if(global._redisClient?.isOpen) return global._redisClient;

    const client = global._redisClient ?? (global._redisClient = createClient({ url: env.redisURL }));
    client.on("error", (err) => console.error("Redis error:", err));
    
    await client.connect();
    console.log("Redis connected successfully");
    return global._redisClient;
}