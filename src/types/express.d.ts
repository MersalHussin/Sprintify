import type { AuthUser } from "./user";
import type { TeamDocument } from "../models/team";
import type { ProjectDocument } from "../models/project";
import type { TeamMember, TeamRole } from "./team";
import type { ProjectDetails, PromptTeamMember } from "../constants/chat-assistant-prompt";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      team?: TeamDocument;
      teamMembers?: TeamMember[];
      callerMembership?: Pick<TeamMember, "role">;
      project?: ProjectDocument;
      projectDetails?: ProjectDetails;
      promptTeamMembers?: PromptTeamMember[];
      usersById?: Map<string, AuthUser>;
    }
  }
}