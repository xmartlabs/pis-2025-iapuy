/* eslint-disable testing-library/prefer-screen-queries */
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://slincsilver.ddns.net:3000/');
  
  await page.getByRole('textbox', { name: 'Cédula de identidad' }).click();
  await page.getByRole('textbox', { name: 'Cédula de identidad' }).fill('11111111');
  await page.getByRole('textbox', { name: 'Contraseña' }).click();
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('password1');
  await page.getByRole('button', { name: 'Iniciar' }).click();
  await page.getByRole('link', { name: 'Perros' }).click();
  await page.getByRole('button', { name: 'Agregar perro' }).click();
  await page.getByRole('textbox', { name: 'Nombre' }).click();
  await page.getByRole('textbox', { name: 'Nombre' }).fill('Bichote');
  await page.getByRole('combobox').click();
  await page.getByLabel('Joaco Piedras Blancas').getByText('Joaco Piedras Blancas').click();
  await page.getByRole('textbox', { name: 'Descripción' }).click();
  await page.getByRole('textbox', { name: 'Descripción' }).fill('Texto de ejemplo');
  await page.getByRole('textbox', { name: 'Fuertes' }).click();
  await page.getByRole('textbox', { name: 'Fuertes' }).fill('Texto de ejemplo');
  await page.getByRole('button', { name: 'Confirmar' }).click();
  await page.getByText('SS', { exact: true }).click();
  await page.getByRole('menuitem', { name: 'Cerrar sesión' }).click();

  await page.getByRole('textbox', { name: 'Cédula de identidad' }).click();
  await page.getByRole('textbox', { name: 'Cédula de identidad' }).fill('11111116');
  await page.getByRole('textbox', { name: 'Contraseña' }).click();
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Contrasenia');
  await page.getByRole('button', { name: 'Iniciar' }).click();
  await page.getByText('JP').click();
  await page.getByRole('menuitem', { name: 'Perfil de Bichote' }).first().click();
  await expect(page.getByRole('heading', { name: 'Bichote' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Eliminar Perro' })).not.toBeVisible();
  await page.getByText('JP').click();
  await page.getByRole('menuitem', { name: 'Cerrar sesión' }).click();
  
  await page.getByRole('textbox', { name: 'Cédula de identidad' }).click();
  await page.getByRole('textbox', { name: 'Cédula de identidad' }).fill('11111111');
  await page.getByRole('textbox', { name: 'Contraseña' }).click();
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('password1');
  await page.getByRole('button', { name: 'Iniciar' }).click();
  await page.getByRole('link', { name: 'Perros' }).click();
  await page.getByText('Joaco Piedras Blancas').first().click();
  await page.getByRole('button', { name: 'Eliminar Perro' }).click();
  await page.getByRole('button', { name: 'Si, eliminar' }).click();
  await page.getByText('SS', { exact: true }).click();
  await page.getByRole('menuitem', { name: 'Cerrar sesión' }).click();

  await page.getByRole('textbox', { name: 'Cédula de identidad' }).click();
  await page.getByRole('textbox', { name: 'Cédula de identidad' }).fill('11111116');
  await page.getByRole('textbox', { name: 'Contraseña' }).click();
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Contrasenia');
  await page.getByRole('button', { name: 'Iniciar' }).click();
});