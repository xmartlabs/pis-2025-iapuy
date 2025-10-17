/* eslint-disable testing-library/prefer-screen-queries */
import { test, expect } from "@playwright/test";

test.use({ storageState: "auth-admin.json" });

test.describe("Intervenciones (Admin)", () => {
  test("Debe mostrar correctamente la página de listado", async ({ page }) => {
    await page.goto(
      "https://slincsilver.ddns.net:3000/app/admin/intervenciones/listado",
      { waitUntil: "domcontentloaded" }
    );
    
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("heading", { name: /intervenciones/i })
    ).toBeVisible();

    const botonAgregar = page.getByRole("button", {
      name: /agregar intervención/i,
    });
    await expect(botonAgregar).toBeVisible();

    const tabla = page.locator("table");
    await expect(tabla).toBeVisible();

    const filas = tabla.locator("tbody tr");
    const filasCount = await filas.count();

    if (filasCount > 0) {
      const estado = page.locator("tbody tr:first-child td:nth-child(5) div");
      await expect(estado).toHaveText(
        /Realizada|Pendiente|Suspendida|Finalizada/i,
        { timeout: 60000 }
      );
    } else {
      console.log("⚠️ No hay filas en la tabla de intervenciones (vacía).");
    }

    const buscador = page.getByPlaceholder(/buscar/i);
    await expect(buscador).toBeVisible();
  });
});
