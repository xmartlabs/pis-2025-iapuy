import { test, expect } from "@playwright/test";

test("login colaborador y guardar sesión", async ({ page, context }) => {
  await page.goto("https://slincsilver.ddns.net:3000");
  await page.getByLabel("Cédula de identidad").fill("33333333");
  await page.getByLabel("Contraseña").fill("password3");
  // eslint-disable-next-line testing-library/prefer-screen-queries
  await page.getByRole("button", { name: "Iniciar" }).click();

  await expect(page).toHaveURL(/intervenciones\/listado/);

  await context.storageState({ path: "auth-colab.json" });
});
