import { test, expect } from "@playwright/test";

test.use({ storageState: "auth-admin.json" });

test("test", async ({ page }) => {
  await page.goto("https://slincsilver.ddns.net:3000/");

  await page.getByRole("link", { name: "Perros" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^Rocco$/ })
    .click();
  await expect(page.getByText("PerrosRocco")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Rocco" })).toBeVisible();
  await expect(page.getByText("SS")).toBeVisible();
  await page.getByText("SS").click();
  await page.locator("html").click();
  await expect(
    page.getByRole("button", { name: "Registrar Sanidad" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Registrar Sanidad" })
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "DUEÑO" })).toBeVisible();
  await expect(page.locator("body")).toContainText("Carlos");
  await expect(
    page.getByRole("heading", { name: "DESCRIPCIÓN" })
  ).toBeVisible();
  await expect(page.locator("body")).toContainText("Protector y atento");
  await expect(page.getByRole("heading", { name: "FUERTES" })).toBeVisible();
  await expect(page.locator("body")).toContainText("{alerta,protección}");
  await expect(
    page.getByRole("heading", { name: "Historial de Intervenciones" })
  ).toBeVisible();
  await expect(page.getByText("Fecha y horaOrganizacion20/02")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Historial de Sanidad" })
  ).toBeVisible();
  await expect(page.getByText("FechaActividad16/10/2025Bañ")).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "pagination" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Eliminar Perro" })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Perros" }).first()
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Personas" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Instituciones" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Intervenciones" })
  ).toBeVisible();
});
