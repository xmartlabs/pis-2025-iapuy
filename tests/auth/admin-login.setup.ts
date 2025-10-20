/* eslint-disable testing-library/prefer-screen-queries */
import { test, expect } from "@playwright/test";
import { existsSync } from "fs";

test("login admin y guardar sesión", async ({ page, context }) => {
  if (!existsSync("auth-admin.json")) {
    await page.goto("https://slincsilver.ddns.net:3000");
    await page.getByLabel("Cédula de identidad").fill("11111111");
    await page.getByLabel("Contraseña").fill("password1");
    await page.getByRole("button", { name: "Iniciar" }).click();
    
    await expect(page).toHaveURL(/intervenciones\/listado/);
    
    await context.storageState({ path: "auth-admin.json" });

    await page.getByText('SS').click();
    await page.getByRole('menuitem', { name: 'Cerrar sesión' }).click();
  }
});
