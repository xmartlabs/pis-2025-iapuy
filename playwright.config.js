// @ts-check
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  reporter: "html",
  fullyParallel: false,

  use: {
    trace: "on-first-retry",
  },

  projects: [
    // Setup para ADMIN
    {
      name: "setup-admin",
      testMatch: /.*admin-login\.setup\.(js|ts)/,
    },

    // Setup para COLABORADOR
    {
      name: "setup-colab",
      testMatch: /.*colab-login\.setup\.(js|ts)/,
    },

    // SOLO UN proyecto para tests principales
    {
      name: "main-tests",
      use: {
        ...devices["Desktop Chrome"],
        // NO definir storageState aquí - cada test usa el suyo
      },
      dependencies: ["setup-admin", "setup-colab"],
      testMatch: /.*\.(spec|test)\.(js|ts)/, // Todos los tests
    },
  ],
});
