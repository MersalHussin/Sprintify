export type SprintStatus = "active" | "completed";

export type SprintCreateInput = {
  name: string;
  goal?: string;
  startDate?: Date;
  endDate?: Date;
};

export type SprintUpdateInput = Partial<SprintCreateInput>;
