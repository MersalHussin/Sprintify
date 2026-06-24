import { describe, expect, it } from "vitest";

import { buildPaginatedResult, parseOptionalPagination } from "../../src/lib/pagination";

describe("parseOptionalPagination", () => {
  it("returns null when page and limit are omitted", () => {
    expect(parseOptionalPagination({})).toBeNull();
  });

  it("parses page and limit with defaults", () => {
    expect(parseOptionalPagination({ page: "2", limit: "10" })).toEqual({
      page: 2,
      limit: 10,
      skip: 10,
    });
  });

  it("caps limit at maxLimit", () => {
    expect(parseOptionalPagination({ limit: "999" }, { maxLimit: 100 })?.limit).toBe(100);
  });
});

describe("buildPaginatedResult", () => {
  it("computes totalPages", () => {
    const result = buildPaginatedResult(["a", "b"], 25, { page: 2, limit: 10, skip: 10 });
    expect(result.pagination.totalPages).toBe(3);
    expect(result.items).toHaveLength(2);
  });
});
