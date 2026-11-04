import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "vite";

const outputDirectory = await mkdtemp(join(tmpdir(), "babushka-review-"));

try {
  await build({
    logLevel: "warn",
    build: {
      ssr: resolve("scripts/generate-first-ten-review.ts"),
      outDir: outputDirectory,
      emptyOutDir: true
    }
  });
  await import(pathToFileURL(join(outputDirectory, "generate-first-ten-review.js")).href);
  console.log("Generated docs/steps-1-10-review.md");
} finally {
  await rm(outputDirectory, { recursive: true, force: true });
}
