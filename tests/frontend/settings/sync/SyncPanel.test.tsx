import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SyncStatus } from "@termix-ssh/plugin-sdk/ui";

const status = vi.hoisted(() => ({ value: null as SyncStatus | null }));
const api = vi.hoisted(() => ({
  getSyncConflicts: vi.fn(async () => []),
  getSyncErrors: vi.fn(async () => []),
  updateSyncSettings: vi.fn(),
  syncNow: vi.fn(),
  unlinkServer: vi.fn(),
  retrySyncErrors: vi.fn(),
  settleSyncConflict: vi.fn(),
  probeServer: vi.fn(),
  getLinkPreview: vi.fn(),
  completeLink: vi.fn(),
  reloginLink: vi.fn(),
}));

vi.mock("@termix-ssh/plugin-sdk/ui", async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>();
  const merged: Record<string, unknown> = { ...original };
  const factories: Array<
    (importOriginal: <T = Record<string, unknown>>() => Promise<T>) => unknown
  > = [
    () => ({
      useSyncStatus: () => status.value,
    }),
    () => ({
      setSyncStatus: vi.fn(),
      refreshSyncStatus: vi.fn(),
    }),
    () => ({ notifySyncChanged: vi.fn() }),
    () => ({
      invalidateServerStatusCache: vi.fn(),
    }),
    () => api,
    () => ({ ElectronLoginForm: () => null }),
  ];
  for (const factory of factories) {
    Object.assign(
      merged,
      await factory((async () => ({ ...merged })) as never),
    );
  }
  return merged;
});
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
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

const { SyncPanel } =
  await import("../../../../src/frontend/settings/sync/SyncPanel");

beforeEach(() => {
  (window as unknown as { electronAPI: unknown }).electronAPI = {
    invoke: vi.fn(async () => null),
  };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const LINKED: SyncStatus = {
  linked: true,
  serverUrl: "https://termix.example",
  serverName: "Home",
  account: { username: "luke" },
  status: "idle",
  lastSyncAt: new Date().toISOString(),
  pending: 0,
  conflicts: 0,
  errors: 0,
  entities: [
    {
      type: "hosts",
      owner: "core",
      ownerName: null,
      readOnly: false,
      onServer: true,
      onDevice: true,
      enabled: true,
    },
    {
      type: "snippets",
      owner: "snippets",
      ownerName: "Snippets",
      readOnly: false,
      onServer: true,
      onDevice: true,
      enabled: false,
    },
  ],
};

describe("SyncPanel", () => {
  it("explains this-device-only use and offers to link", () => {
    status.value = { linked: false, entities: [] };
    render(<SyncPanel />);
    expect(screen.getByText("sync.unlinkedTitle")).toBeTruthy();
    fireEvent.click(screen.getByText("sync.linkButton"));
    expect(screen.getByText("sync.wizard.title")).toBeTruthy();
  });

  it("shows the account, server and what syncs, grouped by feature", () => {
    status.value = LINKED;
    render(<SyncPanel />);
    expect(screen.getByText("Home")).toBeTruthy();
    expect(screen.getByText("luke")).toBeTruthy();
    expect(screen.getByText("sync.coreGroup")).toBeTruthy();
    expect(screen.getByText("Snippets")).toBeTruthy();
  });

  it("switches a kind of data off, keeping the others as they are", async () => {
    status.value = LINKED;
    api.updateSyncSettings.mockResolvedValue(LINKED);
    render(<SyncPanel />);
    const switches = screen.getAllByRole("switch");
    fireEvent.click(switches[0]);
    await waitFor(() =>
      expect(api.updateSyncSettings).toHaveBeenCalledWith({
        disabledTypes: expect.arrayContaining(["snippets", "hosts"]),
      }),
    );
  });

  it("asks to sign in again when the server ended the session", () => {
    status.value = { ...LINKED, status: "signed_out" };
    render(<SyncPanel />);
    expect(screen.getByText("sync.state.signedOut")).toBeTruthy();
    expect(screen.getByText("sync.signInAgain")).toBeTruthy();
    expect(screen.queryByText("sync.syncNow")).toBeNull();
  });
});
