/* eslint-disable testing-library/prefer-screen-queries */
import { test } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("https://slincsilver.ddns.net:3000/");
  await page.getByRole("textbox", { name: "Cédula de identidad" }).click();
  await page
    .getByRole("textbox", { name: "Cédula de identidad" })
    .fill("11111111");
  await page.getByRole("textbox", { name: "Contraseña" }).click();
  await page.getByRole("textbox", { name: "Contraseña" }).fill("password1");
  await page.getByRole("button", { name: "Iniciar" }).click();

  await page.getByRole("link", { name: "Gastos" }).click();
  await page.getByRole("button", { name: "Agregar Gasto" }).click();
  await page.getByRole("menuitem", { name: "Sanidad de un perro" }).click();
  await page.getByRole("tab", { name: "Baño" }).click();
  await page.getByRole("textbox", { name: "Fecha*" }).fill("2025-12-09");
  await page.getByRole("button", { name: "Confirmar" }).click();
  await page
    .getByRole("row", { name: "09/12/2025 09:00 a. m. Baño $" })
    .getByRole("button")
    .first()
    .click();
  await page.getByRole("button", { name: "Cambiar a Pagado" }).click();
  await page.getByRole("button", { name: "Confirmar" }).click();
  await page
    .getByRole("row", { name: "09/12/2025 09:00 a. m. Baño $" })
    .getByRole("button")
    .first()
    .click();
  await page.getByRole("button", { name: "Ver o Editar" }).click();
  await page.getByRole("textbox", { name: "Fecha*" }).fill("2025-12-10");
  await page.getByRole("textbox", { name: "Fecha*" }).fill("2025-12-10");
  await page.getByRole("button", { name: "Confirmar" }).click();
  await page
    .getByRole("row", { name: "10/12/2025 09:00 a. m. Baño $" })
    .getByRole("button")
    .first()
    .click();
  await page.getByRole("button", { name: "Eliminar Gasto" }).click();
  await page
    .locator(
      '[id^="radix-_r_"][id$="_"] .inline-flex.items-center.justify-center.gap-2.whitespace-nowrap.rounded-md.font-medium.transition-all'
    )
    .last()
    .click();
});
