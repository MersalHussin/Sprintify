import { Task } from "../models/task";
import { TASK_AUTH_FIELDS } from "./query-projections";
import { isTeamMember } from "./team-access";

/** Validates task existence and caller team membership without loading full task payloads. */
export async function assertTaskMember(taskId: string, userId: string) {
  const task = await Task.findById(taskId).select(TASK_AUTH_FIELDS);
  if(!task) throw new Error("Task not found");

  if(!(await isTeamMember(task.teamId, userId))) throw new Error("Task not found");

  return task;
}
