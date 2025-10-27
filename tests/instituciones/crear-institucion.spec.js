import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("https://slincsilver.ddns.net:3000/");
  await page.getByRole("textbox", { name: "Cédula de identidad" }).click();
  await page
    .getByRole("textbox", { name: "Cédula de identidad" })
    .fill("11111111");
  await page.getByRole("textbox", { name: "Contraseña" }).click();
  await page.getByRole("textbox", { name: "Contraseña" }).fill("password1");
  await page.getByRole("button", { name: "Iniciar" }).click();

  await page.getByRole("link", { name: "Instituciones" }).click();
  await page.getByRole("button", { name: "Agregar institución" }).click();
  await page.getByRole("textbox", { name: "Nombre*" }).fill("TNT");

  await page.getByRole("textbox").nth(1).click();
  await page.getByRole("textbox").nth(1).fill("Explosión");

  await page.getByRole("textbox", { name: "Nombre", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Nombre", exact: true })
    .fill("Brian Johnson");
  await page.getByRole("textbox", { name: "Contacto" }).click();
  await page.getByRole("textbox", { name: "Contacto" }).fill("091777616");
  await page.getByRole("button", { name: "Crear institución" }).click();

  await page.getByRole("link", { name: "Intervenciones" }).click();
  await page.getByRole("link", { name: "Intervenciones" }).click();
  await page.getByRole("button", { name: "Agregar intervención" }).click();
  await page.getByRole("combobox", { name: "Institución*" }).click();
  await page.getByRole("option", { name: "TNT" }).click();
  await expect(page.getByLabel("Institución*")).toContainText("TNT");
  await page.getByRole("textbox", { name: "Fecha*" }).fill("2026-01-20");
  await page.getByRole("textbox", { name: "Hora*" }).click();
  await page.getByRole("textbox", { name: "Hora*" }).fill("12:00");
  await page.getByRole("textbox", { name: "Descripción" }).click();
  await page
    .getByRole("textbox", { name: "Descripción" })
    .fill("Texto de ejemplo");
  await page.getByRole("button", { name: "Crear Intervención" }).click();

  await expect(
    page.getByRole("cell", { name: "/01/2026 12:00" })
  ).toBeVisible();
  await expect(page.getByRole("cell", { name: "TNT" })).toBeVisible();
  await page.getByRole("cell", { name: "/01/2026 12:00" }).click();
  await expect(
    page.getByRole("button", { name: "Eliminar intervención" })
  ).toBeVisible();
  await page.getByRole("button", { name: "Eliminar intervención" }).click();
  await page.getByRole("button", { name: "Si, eliminar" }).click();

  await page.getByRole("link", { name: "Instituciones" }).click();
  await page.locator("div").filter({ hasText: /^TNT$/ }).click();
  await page.getByRole("button", { name: "Eliminar institución" }).click();
  await page.getByRole("button", { name: "Si, eliminar" }).click();
});
