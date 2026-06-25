import { Task } from "../models/task";
import { TASK_AUTH_FIELDS } from "./query-projections";
import { findCallerMembership, isTeamMember } from "./team-access";

export async function assertTaskMember(taskId: string, userId: string) {
  const task = await Task.findById(taskId).select(TASK_AUTH_FIELDS);
  if(!task) throw new Error("Task not found");

  if(!(await isTeamMember(task.teamId, userId))) throw new Error("Task not found");

  return task;
}

export function isTaskAssignee(assignees: string[] | undefined, userId: string) {
  return assignees?.includes(userId) ?? false;
}

export async function assertTaskManagerOrAssignee(taskId: string, userId: string) {
  const task = await Task.findById(taskId).select("teamId assignees");
  if(!task) throw new Error("Task not found");

  const membership = await findCallerMembership(task.teamId, userId);
  if(!membership) throw new Error("Task not found");

  const isManager = membership.role === "manager";
  if(!isManager && !isTaskAssignee(task.assignees, userId)) throw new Error("Forbidden");

  return { task, isManager };
}
