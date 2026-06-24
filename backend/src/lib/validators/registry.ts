import { Invitation } from "../../models/invitation";
import { Project } from "../../models/project";
import { Sprint } from "../../models/sprint";
import { Task } from "../../models/task";
import { TaskComment } from "../../models/task-comment";
import { Team } from "../../models/team";
import { TeamMembership } from "../../models/team-memberships";
import { User } from "../../models/user";

import { invitationValidator } from "./invitation";
import { projectValidator } from "./project";
import type { JsonSchema } from "./primitives";
import { sprintValidator } from "./sprint";
import { taskCommentValidator } from "./task-comment";
import { taskValidator } from "./task";
import { teamMembershipValidator } from "./team-membership";
import { teamValidator } from "./team";
import { userValidator } from "./user";

export type CollectionValidator = {
  model: { collection: { name: string } };
  schema: JsonSchema;
};

export const COLLECTION_VALIDATORS: CollectionValidator[] = [
  { model: User, schema: userValidator },
  { model: Team, schema: teamValidator },
  { model: TeamMembership, schema: teamMembershipValidator },
  { model: Project, schema: projectValidator },
  { model: Task, schema: taskValidator },
  { model: Sprint, schema: sprintValidator },
  { model: Invitation, schema: invitationValidator },
  { model: TaskComment, schema: taskCommentValidator },
];
