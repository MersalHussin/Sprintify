import { describe, expect, it, vi } from "vitest";

import { handleResponse } from "../../src/lib/response-handler";

describe("handleResponse", () => {
  it("returns the standard envelope with data", () => {
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));

    handleResponse({ status } as never, 200, { ok: true });

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      status: "OK",
      message: "OK",
      data: { ok: true },
    });
  });

  it("omits data when undefined", () => {
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));

    handleResponse({ status } as never, 404, undefined, "Not found");

    expect(json).toHaveBeenCalledWith({
      status: "NOT_FOUND",
      message: "Not found",
    });
  });
});
