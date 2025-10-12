/* eslint-disable testing-library/prefer-screen-queries */
import { test, expect } from "@playwright/test";
test.use({ storageState: "auth-admin.json" });
test.describe("Interventions Page", () => {
  test("It should display the list correctly", async ({ page }) => {
    await page.goto(
      "https://slincsilver.ddns.net:3000/app/admin/intervenciones/listado",
      { waitUntil: "domcontentloaded" }
    );

    // eslint-disable-next-line testing-library/prefer-screen-queries
    await expect(
      page.getByRole("heading", { name: /intervenciones/i })
    ).toBeVisible();

    // eslint-disable-next-line testing-library/prefer-screen-queries
    const botonAgregar = page.getByRole("button", {
      name: /agregar intervención/i,
    });
    await expect(botonAgregar).toBeVisible();

    const tabla = page.locator("table");
    await expect(tabla).toBeVisible();

    const filas = tabla.locator("tbody tr");
    const filasCount = await filas.count();
    expect(filasCount).toBeGreaterThan(0);

    const estado = page.locator("tbody tr:first-child td:nth-child(5) div");
    await expect(estado).toHaveText(
      /Realizada|Pendiente|Suspendida|Finalizada/i,
      { timeout: 60000 }
    );

    const buscador = page.getByPlaceholder(/buscar/i);
    await expect(buscador).toBeVisible();
  });
});
