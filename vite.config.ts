import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./tests/setup.ts",
    // World-dataset tests generate hundreds of lives in parallel with the UI suite.
    testTimeout: 20000,
    coverage: { reporter: ["text"] }
  }
});
