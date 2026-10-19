import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import type { ActiveSessionInfo } from "@termix-ssh/plugin-sdk/ui";

const mainAxios = vi.hoisted(() => ({
  getActiveSessions: vi.fn(async () => [] as ActiveSessionInfo[]),
  deleteOpenTab: vi.fn(async () => {}),
}));

vi.mock("@termix-ssh/plugin-sdk/ui", async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>();
  const merged: Record<string, unknown> = { ...original };
  const factories: Array<
    (importOriginal: <T = Record<string, unknown>>() => Promise<T>) => unknown
  > = [() => mainAxios];
  for (const factory of factories) {
    Object.assign(
      merged,
      await factory((async () => ({ ...merged })) as never),
    );
  }
  return merged;
});

vi.mock("react-i18next", async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>();
  const merged: Record<string, unknown> = { ...original };
  const factories: Array<
    (importOriginal: <T = Record<string, unknown>>() => Promise<T>) => unknown
  > = [
    () => ({
      useTranslation: () => ({
        t: (key: string, opts?: Record<string, unknown>) =>
          opts ? `${key}:${JSON.stringify(opts)}` : key,
      }),
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
      useTranslation: () => ({
        t: (key: string, opts?: Record<string, unknown>) =>
          opts ? `${key}:${JSON.stringify(opts)}` : key,
      }),
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

import { ConnectionsPanel } from "../../../src/frontend/sidebar/ConnectionsPanel";
import {
  registerSlotContribution,
  resetActionRegistry,
} from "@termix-ssh/plugin-sdk/testing-host";

beforeEach(() => {
  mainAxios.getActiveSessions.mockReset();
  mainAxios.getActiveSessions.mockResolvedValue([]);
  mainAxios.deleteOpenTab.mockReset();
  resetActionRegistry();
});

afterEach(() => {
  cleanup();
});

function renderPanel() {
  return render(
    <ConnectionsPanel
      tabs={[]}
      activeTabId=""
      allHosts={[]}
      backgroundTabRecords={[]}
      onSwitchToTab={() => {}}
      onCloseTab={() => {}}
      onReopenTab={() => {}}
      onForgetBackground={() => {}}
    />,
  );
}

describe("ConnectionsPanel - plugin sections", () => {
  it("renders what plugins add to connections.sections, even with no tabs", async () => {
    const Section = vi.fn(({ search }: { search?: string }) => (
      <div>plugin section {JSON.stringify(search)}</div>
    ));
    registerSlotContribution("connections.sections", {
      actionId: "demo.section",
      titleKey: "demo.section",
      kind: "component",
      component: Section as never,
    });

    renderPanel();

    await waitFor(() => {
      expect(screen.getByText('plugin section ""')).toBeTruthy();
    });
    expect(screen.getByText("connections.noConnections")).toBeTruthy();
  });

  it("renders only the empty state without plugin sections", async () => {
    renderPanel();
    await waitFor(() => {
      expect(mainAxios.getActiveSessions).toHaveBeenCalled();
    });
    expect(screen.getByText("connections.noConnections")).toBeTruthy();
  });
});
