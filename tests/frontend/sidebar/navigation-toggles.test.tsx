import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  registerRailItem,
  resetRegisteredRailItems,
} from "@termix-ssh/plugin-sdk/testing-host";

vi.mock("@termix-ssh/plugin-sdk/frontend", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useTranslation: () => ({ t: (key: string) => key, language: "en" }),
}));
vi.mock("react-i18next", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { NavigationVisibilityToggles } from "../../../src/frontend/sidebar/NavigationVisibilityToggles";

afterEach(() => {
  cleanup();
  resetRegisteredRailItems();
});

function addFixtureItem() {
  return registerRailItem({
    id: "fixture-panel",
    icon: (() => null) as never,
    labelKey: "Fixture title",
    pluginId: "fixture",
  });
}

describe("NavigationVisibilityToggles", () => {
  it("lists a rail item a plugin registered and toggles it", () => {
    addFixtureItem();
    const onChange = vi.fn();
    render(
      <NavigationVisibilityToggles hidden={new Set()} onChange={onChange} />,
    );
    const row = screen.getByTestId("nav-toggle-fixture-panel");
    expect(row.textContent).toContain("Fixture title");
    fireEvent.click(row.querySelector("button, [role=switch]")!);
    expect(onChange).toHaveBeenCalledWith(new Set(["fixture-panel"]));
  });

  it("drops the toggle when the plugin goes away", () => {
    const remove = addFixtureItem();
    const { rerender } = render(
      <NavigationVisibilityToggles hidden={new Set()} onChange={() => {}} />,
    );
    expect(screen.queryByTestId("nav-toggle-fixture-panel")).not.toBeNull();
    remove();
    rerender(
      <NavigationVisibilityToggles hidden={new Set()} onChange={() => {}} />,
    );
    expect(screen.queryByTestId("nav-toggle-fixture-panel")).toBeNull();
  });
});
