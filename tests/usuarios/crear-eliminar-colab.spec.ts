// // No borrar por favor
// // Lo dejo comentado hasta que se arregle lo del borrado lógico de usuarios

// import { test, expect } from "@playwright/test";

// test("crear persona y establecer contraseña con acceso al portapapeles", async ({
//   browser,
// }) => {
//   const context = await browser.newContext({
//     permissions: ["clipboard-read", "clipboard-write"],
//   });
//   const page = await context.newPage();

//   await page.goto("https://slincsilver.ddns.net:3000/");
//   await page.getByRole("textbox", { name: "Cédula de identidad" }).fill("11111111");
//   await page.getByRole("textbox", { name: "Contraseña" }).fill("password1");
//   await page.getByRole("button", { name: "Iniciar" }).click();

//   await page.getByRole("link", { name: "Personas" }).click();
//   await page.locator("span").filter({ hasText: "Agregar Persona" }).click();
//   await page.getByRole("textbox", { name: "Nombre y apellido*" }).fill("Nicolas Lopez");
//   await page.getByRole("radio", { name: "Colaborador" }).click();
//   await page.getByRole("textbox", { name: "Banco*" }).fill("BBVA");
//   await page.getByRole("textbox", { name: "Número de cuenta*" }).fill("55121284");
//   await page.getByRole("textbox", { name: "Cédula de identidad*" }).fill("55121284");
//   await page.getByRole("textbox", { name: "Celular*" }).fill("055121284");

//   await page.locator('[id^="_r_"][id$="-form-item"]').last().click();

//   await page.getByRole("button", { name: "Crear persona" }).click();
//   await page.getByRole("button", { name: "Copiar link", exact: true }).click();

//   const link = await page.evaluate(async () => await navigator.clipboard.readText());

//   await page.getByRole("button", { name: "Close" }).click();
//   await page.getByText("SS").click();
//   await page.getByRole("menuitem", { name: "Cerrar sesión" }).click();
//   await page.goto(link);

//   await page.getByRole("textbox", { name: "Nueva contraseña" }).fill("Contrasenia");
//   await page.getByRole("button", { name: "Confirmar" }).click();

//   await page.getByRole("textbox", { name: "Cédula de identidad" }).fill("55121284");
//   await page.getByRole("textbox", { name: "Contraseña" }).fill("Contrasenia");
//   await page.getByRole("button", { name: "Iniciar" }).click();

//   await page.getByText("NL").click();
//   await page.getByRole("menuitem", { name: "Mi perfil" }).click();
//   await expect(page.getByText("NL")).toBeVisible();

//   await page.goto('https://slincsilver.ddns.net:3000/');
//   await page.getByRole('textbox', { name: 'Cédula de identidad' }).click();
//   await page.getByRole('textbox', { name: 'Cédula de identidad' }).fill('11111111');
//   await page.getByRole('textbox', { name: 'Contraseña' }).click();
//   await page.getByRole('textbox', { name: 'Contraseña' }).fill('password1');
//   await page.getByRole('button', { name: 'Iniciar' }).click();
//   await page.getByRole('link', { name: 'Personas' }).click();
//   await page.getByRole('button', { name: '2' }).click();
//   await page.getByText('Nicolas Lopez').nth(1).click();
//   await page.getByRole('button', { name: 'Eliminar persona' }).click();

//   await context.close();
// });
