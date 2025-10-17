// @ts-check
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  reporter: "html",
  fullyParallel: false, // importante: los setup deben correr primero
  use: {
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "setup-admin",
      testMatch: /.*auth\/admin-login\.setup\.ts/,
    },
    {
      name: "setup-colab",
      testMatch: /.*auth\/colab-login\.setup\.ts/,
    },
    {
      name: "chromium-admin",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "auth-admin.json",
      },
      dependencies: ["setup-admin"], // 👈 corre el login primero
      testMatch: /.*interventions\/.*\.spec\.ts/,
    },
    {
      name: "chromium-colab",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "auth-colab.json",
      },
      dependencies: ["setup-colab"],
    },
  ],
});
