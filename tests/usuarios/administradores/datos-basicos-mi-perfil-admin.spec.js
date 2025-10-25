/* eslint-disable testing-library/prefer-screen-queries */
import { test, expect } from "@playwright/test";

test.use({ storageState: "auth-admin.json" });

test.describe("Perfil del administrador", () => {
  test("Debe mostrar los datos básicos del administrador correctamente", async ({
    page,
  }) => {
    await page.goto("https://slincsilver.ddns.net:3000/");

    await page.getByText("SS").click();
    await page.getByRole("menuitem", { name: "Mi perfil" }).click();

    await expect(
      page.getByRole("heading", { name: /Mi Perfil/i })
    ).toBeVisible();
    await expect(page).not.toHaveTitle(/404/i);

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

    const labels = [
      "Nombre",
      "Banco",
      "Numero de Cuenta",
      "Cedula de Identidad",
      "Celular",
    ];
    for (const label of labels) {
      // eslint-disable-next-line no-await-in-loop
      await expect(
        page.locator("div").filter({ hasText: new RegExp(`^${label}$`, "i") })
      ).toBeVisible();
    }

    await expect(page.getByText("AdministradorColaborador")).toBeVisible();
    await expect(page.getByText("PerrosPerros")).toBeVisible();
    await expect(
      page.locator("div").filter({ hasText: /^No tiene$/ })
    ).toBeVisible();
    await expect(
      page.getByRole("alert").filter({ hasText: "Si necesitás una nueva" })
    ).toBeVisible();

    const links = [
      "click acá",
      "Perros",
      "Personas",
      "Instituciones",
      "Intervenciones",
    ];
    for (const link of links) {
      // eslint-disable-next-line no-await-in-loop
      await expect(page.getByRole("link", { name: link })).toBeVisible();
    }

    await expect(page.getByText("SS")).toBeVisible();
  });
});
