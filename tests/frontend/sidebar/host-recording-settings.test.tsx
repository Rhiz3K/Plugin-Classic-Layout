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

const recording = {
  id: "session-recording",
  name: "Session Recording",
  contributes: {
    settings: {
      host: {
        editorGroup: "ssh",
        enableKey: "enableSessionRecording",
        enableLabelKey: "settings.host.enable.label",
        enableDescriptionKey: "settings.host.enable.description",
        fields: [],
      },
    },
  },
};

const sharing = {
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

describe.each([
  { manifest: recording, key: "enableSessionRecording" },
  { manifest: sharing, key: "allowSessionSharing" },
])("$key after reopening a host", ({ manifest, key }) => {
  it.each([false, true])(
    "preserves the saved switch %s in the editor and its next change",
    (saved) => {
      const pluginSettings = {
        "session-recording": { enableSessionRecording: saved },
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
      fireEvent.click(screen.getByRole("switch"));
      expect(setValue).toHaveBeenCalledWith(manifest.id, key, !saved);
      // These are the values HostEditor writes through each plugin's host settings API.
      expect(form.pluginSettings).toEqual(pluginSettings);
    },
  );
});
