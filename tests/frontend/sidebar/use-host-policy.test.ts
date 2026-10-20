import { beforeEach, describe, expect, it, vi } from "vitest";

const getHostPolicy = vi.hoisted(() => vi.fn());
vi.mock("@termix-ssh/plugin-sdk/ui", () => ({ getHostPolicy }));

const { loadHostPolicy, resetHostPolicy } =
  await import("../../../src/frontend/sidebar/use-host-policy");

beforeEach(() => {
  resetHostPolicy();
  getHostPolicy.mockReset();
});

describe("host policy", () => {
  it("loads once and caches the answer", async () => {
    getHostPolicy.mockResolvedValue({
      manualCreate: false,
      blockedBy: "Config",
    });
    expect(await loadHostPolicy()).toEqual({
      manualCreate: false,
      blockedBy: "Config",
    });
    await loadHostPolicy();
    expect(getHostPolicy).toHaveBeenCalledTimes(1);
  });

  it("leaves adding open when the server can't answer", async () => {
    getHostPolicy.mockRejectedValue(new Error("offline"));
    expect(await loadHostPolicy()).toEqual({ manualCreate: true });
  });
});
