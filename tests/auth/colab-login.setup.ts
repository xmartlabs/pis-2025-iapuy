/* eslint-disable testing-library/prefer-screen-queries */
import { test, expect } from "@playwright/test";
import { existsSync } from "fs";

test("login colaborador y guardar sesión", async ({ page, context }) => {
  if (!existsSync("auth-colab.json")) {
    await page.goto("https://slincsilver.ddns.net:3000");
    await page.getByLabel("Cédula de identidad").fill("33333333");
    await page.getByLabel("Contraseña").fill("password3");
    await page.getByRole("button", { name: "Iniciar" }).click();

    await expect(page).toHaveURL(/intervenciones\/listado/);

    await context.storageState({ path: "auth-colab.json" });

    await page.getByText('CC').click();
    await page.getByRole('menuitem', { name: 'Cerrar sesión' }).click();
  }
});
