import type { ProjectDocument } from "../models/project";
import type { SprintDocument } from "../models/sprint";
import type { TaskDocument } from "../models/task";
import type { TeamDocument } from "../models/team";
import type { AuthUser } from "./user";
import type { TeamRole } from "./team";

export type PromptTeamMember = {
  id: string;
  name: string;
  role: TeamRole;
  professionalTitle?: string;
};

export type ProjectDetails = {
  name: string;
  team: TeamDocument;
  tasks: TaskDocument[];
  sprints: SprintDocument[];
};

export type ChatContext = {
  project: ProjectDocument;
  projectDetails: ProjectDetails;
  promptTeamMembers: PromptTeamMember[];
  usersById: Map<string, AuthUser>;
};
