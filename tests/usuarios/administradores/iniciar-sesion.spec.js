import { test, expect } from "@playwright/test";

test("Guardar sesión del admin", async ({ page, context }) => {
  await page.goto("https://slincsilver.ddns.net:3000");

  await page.getByLabel("Cédula de identidad").fill("11111111");
  await page.getByLabel("Contraseña").fill("password1");
  // eslint-disable-next-line testing-library/prefer-screen-queries
  await page.getByRole("button", { name: "Iniciar" }).click();

  await expect(page).toHaveURL(/intervenciones\/listado/);

  await context.storageState({ path: "auth-admin.json" });
});
