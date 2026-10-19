import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("react-i18next", async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>();
  const merged: Record<string, unknown> = { ...original };
  const factories: Array<
    (importOriginal: <T = Record<string, unknown>>() => Promise<T>) => unknown
  > = [
    () => ({
      useTranslation: () => ({ t: (key: string) => key }),
    }),
  ];
  for (const factory of factories) {
    Object.assign(
      merged,
      await factory((async () => ({ ...merged })) as never),
    );
  }
  return merged;
});
vi.mock("@termix-ssh/plugin-sdk/frontend", async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>();
  const merged: Record<string, unknown> = { ...original };
  const factories: Array<
    (importOriginal: <T = Record<string, unknown>>() => Promise<T>) => unknown
  > = [
    () => ({
      useTranslation: () => ({ t: (key: string) => key }),
    }),
  ];
  for (const factory of factories) {
    Object.assign(
      merged,
      await factory((async () => ({ ...merged })) as never),
    );
  }
  return merged;
});
vi.mock("@termix-ssh/plugin-sdk/ui", async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>();
  const merged: Record<string, unknown> = { ...original };
  const factories: Array<
    (importOriginal: <T = Record<string, unknown>>() => Promise<T>) => unknown
  > = [
    () => ({
      getHostAccess: vi.fn(async () => ({ accessList: [] })),
      getUserList: vi.fn(async () => ({
        users: [
          { userId: "me", username: "admin" },
          { userId: "u2", username: "bob" },
        ],
      })),
      getUserInfo: vi.fn(async () => ({ userId: "me", username: "admin" })),
      getRoles: vi.fn(async () => ({ roles: [] })),
      shareHost: vi.fn(),
      shareFolder: vi.fn(),
      updateHostAccess: vi.fn(),
      revokeHostAccess: vi.fn(),
    }),
  ];
  for (const factory of factories) {
    Object.assign(
      merged,
      await factory((async () => ({ ...merged })) as never),
    );
  }
  return merged;
});

import { SurfaceScope } from "@termix-ssh/plugin-sdk/ui";
import { HostShareModal } from "../../../src/frontend/sidebar/HostShareModal";
import type { Host } from "@termix-ssh/plugin-sdk/ui";

describe("HostShareModal", () => {
  it("does not offer the current user as someone to share with", async () => {
    render(
      <SurfaceScope>
        <HostShareModal
          open
          onClose={() => {}}
          host={{ id: 1, name: "web" } as unknown as Host}
        />
      </SurfaceScope>,
    );
    expect(await screen.findByText("bob")).toBeTruthy();
    expect(screen.queryByText("admin")).toBeNull();
  });
});
