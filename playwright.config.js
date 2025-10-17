// @ts-check
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  reporter: "html",

  // Corre los setup primero, y el resto después
  fullyParallel: false,

  use: {
    trace: "on-first-retry",
  },

  projects: [
    // 🧩 Proyecto de setup para ADMIN
    {
      name: "setup-admin",
      testMatch: /.*auth\/admin-login\.setup\.(js|ts)/,
    },

    // 🧩 Proyecto de setup para COLABORADOR
    {
      name: "setup-colab",
      testMatch: /.*auth\/colab-login\.setup\.(js|ts)/,
    },

    // 💻 Tests del admin (usa el login generado)
    {
      name: "chromium-admin",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "auth-admin.json",
      },
      dependencies: ["setup-admin"], // Corre después del login del admin
      testMatch: /.*\.(spec|test)\.(js|ts)/, // Detecta cualquier test
    },

    // 💻 Tests del colaborador (usa su login generado)
    {
      name: "chromium-colab",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "auth-colab.json",
      },
      dependencies: ["setup-colab"], // Corre después del login del colab
      testMatch: /.*\.(spec|test)\.(js|ts)/,
    },
  ],
});
