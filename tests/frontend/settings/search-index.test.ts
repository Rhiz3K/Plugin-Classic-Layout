import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

it("keeps the settings search index in step with the settings sections", () => {
  expect(() =>
    execFileSync(
      process.execPath,
      ["scripts/generate-settings-search-index.cjs", "--check"],
      { cwd: root, stdio: "pipe" },
    ),
  ).not.toThrow();
});
