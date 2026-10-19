import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const saved = vi.hoisted(() => ({ value: null as string | null }));

vi.mock("@termix-ssh/plugin-sdk/ui", async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>();
  const merged: Record<string, unknown> = { ...original };
  const factories: Array<
    (importOriginal: <T = Record<string, unknown>>() => Promise<T>) => unknown
  > = [
    async (importOriginal) => ({
      ...(await importOriginal<Record<string, unknown>>()),
      getUserPreferences: async () => ({ customKeybindings: saved.value }),
    }),
    () => ({ saveUserPreferences: vi.fn() }),
  ];
  for (const factory of factories) {
    Object.assign(
      merged,
      await factory((async () => ({ ...merged })) as never),
    );
  }
  return merged;
});
const { KeybindingsSettings } =
  await import("../../../src/frontend/settings/KeybindingsSettings");
const { SurfaceScope } = await import("@termix-ssh/plugin-sdk/ui");

function renderSettings() {
  return render(
    <SurfaceScope>
      <KeybindingsSettings />
    </SurfaceScope>,
  );
}
const {
  registerKeybindingAction,
  registerKeybindingDefault,
  resetKeybindingRegistry,
} = await import("@termix-ssh/plugin-sdk/testing-host");

afterEach(() => {
  cleanup();
  resetKeybindingRegistry();
  saved.value = null;
});

const combo = {
  key: "k",
  isCode: false,
  ctrl: true,
  alt: false,
  shift: false,
  meta: false,
};

describe("KeybindingsSettings", () => {
  it("lists registered defaults and keeps a binding whose plugin is off", async () => {
    registerKeybindingDefault({
      id: "default-x",
      pluginId: "sample",
      combo,
      descriptionKey: "sample:builtInX",
    });
    saved.value = JSON.stringify([
      {
        id: "a",
        combo,
        action: { type: "gone.action" },
        enabled: true,
        createdAt: "",
        updatedAt: "",
      },
    ]);
    renderSettings();
    expect(await screen.findByText("sample:builtInX")).toBeTruthy();
    expect(
      await screen.findByText("newUi.sidebar.keybindings.unavailableAction"),
    ).toBeTruthy();
  });

  it("offers every registered action and draws the chosen one's editor", async () => {
    registerKeybindingAction({
      id: "sample.send",
      pluginId: "sample",
      labelKey: "sample:send",
      scope: "session",
      editor: () => <span>sample editor</span>,
    });
    renderSettings();
    fireEvent.click(
      await screen.findByText("newUi.sidebar.keybindings.addBinding"),
    );
    const select = (await screen.findByRole("option", { name: "sample:send" }))
      .parentElement as HTMLSelectElement;
    expect([...select.options].map((option) => option.value)).toContain(
      "nextTab",
    );
    fireEvent.change(select, { target: { value: "sample.send" } });
    expect(await screen.findByText("sample editor")).toBeTruthy();
  });
});
