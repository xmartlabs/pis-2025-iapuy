// Lo dejo comentado hasta que se arregle lo del borrado lógico de usuarios

// import { test, expect } from "@playwright/test";

// test("test", async ({ page }) => {
//   await page.goto("https://slincsilver.ddns.net:3000/");
//   await page.getByRole("textbox", { name: "Cédula de identidad" }).click();
//   await page
//     .getByRole("textbox", { name: "Cédula de identidad" })
//     .fill("11111111");
//   await page.getByRole("textbox", { name: "Contraseña" }).click();
//   await page.getByRole("textbox", { name: "Contraseña" }).fill("password1");
//   await page.getByRole("button", { name: "Iniciar" }).click();
//   await page.getByRole("link", { name: "Personas" }).click();
//   await page.locator("span").filter({ hasText: "Agregar Persona" }).click();
//   await page.getByRole("textbox", { name: "Nombre y apellido*" }).click();
//   await page
//     .getByRole("textbox", { name: "Nombre y apellido*" })
//     .fill("Nicolas Lopez");
//   await page.getByRole("radio", { name: "Colaborador" }).click();
//   await page.getByRole("textbox", { name: "Banco*" }).click();
//   await page.getByRole("textbox", { name: "Banco*" }).fill("BBVA");
//   await page.getByRole("textbox", { name: "Número de cuenta*" }).click();
//   await page
//     .getByRole("textbox", { name: "Número de cuenta*" })
//     .fill("UY12343255");
//   await page.getByRole("textbox", { name: "Cédula de identidad*" }).click();
//   await page
//     .getByRole("textbox", { name: "Cédula de identidad*" })
//     .fill("55121281");
//   await page.getByRole("textbox", { name: "Cédula de identidad*" }).click();
//   await page.getByRole("textbox", { name: "Celular*" }).click();
//   await page.getByRole("textbox", { name: "Celular*" }).fill("055121281");

//   await page.locator('[id^="_r_"][id$="-form-item"]').last().click();

//   await page.getByRole("button", { name: "Crear persona" }).click();
//   await page.getByRole("button", { name: "Copiar link", exact: true }).click();

//   const link = await page.evaluate(
//     async () => await navigator.clipboard.readText()
//   );
//   await page.getByRole("button", { name: "Close" }).click();
//   await page.getByText("SS").click();
//   await page.getByRole("menuitem", { name: "Cerrar sesión" }).click();
//   await page.goto(link);

//   await page.getByRole("textbox", { name: "Nueva contraseña" }).click();
//   await page
//     .getByRole("textbox", { name: "Nueva contraseña" })
//     .fill("Contrasenia");
//   await page.getByRole("button", { name: "Confirmar" }).click();

//   await page
//     .getByRole("textbox", { name: "Cédula de identidad" })
//     .fill("55121281");
//   await page.getByRole("textbox", { name: "Contraseña" }).click();
//   await page.getByRole("textbox", { name: "Contraseña" }).fill("Contrasenia");
//   await page.getByRole("button", { name: "Iniciar" }).click();
//   await page.getByText("VM").click();
//   await page.getByRole("menuitem", { name: "Mi perfil" }).click();
//   await expect(page.getByText("VM")).toBeVisible();
// });
