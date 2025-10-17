/* eslint-disable testing-library/prefer-screen-queries */
import { test, expect } from "@playwright/test";

test.use({ storageState: "auth-colab.json" });

test("Validación de datos básicos del perfil colaborador", async ({ page }) => {
  await page.goto("https://slincsilver.ddns.net:3000/");

  await page.getByText("CC").click();
  await page.getByRole("menuitem", { name: "Mi perfil" }).click();

  // Verificar heading principal
  await expect(page.getByRole("heading")).toContainText("Mi Perfil");

  // Verificar datos del formulario (actualiza con los IDs correctos y valores esperados)
  await expect(page.locator('input[id="nombre"]')).toHaveValue("Carlos"); // Asumiendo que el nombre del colaborador es Carlos
  await expect(page.locator('input[id="banco"]')).toHaveValue("BBVA");
  await expect(page.locator('input[id="email"]')).toHaveValue("UY111222333"); // Asumiendo un número de cuenta diferente
  await expect(page.locator('input[id="ci"]')).toHaveValue("33333333");
  await expect(page.locator('input[id="celular"]')).toHaveValue("099333333");

  // Verificar visibilidad de secciones (usando first() para evitar el error de múltiples elementos)
  await expect(page.locator("body")).toContainText("Nombre");
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Nombre$/ })
      .first()
  ).toBeVisible();
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Banco$/ })
      .first()
  ).toBeVisible();
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Numero de Cuenta$/ })
      .first()
  ).toBeVisible();
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Cedula de Identidad$/ })
      .first()
  ).toBeVisible();
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Celular$/ })
      .first()
  ).toBeVisible();

  // Verificar elementos específicos de UI
  await expect(page.getByText("AdministradorColaborador")).not.toBeVisible();
  await expect(page.getByText("PerrosPerros")).toBeVisible();
  await expect(
    page.locator("div").filter({ hasText: /^No tiene$/ })
  ).toBeVisible();

  // Verificar sección de contraseña (ajusta según lo que veas en la UI del colaborador)
  await expect(
    page.getByRole("alert").filter({ hasText: "Si necesitás una nueva" })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "click acá" })).not.toBeVisible();
  await expect(page.getByText("Celular de contacto:")).toBeVisible();

  // Verificar navegación disponible para colaborador
  await expect(page.getByRole("link", { name: "Perros" })).not.toBeVisible();
  await expect(page.getByRole("link", { name: "Personas" })).not.toBeVisible();
  await expect(
    page.getByRole("link", { name: "Instituciones" })
  ).not.toBeVisible();
  await expect(
    page.getByRole("link", { name: "Intervenciones" })
  ).toBeVisible();
  //   await expect(
  //     page.getByRole("link", { name: "Gastos" })
  //   ).toBeVisible();

  // Verificar usuario logueado (iniciales del colaborador)
  await expect(page.getByText("CC")).toBeVisible();
});
