import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AdminSettingsPanel } from "../../../src/frontend/sidebar/AdminSettingsPanel";
import type { AdminUser } from "../../../src/frontend/sidebar/AdminManagementSections";

vi.mock("@termix-ssh/plugin-sdk/ui", async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>();
  const merged: Record<string, unknown> = { ...original };
  const factories: Array<
    (importOriginal: <T = Record<string, unknown>>() => Promise<T>) => unknown
  > = [
    () => ({
      getUserList: vi.fn(async () => ({ users: [], total: 0 })),
      getSessions: vi.fn(async () => ({ sessions: [] })),
      getRoles: vi.fn(async () => ({ roles: [] })),
      getApiKeys: vi.fn(async () => ({ apiKeys: [] })),
      getUserRoles: vi.fn(async () => ({ roles: [] })),
      isElectron: () => false,
    }),
    () => ({}),
    () => ({ getTlsStatus: vi.fn(async () => null) }),
    () => ({}),
    () => ({
      useBranding: () => ({ applyBranding: vi.fn() }),
    }),
    () => ({
      useConfirm: () => vi.fn(async () => true),
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

vi.mock("../../../src/frontend/settings/FeatureSettingsSections", () => ({
  FeatureSettingsSection: () => null,
  featureSectionId: (id: string) => `feature:${id}`,
  useFeatureSettings: () => [],
}));

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

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const { bob, section } = vi.hoisted(() => ({
  bob: {
    id: "u2",
    username: "bob",
    isAdmin: false,
    isExternal: false,
    passwordHash: "hash",
    dataUnlocked: true,
  } as AdminUser,
  section:
    (label: string) =>
    ({ open }: { open: boolean }) =>
      open ? <div>{label}</div> : null,
}));

vi.mock("../../../src/frontend/sidebar/AdminManagementSections", () => ({
  AdminUsersSection: ({
    open,
    onManageUser,
  }: {
    open: boolean;
    onManageUser: (user: AdminUser) => void;
  }) =>
    open ? <button onClick={() => onManageUser(bob)}>manage bob</button> : null,
  AdminSessionsSection: section("sessions section"),
  AdminRolesSection: section("roles section"),
}));

vi.mock("../../../src/frontend/sidebar/AdminSettingsSections", () => ({
  AdminGeneralSettingsSection: section("general section"),
  AdminHostDefaultsSection: section("host defaults section"),
  AdminDatabaseSection: section("database section"),
  AdminSSLSection: section("ssl section"),
}));

vi.mock("../../../src/frontend/sidebar/AdminApiKeysSection", () => ({
  AdminApiKeysSection: section("api keys section"),
}));
vi.mock("../../../src/frontend/sidebar/AdminAuditLogSection", () => ({
  AdminAuditLogSection: section("audit log section"),
}));
vi.mock("../../../src/frontend/sidebar/AdminBrandingSection", () => ({
  AdminBrandingSection: section("branding section"),
}));
vi.mock("../../../src/frontend/sidebar/AdminUserDialogs", () => ({
  AdminCreateUserDialog: () => null,
  AdminEditUserDialog: () => null,
  AdminLinkAccountDialog: () => null,
  AdminUnlinkAccountDialog: () => null,
}));
vi.mock("../../../src/frontend/sidebar/AdminUserManagePanel", () => ({
  AdminUserManagePanel: ({ user }: { user: AdminUser }) => (
    <div>managing {user.username}</div>
  ),
}));

afterEach(cleanup);

describe("AdminSettingsPanel", () => {
  it("leaves the user manage view when another section is selected", async () => {
    const { rerender } = render(<AdminSettingsPanel section="users" />);

    await userEvent.click(screen.getByText("manage bob"));
    expect(screen.getByText("managing bob")).toBeTruthy();

    rerender(<AdminSettingsPanel section="sessions" />);

    expect(screen.getByText("sessions section")).toBeTruthy();
    expect(screen.queryByText("managing bob")).toBeNull();
  });
});
