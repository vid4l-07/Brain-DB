import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["spec/**/*.spec.ts"],
    passWithNoTests: true,
    reporters: ["default"],
  },
});
