import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "../..");
const appRoot = path.join(repoRoot, "app");
const guardImportPattern = /from\s+["']@\/lib\/auth\/guards["']/;

const publicPageAllowList = new Set([
  "app/page.tsx",
  "app/(auth)/auth/error/page.tsx",
  "app/(auth)/auth/signed-out/page.tsx",
  "app/no-access/page.tsx",
]);

async function filesBelow(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(directory, entry.name);
      return entry.isDirectory() ? filesBelow(absolutePath) : [absolutePath];
    }),
  );

  return files.flat();
}

function relativePath(absolutePath: string): string {
  return path.relative(repoRoot, absolutePath).split(path.sep).join("/");
}

function requiresGuard(filePath: string): boolean {
  if (filePath.endsWith("/page.tsx")) {
    if (publicPageAllowList.has(filePath)) {
      return false;
    }

    return (
      filePath.startsWith("app/(app)/") ||
      filePath.startsWith("app/(admin)/") ||
      filePath.startsWith("app/picker/")
    );
  }

  return filePath.startsWith("app/api/") && filePath.endsWith("/route.ts");
}

describe("server guard coverage", () => {
  it("imports the shared guard in every protected page and API route", async () => {
    const candidates = (await filesBelow(appRoot))
      .map(relativePath)
      .filter(requiresGuard);
    const missingGuard = [];

    for (const filePath of candidates) {
      const source = await readFile(path.join(repoRoot, filePath), "utf8");
      if (!guardImportPattern.test(source)) {
        missingGuard.push(filePath);
      }
    }

    expect(missingGuard, "Routes missing the shared server guard").toEqual([]);
  });
});
