export type SprintStatus = "active" | "completed";

/** Client-writable sprint fields; server assigns projectId, teamId, status, completedAt. */
export type SprintCreateInput = {
  name: string;
  goal?: string;
  startDate?: Date;
  endDate?: Date;
};

export type SprintUpdateInput = Partial<SprintCreateInput>;
