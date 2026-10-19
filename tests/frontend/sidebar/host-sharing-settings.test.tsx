import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { PluginSummary } from "@termix-ssh/plugin-sdk/ui";
import { sshHostToHost } from "@termix-ssh/plugin-sdk/ui";
import { createHostEditorForm } from "../../../src/frontend/sidebar/HostEditorData";
import { HostPluginSections } from "@termix-ssh/plugin-sdk/testing-host";

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

afterEach(cleanup);

const manifest = {
  id: "session-sharing",
  name: "Session Sharing",
  contributes: {
    settings: {
      host: {
        editorGroup: "ssh",
        fields: [
          {
            key: "allowSessionSharing",
            type: "boolean",
            labelKey: "settings.host.allowSessionSharing.label",
            default: true,
          },
        ],
      },
    },
  },
};

describe("host sharing settings on reopening the editor", () => {
  it.each([false, true])("retains the saved sharing value %s", (saved) => {
    const pluginSettings = {
      "session-sharing": { allowSessionSharing: saved },
      "ssh-terminal": { enableCommandHistory: false },
    };
    const host = sshHostToHost({
      id: 1,
      name: "server",
      ip: "192.0.2.1",
      port: 22,
      username: "alice",
      folder: "",
      tags: [],
      pin: false,
      authType: "password",
      status: "online",
      createdAt: "2026-09-29T00:00:00Z",
      updatedAt: "2026-09-29T00:00:00Z",
      pluginSettings,
    });
    const form = createHostEditorForm(host);
    const setValue = vi.fn();
    render(
      <HostPluginSections
        plugins={[
          {
            ...manifest,
            enabled: true,
            state: "running",
          } as unknown as PluginSummary,
        ]}
        values={form.pluginSettings}
        setValue={setValue}
      />,
    );

    // The toggle starts from the server value, including false despite its true default.
    fireEvent.click(screen.getByRole("switch"));
    expect(setValue).toHaveBeenCalledWith(
      "session-sharing",
      "allowSessionSharing",
      !saved,
    );
    expect(form.pluginSettings).toEqual(pluginSettings);
  });
});
