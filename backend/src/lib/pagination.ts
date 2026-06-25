export type PaginationParams = {
  page: number;
  limit: number;
  skip: number;
};

export type PaginatedResult<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type PaginationDefaults = {
  page: number;
  limit: number;
  maxLimit: number;
};

const DEFAULTS: PaginationDefaults = { page: 1, limit: 50, maxLimit: 200 };

export function parseOptionalPagination(
  query: Record<string, unknown>,
  defaults: Partial<PaginationDefaults> = {},
): PaginationParams | null {
  const { page: defaultPage, limit: defaultLimit, maxLimit } = { ...DEFAULTS, ...defaults };
  const hasPage = query.page !== undefined && query.page !== "";
  const hasLimit = query.limit !== undefined && query.limit !== "";
  if(!hasPage && !hasLimit) return null;

  const page = Math.max(1, Number(query.page) || defaultPage);
  const limit = Math.min(maxLimit, Math.max(1, Number(query.limit) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}

export function buildPaginatedResult<T>(
  items: T[],
  total: number,
  params: PaginationParams,
): PaginatedResult<T> {
  return {
    items,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / params.limit)),
    },
  };
}
