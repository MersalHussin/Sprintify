import type { AuthUser } from "./user";
import type { TeamDocument } from "../models/team";
import type { ProjectDocument } from "../models/project";
import type { SprintDocument } from "../models/sprint";
import type { TaskDocument } from "../models/task";
import type { TeamMember, TeamRole } from "./team";
import type { ProjectDetails, PromptTeamMember } from "./project-context";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      team?: TeamDocument;
      teamMembers?: TeamMember[];
      callerMembership?: Pick<TeamMember, "role">;
      project?: ProjectDocument;
      task?: TaskDocument;
      sprint?: SprintDocument;
      projectDetails?: ProjectDetails;
      promptTeamMembers?: PromptTeamMember[];
      usersById?: Map<string, AuthUser>;
    }
  }
}