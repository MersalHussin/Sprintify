import { User, type UserDocument } from "../models/user";
import { getFirebaseAuth } from "./firebase";
import { USER_DISPLAY_FIELDS } from "./query-projections";
import type { AuthUser } from "../types/user";

const FIREBASE_GET_USERS_BATCH_SIZE = 100;

export type UserDisplayDocument = Pick<UserDocument, "uid" | "firstName" | "lastName" | "professionalTitle">;

export function populateUserField(path: string, select: string = USER_DISPLAY_FIELDS) {
  return { path, select };
}

export async function getUsersByUids(
  uids: string[],
  select: string = USER_DISPLAY_FIELDS,
): Promise<Map<string, UserDisplayDocument>> {
  const uniqueUids = [...new Set(uids)];
  if(uniqueUids.length === 0) return new Map();

  const users = await User.find({ uid: { $in: uniqueUids } }).select(select);
  const usersByUid = new Map<string, UserDisplayDocument>();

  for (const user of users) {
    usersByUid.set(user.uid, user);
  }

  return usersByUid;
}

export function userDisplayName(user: Pick<UserDocument, "firstName" | "lastName">): string {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function toAuthUser(user: UserDisplayDocument): AuthUser {
  return {
    id: user.uid,
    name: userDisplayName(user),
    professionalTitle: user.professionalTitle,
  };
}

export async function getUsersByIds(uids: string[]): Promise<Map<string, AuthUser>> {
  const uniqueUids = [...new Set(uids)];
  if(uniqueUids.length === 0) return new Map();

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
