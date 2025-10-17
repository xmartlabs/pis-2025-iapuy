/* eslint-disable testing-library/prefer-screen-queries */
import { test, expect } from "@playwright/test";

test.use({ storageState: "auth-admin.json" });

test.describe("Listado de personas", () => {
  test("Debe mostrar la tabla con personas correctamente", async ({ page }) => {
 
    await page.goto("https://slincsilver.ddns.net:3000/app/admin/personas/listado", {
      waitUntil: "domcontentloaded",
    });

    const heading404 = page.getByRole("heading", { name: /404/i });
    if (await heading404.isVisible()) {
      throw new Error("La página devolvió un 404. Revisa la sesión o la URL.");
    }

    await expect(page.getByRole("heading", { name: /Personas/i })).toBeVisible();

    const botonAgregar = page.getByRole("link", { name: /Agregar Persona/i });
    await expect(botonAgregar).toBeVisible();

    const tabla = page.locator("table");
    await expect(tabla).toBeVisible();

    const encabezados = ["Nombre", "Cédula de Identidad", "Celular", "Banco", "Número de Cuenta", "Perro"];
    for (const texto of encabezados) {
      // eslint-disable-next-line no-await-in-loop
      await expect(tabla.locator("th").filter({ hasText: texto })).toBeVisible();
    }

    const filas = tabla.locator("tbody tr");
    if ((await filas.count()) > 0) {
      const primeraFila = filas.first();
      await expect(primeraFila).toBeVisible();

      const primerNombre = primeraFila.locator("td").first();
      await expect(primerNombre).not.toBeEmpty();
    }
  });
});
