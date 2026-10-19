import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Bell, Boxes } from "lucide-react";

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
      usePermissions: () => ({ has: () => true, loaded: true }),
    }),
    () => ({
      getUserPreferences: vi.fn(async () => ({})),
      saveUserPreferences: vi.fn(async () => undefined),
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
import {
  MobileBar,
  pickPrimaryItems,
} from "../../../src/frontend/shell/MobileBar";
import {
  RAIL_ITEMS,
  registerRailItem,
  resetRegisteredRailItems,
} from "@termix-ssh/plugin-sdk/testing-host";

afterEach(() => {
  cleanup();
  resetRegisteredRailItems();
  localStorage.clear();
  delete (window as { IS_ELECTRON?: boolean }).IS_ELECTRON;
});

function renderBar(onRailClick = vi.fn()) {
  render(
    <MobileBar
      railView="hosts"
      sidebarOpen={false}
      username="alice"
      onRailClick={onRailClick}
      onOpenTab={vi.fn()}
      onOpenSettings={vi.fn()}
      onOpenPalette={vi.fn()}
      onLogout={vi.fn()}
    />,
  );
  return onRailClick;
}

describe("MobileBar", () => {
  it("puts flagged items first and caps the bar at four", () => {
    const ids = pickPrimaryItems(RAIL_ITEMS).map((item) => item.id);
    expect(ids.slice(0, 2)).toEqual(["hosts", "quick-connect"]);
    expect(ids).toHaveLength(4);
  });

  it("opens a destination from the bar", () => {
    const onRailClick = renderBar();
    fireEvent.click(screen.getByLabelText("nav.hosts"));
    expect(onRailClick).toHaveBeenCalledWith("hosts");
  });

  it("lists footer items and settings behind More", () => {
    registerRailItem({
      id: "inbox",
      icon: Bell,
      labelKey: "test.inbox",
      placement: "footer",
      pluginId: "demo",
    });
    registerRailItem({
      id: "boxes",
      icon: Boxes,
      labelKey: "test.boxes",
      group: "objects",
      pluginId: "demo",
    });
    renderBar();
    fireEvent.click(screen.getByLabelText("common.more"));
    expect(screen.getByText("test.inbox")).toBeTruthy();
    expect(screen.getByText("nav.settings")).toBeTruthy();
    expect(screen.getByText("nav.group.objects")).toBeTruthy();
  });

  it("leaves logout out of More on the desktop", () => {
    renderBar();
    fireEvent.click(screen.getByLabelText("common.more"));
    expect(screen.getByText("common.logout")).toBeTruthy();
    cleanup();
    (window as { IS_ELECTRON?: boolean }).IS_ELECTRON = true;
    renderBar();
    fireEvent.click(screen.getByLabelText("common.more"));
    expect(screen.queryByText("common.logout")).toBeNull();
  });

  it("leaves out hidden items", () => {
    localStorage.setItem("hiddenRailTabs", JSON.stringify(["hosts"]));
    renderBar();
    expect(screen.queryByLabelText("nav.hosts")).toBeNull();
  });
});
