/* eslint-disable testing-library/prefer-screen-queries */
import { test, expect } from "@playwright/test";

test.use({ storageState: "auth-admin.json" });

test("test", async ({ page }) => {
  await page.goto("https://slincsilver.ddns.net:3000");

  await page.getByText("SS", { exact: true }).click();
  await page.getByRole("menuitem", { name: "Perfil de Firulais" }).click();
  await expect(page.getByLabel("breadcrumb").locator("span")).toContainText(
    "Firulais"
  );
  await page.getByRole("heading", { name: "Firulais" }).click();
  await expect(page.locator("body")).toContainText("Firulais");
  await expect(
    page.getByRole("button", { name: "Registrar Sanidad" })
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "DUEÑO" })).toBeVisible();
  await expect(page.locator("body")).toContainText("Santiago");
  await expect(
    page.getByRole("heading", { name: "DESCRIPCIÓN" })
  ).toBeVisible();
  await expect(page.locator("body")).toContainText("Perro enérgico y juguetón");
  await expect(page.getByRole("heading", { name: "FUERTES" })).toBeVisible();
  await expect(page.locator("body")).toContainText("{agilidad,obediencia}");
  await expect(
    page.getByRole("heading", { name: "Historial de Intervenciones" })
  ).toBeVisible();
  await expect(page.getByText("Fecha y horaOrganizacion10/01")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Historial de Sanidad" })
  ).toBeVisible();
  await expect(page.getByText("FechaActividad14/08/2025Bañ")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Perros" }).first()
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Personas" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Instituciones" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Intervenciones" })
  ).toBeVisible();
  await expect(
    page.locator("div").filter({ hasText: "Anterior1234567Siguiente" }).nth(2)
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Eliminar Perro" })
  ).toBeVisible();
});
