import { attachCommentCounts } from "../tasks/services";
import { User, type UserDocument } from "../models/user";
import { Project } from "../models/project";
import { Task } from "../models/task";
import { TeamMembership } from "../models/team-memberships";
import { getFirebaseAuth } from "../lib/firebase";
import { TASK_CONTEXT_FIELDS, USER_DISPLAY_FIELDS } from "../lib/query-projections";
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

export const getMyTasksService = async (userId: string) => {
  const teamIds = await TeamMembership.find({ userId }).distinct("teamId");
  if(teamIds.length === 0) return { groups: [] };

  const tasks = await Task.find({
    assignees: userId,
    teamId: { $in: teamIds },
  }).select(`${TASK_CONTEXT_FIELDS} projectId`);

  const projectIds = [...new Set(tasks.map((task) => task.projectId.toString()))];
  const projects = await Project.find({ _id: { $in: projectIds } }).select("_id name");
  const projectById = new Map(projects.map((project) => [project._id.toString(), project]));

  const grouped = new Map<string, { project: { _id: string; name: string }; tasks: typeof tasks }>();

  for(const task of tasks) {
    const projectId = task.projectId.toString();
    const project = projectById.get(projectId);
    if(!project) continue;

    if(!grouped.has(projectId)) {
      grouped.set(projectId, {
        project: { _id: projectId, name: project.name },
        tasks: [],
      });
    }
    grouped.get(projectId)!.tasks.push(task);
  }

  const groups = await Promise.all(
    [...grouped.values()].map(async (group) => ({
      ...group,
      tasks: await attachCommentCounts(group.tasks),
    })),
  );

  return { groups };
};

export const getUserByIdService = async (callerId: string, userId: string): Promise<AuthUser> => {
  if(callerId !== userId) {
    const callerTeamIds = await TeamMembership.find({ userId: callerId }).distinct("teamId");
    if(callerTeamIds.length === 0) throw new Error("User not found");

    const isTeammate = await TeamMembership.exists({ teamId: { $in: callerTeamIds }, userId });
    if(!isTeammate) throw new Error("User not found");
  }

  const user = await User.findOne({ uid: userId }).select(USER_DISPLAY_FIELDS);
  if(!user) throw new Error("User not found");
  return toAuthUser(user);
};
