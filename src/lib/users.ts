import { getFirebaseAuth } from "./firebase";
import type { AuthUser } from "../types/user";

const FIREBASE_GET_USERS_BATCH_SIZE = 100;

export async function getUsersByIds(uids: string[]): Promise<Map<string, AuthUser>> {
  const uniqueUids = [...new Set(uids)];
  if (uniqueUids.length === 0) return new Map();

  const auth = getFirebaseAuth();
  const usersById = new Map<string, AuthUser>();

  for (let i = 0; i < uniqueUids.length; i += FIREBASE_GET_USERS_BATCH_SIZE) {
    const chunk = uniqueUids.slice(i, i + FIREBASE_GET_USERS_BATCH_SIZE);
    const { users } = await auth.getUsers(chunk.map((uid) => ({ uid })));

    for (const record of users) {
      usersById.set(record.uid, {
        id: record.uid,
        email: record.email,
        emailVerified: record.emailVerified,
        name: record.displayName,
      });
    }
  }

  return usersById;
}
