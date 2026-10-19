import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import {
  ServerStatusProvider,
  ShellControllerProvider,
  TabPortals,
  setPermissionsForTesting,
} from "@termix-ssh/plugin-sdk/testing-host";

vi.mock("@termix-ssh/plugin-sdk/frontend", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useTranslation: () => ({ t: (key: string) => key, language: "en" }),
}));
vi.mock("react-i18next", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { ClassicLayout } from "../../../src/frontend/layout/ClassicLayout";

beforeEach(() => setPermissionsForTesting([], true));
afterEach(cleanup);

describe("ClassicLayout", () => {
  it("draws the rail, the sidebar and the tab bar around the stage", async () => {
    render(
      <ServerStatusProvider isAuthenticated>
        <ShellControllerProvider username="admin" onLogout={() => {}}>
          <ClassicLayout />
          <TabPortals />
        </ShellControllerProvider>
      </ServerStatusProvider>,
    );
    await waitFor(() =>
      expect(screen.getAllByRole("button").length).toBeGreaterThan(3),
    );
    expect(document.body.textContent).toContain("nav.hosts");
  });
});
