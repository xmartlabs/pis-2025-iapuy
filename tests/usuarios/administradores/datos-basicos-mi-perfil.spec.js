/* eslint-disable testing-library/prefer-screen-queries */
import { test, expect } from "@playwright/test";

test("Validación de datos básicos del perfil", async ({ page }) => {
  await page.goto("https://slincsilver.ddns.net:3000/");
  await page.getByRole("textbox", { name: "Cédula de identidad" }).click();
  await page
    .getByRole("textbox", { name: "Cédula de identidad" })
    .fill("11111111");
  await page.getByRole("textbox", { name: "Contraseña" }).click();
  await page.getByRole("textbox", { name: "Contraseña" }).fill("password1");
  await page.getByRole("button", { name: "Iniciar" }).click();
  await page.getByText("SS").click();
  await page.getByRole("menuitem", { name: "Mi perfil" }).click();
  await expect(page.getByRole("heading")).toContainText("Mi Perfil");
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
  await expect(page.locator("body")).toContainText("Nombre");
  await expect(
    page.locator("div").filter({ hasText: /^Nombre$/ })
  ).toBeVisible();
  await expect(
    page.locator("div").filter({ hasText: /^Banco$/ })
  ).toBeVisible();
  await expect(
    page.locator("div").filter({ hasText: /^Numero de Cuenta$/ })
  ).toBeVisible();
  await expect(
    page.locator("div").filter({ hasText: /^Cedula de Identidad$/ })
  ).toBeVisible();
  await expect(
    page.locator("div").filter({ hasText: /^Celular$/ })
  ).toBeVisible();
  await expect(page.getByText("AdministradorColaborador")).toBeVisible();
  await expect(page.getByText("PerrosPerros")).toBeVisible();
  await expect(
    page.locator("div").filter({ hasText: /^No tiene$/ })
  ).toBeVisible();
  await expect(
    page.getByRole("alert").filter({ hasText: "Si necesitás una nueva" })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "click acá" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Perros" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Personas" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Instituciones" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Intervenciones" })
  ).toBeVisible();
  await expect(page.getByText("SS")).toBeVisible();
});
