import { TeamDocument } from "../models/team";
import { TeamMembershipDocument } from "../models/team-memberships";

interface ProjectDetails {
    name: string;
    team: TeamDocument;
    teamMemberships: TeamMembershipDocument[];
    // tasks: TaskDocument[];
    // sprints: SprintDocument[];
}

export const chatAssistantPrompt = (projectDetails: ProjectDetails) => {};