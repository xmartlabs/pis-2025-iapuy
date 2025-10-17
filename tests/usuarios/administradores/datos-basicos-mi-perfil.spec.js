/* eslint-disable testing-library/prefer-screen-queries */
import { test, expect } from "@playwright/test";

test.use({ storageState: "auth-admin.json" });

test.describe("Perfil del administrador", () => {
  test("Debe mostrar los datos básicos correctamente", async ({ page }) => {
   
    await page.goto("https://slincsilver.ddns.net:3000/app/perfil", {
      waitUntil: "domcontentloaded",
    });

    await expect(page).not.toHaveTitle(/404/i);
    await expect(page.getByRole("heading", { name: /Mi Perfil/i })).toBeVisible();

    await expect(page.locator('input[id="nombre"]')).toHaveValue("Santiago");
    await expect(page.locator('input[id="banco"]')).toHaveValue("Santander");
    await expect(page.locator('input[id="email"]')).toHaveValue("UY123456789");
    await expect(page.locator('input[id="ci"]')).toHaveValue("11111111");
    await expect(page.locator('input[id="celular"]')).toHaveValue("099111111");

    await expect(
      page.getByRole("radio", { name: "Administrador" })
    ).toBeChecked();
    await expect(
      page.getByRole("radio", { name: "Colaborador" })
    ).not.toBeChecked();

    await expect(page.locator("div").filter({ hasText: /^Nombre$/ })).toBeVisible();
    await expect(page.locator("div").filter({ hasText: /^Banco$/ })).toBeVisible();
    await expect(
      page.locator("div").filter({ hasText: /^Numero de Cuenta$/ })
    ).toBeVisible();
    await expect(
      page.locator("div").filter({ hasText: /^Cedula de Identidad$/ })
    ).toBeVisible();
    await expect(page.locator("div").filter({ hasText: /^Celular$/ })).toBeVisible();

    await expect(page.getByText("AdministradorColaborador")).toBeVisible();
    await expect(page.getByText("PerrosPerros")).toBeVisible();
    await expect(page.locator("div").filter({ hasText: /^No tiene$/ })).toBeVisible();
    await expect(
      page.getByRole("alert").filter({ hasText: "Si necesitás una nueva" })
    ).toBeVisible();

    await expect(page.getByRole("link", { name: "click acá" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Perros" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Personas" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Instituciones" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Intervenciones" })).toBeVisible();

    await expect(page.getByText("SS")).toBeVisible();
  });
});
