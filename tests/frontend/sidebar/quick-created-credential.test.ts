import { describe, expect, it } from "vitest";
import { toCredentialOption } from "../../../src/frontend/sidebar/quick-created-credential";

describe("toCredentialOption", () => {
  it("normalizes a newly created credential for immediate selection", () => {
    expect(
      toCredentialOption({ id: 42, name: "Production", username: "root" }),
    ).toEqual({ id: "42", name: "Production", username: "root" });
  });

  it("rejects a malformed create response", () => {
    expect(toCredentialOption({ name: "Missing ID" })).toBeNull();
  });
});
