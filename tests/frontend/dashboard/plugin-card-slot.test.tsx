import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import {
  registerDashboardCard,
  resetDashboardCards,
  resetPluginStore,
  setPluginSummaries,
} from "@termix-ssh/plugin-sdk/testing-host";

vi.mock("@termix-ssh/plugin-sdk/frontend", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useTranslation: () => ({ t: (key: string) => key, language: "en" }),
}));

import { PluginCardSlot } from "../../../src/frontend/dashboard/DashboardTab";

afterEach(() => {
  cleanup();
  resetDashboardCards();
  resetPluginStore();
});

function owner(enabled = true) {
  return {
    id: "gizmo",
    name: "Gizmo",
    version: "1.0.0",
    enabled,
    state: "active",
    frontend: true,
    contributes: {
      dashboardCards: [{ id: "gizmo-card", titleKey: "t" }],
    },
  } as never;
}

describe("PluginCardSlot", () => {
  it("keeps a dashboard card's slot while its plugin is off", () => {
    setPluginSummaries([owner(false)]);
    const view = render(
      <PluginCardSlot
        id="gizmo-card"
        isVisible
        onOpenSingletonTab={() => {}}
      />,
    );
    expect(screen.getByTestId("plugin-view-placeholder").dataset.status).toBe(
      "disabled",
    );

    act(() => {
      setPluginSummaries([owner()]);
      registerDashboardCard({
        id: "gizmo-card",
        pluginId: "gizmo",
        titleKey: "t",
        component: () => <span>gizmo card</span>,
      });
    });
    view.rerender(
      <PluginCardSlot
        id="gizmo-card"
        isVisible
        onOpenSingletonTab={() => {}}
      />,
    );
    expect(screen.getByText("gizmo card")).toBeTruthy();
  });
});
