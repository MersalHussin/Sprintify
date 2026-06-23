/** Fields loaded for AI prompts and member display — avoids over-fetching profile data. */
export const USER_DISPLAY_FIELDS = "uid firstName lastName" as const;

export const TASK_CONTEXT_FIELDS =
  "_id name description status priority category assignees subtasks" as const;

export const SPRINT_CONTEXT_FIELDS =
  "name status startDate endDate goal completedAt" as const;
