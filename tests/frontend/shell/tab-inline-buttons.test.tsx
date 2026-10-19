import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { Share2 } from "lucide-react";
import type { Tab } from "@termix-ssh/plugin-sdk/ui";
import {
  declareActionSlot,
  registerAction,
  registerSlotContribution,
  resetActionRegistry,
  setPermissionsForTesting,
  trackTabHandle,
} from "@termix-ssh/plugin-sdk/testing-host";

vi.mock("@termix-ssh/plugin-sdk/frontend", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useTranslation: () => ({ t: (key: string) => key, language: "en" }),
}));
vi.mock("react-i18next", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@termix-ssh/plugin-sdk/ui", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  isElectron: () => true,
}));

import { TabBar } from "../../../src/frontend/shell/TabBar";

beforeEach(() => setPermissionsForTesting([], true));

afterEach(() => {
  cleanup();
  resetActionRegistry();
});

describe("tab inline buttons", () => {
  it("show as soon as the tab's handle attaches", () => {
    declareActionSlot({ id: "tab.inline", accepts: ["button"] });
    registerAction("test.share", () => {});
    registerSlotContribution("tab.inline", {
      actionId: "test.share",
      titleKey: "share",
      icon: Share2,
      when: (context: Record<string, unknown>) =>
        typeof (context.handle as { getShareTarget?: unknown } | undefined)
          ?.getShareTarget === "function",
    });
    const terminalRef = createRef<unknown>();
    const tabs = [
      { id: "terminal-1", type: "terminal", label: "web-01", terminalRef },
    ] as unknown as Tab[];

    render(
      <TabBar
        tabs={tabs}
        activeTabId="terminal-1"
        splits={[]}
        activeSplitFull={false}
        onSetActiveTab={() => {}}
        onCloseTab={() => {}}
        onRefreshTab={() => {}}
        onReorderTabs={() => {}}
        onSplitAction={() => {}}
        isAppFullscreen={false}
        onToggleAppFullscreen={() => {}}
      />,
    );
    expect(screen.queryByTitle("share")).toBeNull();

    const attach = trackTabHandle(terminalRef) as (value: unknown) => void;
    act(() => attach({ getShareTarget: () => null }));
    expect(screen.getByTitle("share")).toBeTruthy();
  });
});
