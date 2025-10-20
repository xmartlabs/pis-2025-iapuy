/* eslint-disable testing-library/prefer-screen-queries */
import { test, expect } from "@playwright/test";

test.use({ storageState: "auth-colab.json" });

test("test", async ({ page }) => {
  await page.goto("https://slincsilver.ddns.net:3000/");

  await page.getByText("CC").click();
  await page.getByRole("menuitem", { name: "Perfil de Rocco" }).click();
  await expect(page.locator("body")).toContainText("Rocco");
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
  await expect(
    page.getByRole("button", { name: "Eliminar Perro" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Registrar Sanidad" })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Intervenciones" })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Gastos" })).toBeVisible();
});
