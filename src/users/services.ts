import { User, type UserDocument } from "../models/user";
import { TeamMembership } from "../models/team-memberships";
import { getFirebaseAuth } from "../lib/firebase";
import { USER_DISPLAY_FIELDS } from "../lib/query-projections";
import { toAuthUser } from "../lib/users";
import type { AuthUser } from "../types/user";

export type UserProfileUpdate = Partial<
  Pick<UserDocument, "firstName" | "lastName" | "professionalTitle" | "gender" | "timezone" | "country">
>;

const PROFILE_FIELDS = [
  "firstName",
  "lastName",
  "professionalTitle",
  "gender",
  "timezone",
  "country",
] as const satisfies ReadonlyArray<keyof UserProfileUpdate>;

function pickProfileFields(data: UserProfileUpdate): UserProfileUpdate {
  return Object.fromEntries(
    PROFILE_FIELDS.filter((key) => data[key] !== undefined).map((key) => [key, data[key]]),
  ) as UserProfileUpdate;
}

export const getMeService = async (userId: string) => {
  const user = await User.findOne({ uid: userId });
  if(!user) throw new Error("User not found");
  return user;
};

export const updateMeService = async (userId: string, data: UserProfileUpdate) => {
  const fields = pickProfileFields(data);
  const existing = await User.findOne({ uid: userId });

  if(!existing) {
    return User.create({ uid: userId, ...fields });
  }

  if(Object.keys(fields).length === 0) return existing;

  const updated = await User.findOneAndUpdate({ uid: userId }, fields, { new: true, runValidators: true });
  if(!updated) throw new Error("User not found");
  return updated;
};

export const deleteMeService = async (userId: string) => {
  await TeamMembership.deleteMany({ userId });
  const result = await User.deleteOne({ uid: userId });
  if(result.deletedCount === 0) throw new Error("User not found");
  await getFirebaseAuth().deleteUser(userId);
};

export const getUserByIdService = async (callerId: string, userId: string): Promise<AuthUser> => {
  if(callerId !== userId) {
    const callerTeamIds = await TeamMembership.find({ userId: callerId }).distinct("teamId");
    if(callerTeamIds.length === 0) throw new Error("User not found");

    // { userId, teamId: { $in } } uses the { userId: 1, teamId: 1 } compound index.
    const isTeammate = await TeamMembership.exists({ teamId: { $in: callerTeamIds }, userId });
    if(!isTeammate) throw new Error("User not found");
  }

  const user = await User.findOne({ uid: userId }).select(USER_DISPLAY_FIELDS);
  if(!user) throw new Error("User not found");
  return toAuthUser(user);
};
