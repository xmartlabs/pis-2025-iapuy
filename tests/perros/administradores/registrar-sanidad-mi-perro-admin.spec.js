//
// Lo dejo comentado porque no está terminado, y lo commiteo para evitar conflictos
//

// /* eslint-disable testing-library/prefer-screen-queries */
// import { test, expect } from "@playwright/test";

// test("Registro de sanidad - validación completa de UI", async ({ page }) => {
//   await page.goto("https://slincsilver.ddns.net:3000/");

//   // Login
//   await page.getByRole("textbox", { name: "Cédula de identidad" }).click();
//   await page
//     .getByRole("textbox", { name: "Cédula de identidad" })
//     .fill("11111111");
//   await page.getByRole("textbox", { name: "Contraseña" }).click();
//   await page.getByRole("textbox", { name: "Contraseña" }).fill("password1");
//   await page.getByRole("button", { name: "Iniciar" }).click();

//   // Verificar login exitoso
//   await expect(page.getByText("SS")).toBeVisible();

//   // Navegación al perfil
//   await page.getByText("SS").click();
//   await page.getByRole("menuitem", { name: "Perfil de Firulais" }).click();

//   // Verificar que estamos en el perfil correcto
//   await expect(page.locator("body")).toContainText("Firulais");

//   // Acceder a registrar sanidad
//   await page.getByRole("button", { name: "Registrar Sanidad" }).click();

//   // VERIFICACIONES GENERALES DEL FORMULARIO
//   await expect(page.getByRole("heading")).toContainText("Sanidad");
//   await expect(page.locator("body")).toContainText("Registrar Sanidad");

//   // Verificar que existen las pestañas
//   await expect(page.getByRole("tab", { name: "Vacuna" })).toBeVisible();
//   await expect(page.getByRole("tab", { name: "Baño" })).toBeVisible();
//   await expect(
//     page.getByRole("tab", { name: "Desparasitación" })
//   ).toBeVisible();

//   // Verificar botones principales
//   await expect(page.getByRole("button", { name: "Cancelar" })).toBeVisible();
//   await expect(page.getByRole("button", { name: "Guardar" })).toBeVisible();

//   // PESTAÑA VACUNA
//   await page.getByRole("tab", { name: "Vacuna" }).click();

//   // Verificar elementos de la pestaña Vacuna
//   await expect(page.getByText("Fecha*")).toBeVisible();
//   await expect(page.getByText("Marca")).toBeVisible();
//   await expect(page.getByText("Carnet de vacuna*")).toBeVisible();
//   await expect(page.getByText("Adjuntar archivo")).toBeVisible();
//   await expect(page.getByText("Nada cargado todavía")).toBeVisible();

//   // Verificar campos requeridos en Vacuna
//   await expect(
//     page
//       .locator('input[name="fechaVacuna"]')
//       .or(page.getByRole("textbox", { name: "Fecha*" }).first())
//   ).toBeVisible();
//   await expect(
//     page.locator('input[name="marcaVacuna"]').or(page.getByPlaceholder("Marca"))
//   ).toBeVisible();

//   // PESTAÑA BAÑO
//   await page.getByRole("tab", { name: "Baño" }).click();

//   // Verificar elementos de la pestaña Baño
//   await expect(
//     page
//       .locator("div")
//       .filter({ hasText: /^Fecha\*$/ })
//       .nth(3)
//   ).toBeVisible();
//   await expect(page.getByRole("textbox", { name: "Fecha*" })).toBeVisible();

//   // Llenar y verificar campo de fecha en Baño
//   await page.getByRole("textbox", { name: "Fecha*" }).fill("1111-11-11");
//   await expect(page.getByRole("textbox", { name: "Fecha*" })).toHaveValue(
//     "1111-11-11"
//   );
//   await page.getByRole("textbox", { name: "Fecha*" }).press("Enter");

//   // PESTAÑA DESPARASITACIÓN
//   await page.getByRole("tab", { name: "Desparasitación" }).click();

//   // Verificar elementos de la pestaña Desparasitación
//   await expect(
//     page.locator("div").filter({ hasText: /^Interna$/ })
//   ).toBeVisible();
//   await expect(
//     page.locator("div").filter({ hasText: /^Externa$/ })
//   ).toBeVisible();
//   await expect(
//     page.locator("div").filter({ hasText: /^Fecha\*$/ })
//   ).toBeVisible();
//   await expect(
//     page.locator("div").filter({ hasText: /^Marca$/ })
//   ).toBeVisible();

//   // Verificar checkboxes/radios de tipo de desparasitación
//   await expect(
//     page
//       .locator('input[type="checkbox"][name*="interna"]')
//       .or(page.locator('input[type="radio"][value*="interna"]'))
//   ).toBeVisible();
//   await expect(
//     page
//       .locator('input[type="checkbox"][name*="externa"]')
//       .or(page.locator('input[type="radio"][value*="externa"]'))
//   ).toBeVisible();

//   // VOLVER A VACUNA Y CANCELAR
//   await page.getByRole("tab", { name: "Vacuna" }).click();

//   // Verificar que seguimos en el formulario
//   await expect(page.getByText("Fecha*")).toBeVisible();

//   // Cancelar y verificar que cerramos el formulario
//   await page.getByRole("button", { name: "Cancelar" }).click();

//   // Verificar que volvimos al perfil del perro
//   await expect(page.locator("body")).toContainText("Firulais");
//   await expect(
//     page.getByRole("button", { name: "Registrar Sanidad" })
//   ).toBeVisible();

//   // VERIFICACIONES ADICIONALES DE ESTRUCTURA
//   await expect(page.locator("form")).toBeVisible(); // Verificar que hay un formulario
//   await expect(
//     page
//       .locator("div")
//       .filter({ hasText: /Sanidad/ })
//       .first()
//   ).toBeVisible();

//   // Verificar que no hay errores visibles en la UI
//   await expect(
//     page.locator('[role="alert"]').filter({ hasText: /error/i })
//   ).toHaveCount(0);
// });
