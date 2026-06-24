/**
 * Shared MongoDB field projections — limit document size on hot read paths.
 */
export const USER_DISPLAY_FIELDS = "uid firstName lastName professionalTitle" as const;

export const TASK_CONTEXT_FIELDS =
  "_id name description status priority category assignees subtasks" as const;

export const SPRINT_CONTEXT_FIELDS =
  "name status startDate endDate goal completedAt" as const;

/** Auth checks only need teamId; avoids loading subtasks/comments on mutation paths. */
export const TASK_AUTH_FIELDS = "teamId" as const;

/** Membership middleware needs role only after the document is found. */
export const MEMBERSHIP_ROLE_FIELDS = "role" as const;

/** Team roster listing before populate hydrates user display fields. */
export const MEMBERSHIP_LIST_FIELDS = "userId role joinedAt" as const;
