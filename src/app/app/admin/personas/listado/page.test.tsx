import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ListadoPersonas from "./page";
import { describe, afterEach, it, expect, vi } from "vitest";

// Mock del fetch global
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("ListadoPersonas", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("muestra mensaje 'No hay datos disponibles' si no hay usuarios", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [], totalPages: 1 }),
    });

    render(<ListadoPersonas />);

    expect(
      await screen.findByText("No hay datos disponibles")
    ).toBeInTheDocument();
  });

  it("muestra lista de usuarios cuando la API responde con datos", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            {
              nombre: "Nicolas Jackson",
              ci: "12345678",
              celular: "099111111",
              banco: "BROU",
              cuentaBancaria: "00112233",
              perros: [{ nombre: "Rex" }],
            },
          ],
          totalPages: 1,
        }),
    });

    render(<ListadoPersonas />);

    // esperamos a que se muestre el nombre
    expect(await screen.findByText("Nicolas Jackson")).toBeInTheDocument();
    expect(screen.getByText("12345678")).toBeInTheDocument();
    expect(screen.getByText("099111111")).toBeInTheDocument();
    expect(screen.getByText("BROU")).toBeInTheDocument();
    expect(screen.getByText("00112233")).toBeInTheDocument();
    expect(screen.getByText("Rex")).toBeInTheDocument();
  });

  it("muestra mensaje de error si el fetch falla", async () => {
    mockFetch.mockRejectedValueOnce(new Error("API error"));

    render(<ListadoPersonas />);

    expect(
      await screen.findByText("Error al obtener usuarios.")
    ).toBeInTheDocument();
  });

  it("cambia de página y de mock al hacer click en 'Siguiente'", async () => {
    // Página 1
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [{ nombre: "Usuario Página 1" }],
          totalPages: 2,
        }),
    });

    render(<ListadoPersonas />);

    // Verificamos que muestra página 1 y el usuario correspondiente
    expect(await screen.findByText("Usuario Página 1")).toBeInTheDocument();
    expect(screen.getByText("Página 1 de 2")).toBeInTheDocument();

    // Página 2
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [{ nombre: "Usuario Página 2" }],
          totalPages: 2,
        }),
    });

    // Tomamos el botón "Siguiente"
    const botones = screen.getAllByRole("button");
    const botonSiguiente = botones[1]; // el segundo botón es el de "Siguiente"
    botonSiguiente.click();

    // Ahora debería mostrar página 2 y el usuario de la segunda página
    expect(await screen.findByText("Usuario Página 2")).toBeInTheDocument();
    expect(screen.getByText("Página 2 de 2")).toBeInTheDocument();
  });

  it("cambia de página y muestra usuarios diferentes", async () => {
    // Primer fetch (página 1)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            {
              nombre: "Nicolas Jackson",
              ci: "12345678",
              celular: "099111111",
              banco: "BROU",
              cuentaBancaria: "00112233",
              perros: [{ nombre: "Rex" }],
            },
          ],
          totalPages: 2,
        }),
    });

    // Segundo fetch (página 2)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            {
              nombre: "Darwin Núñez",
              ci: "87654321",
              celular: "098222222",
              banco: "Santander",
              cuentaBancaria: "99887766",
              perros: [{ nombre: "Firulais" }],
            },
          ],
          totalPages: 2,
        }),
    });

    render(<ListadoPersonas />);

    // Verificamos que aparece el usuario de la página 1
    expect(await screen.findByText("Nicolas Jackson")).toBeInTheDocument();

    // Simulamos clic en el botón "siguiente página"
    const buttons = screen.getAllByRole("button");
    const nextButton = buttons[1]; // el de la derecha (ArrowRight)
    await userEvent.click(nextButton);

    // Verificamos que aparece el usuario de la página 2
    expect(await screen.findByText("Darwin Núñez")).toBeInTheDocument();
    expect(screen.getByText("87654321")).toBeInTheDocument();
  });

  it("deshabilita los botones de paginación en los extremos", async () => {
    // Mock para la primera y única página
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [{ nombre: "Único Usuario" }],
          totalPages: 1,
        }),
    });

    render(<ListadoPersonas />);

    // Esperamos a que el componente cargue los datos y el texto de paginación
    await screen.findByText("Página 1 de 1");

    // Ahora podemos buscar los botones por su aria-label
    const prevButton = screen.getByRole("button", { name: "Página anterior" });
    const nextButton = screen.getByRole("button", { name: "Página siguiente" });

    // Verificamos que ambos botones estén deshabilitados
    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });

  it("el botón de 'Anterior' se habilita al avanzar y se deshabilita al retroceder a la primera página", async () => {
    // Mock para la primera página
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [{ nombre: "Usuario 1" }],
          totalPages: 2,
        }),
    });

    render(<ListadoPersonas />);

    // Espera a que la paginación se muestre
    await screen.findByText("Página 1 de 2");

    // Usa los selectores de Testing Library para encontrar los botones por su aria-label
    // Esto funciona gracias a lo que se agregó en el page.tsx
    const prevButton = screen.getByRole("button", { name: "Página anterior" });
    const nextButton = screen.getByRole("button", { name: "Página siguiente" });

    // En la página 1, el botón "Anterior" debe estar deshabilitado
    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();

    // ... (el resto del test sigue igual)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [{ nombre: "Usuario 2" }],
          totalPages: 2,
        }),
    });

    await userEvent.click(nextButton);
    await screen.findByText("Página 2 de 2");

    expect(prevButton).not.toBeDisabled();
    expect(nextButton).toBeDisabled();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [{ nombre: "Usuario 1" }],
          totalPages: 2,
        }),
    });

    await userEvent.click(prevButton);
    await screen.findByText("Página 1 de 2");

    expect(prevButton).toBeDisabled();
  });

  it("muestra los datos nulos como cadenas vacías y los perros como enlaces", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            {
              nombre: "Usuario sin datos",
              ci: null,
              celular: "099111222",
              banco: null,
              cuentaBancaria: null,
              perros: [{ nombre: "Fido" }],
            },
            {
              nombre: "Usuario sin perro",
              ci: "11223344",
              celular: "099333444",
              banco: "Itau",
              cuentaBancaria: "11223344",
              perros: [],
            },
          ],
          totalPages: 1,
        }),
    });

    render(<ListadoPersonas />);

    // Esperamos a que se rendericen los usuarios
    await screen.findByText("Usuario sin datos");
    await screen.findByText("Usuario sin perro");

    // Buscamos las celdas que contienen los valores nulos o vacíos.
    // El texto vacío se presenta como un espacio, que se debe buscar
    // con un regex que incluya `^$` para indicar una cadena vacía
    const emptyCells = screen.getAllByText(/^$/);

    // Verificamos que las celdas nulas se rendericen como cadenas vacías
    expect(emptyCells[0]).toBeInTheDocument(); // la celda de C.I.
    expect(emptyCells[1]).toBeInTheDocument(); // la celda de Banco
    expect(emptyCells[2]).toBeInTheDocument(); // la celda de Cuenta

    // Verificamos que el nombre del perro es un enlace y tiene la URL correcta
    const perroLink = screen.getByRole("link", { name: "Fido" });
    expect(perroLink).toBeInTheDocument();
    expect(perroLink).toHaveAttribute("href", "/app/admin/perros/detalle/Fido");

    // Verificamos que el usuario sin perros muestre 'No tiene'
    expect(screen.getByText("No tiene")).toBeInTheDocument();
  });

  it("el botón 'Agregar Persona' tiene el enlace correcto", () => {
    // Mock con datos mínimos para que el componente se renderice
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [], totalPages: 1 }),
    });

    render(<ListadoPersonas />);

    // Buscamos el enlace por su texto
    const addPersonLink = screen.getByRole("link", {
      name: /Agregar Persona/i,
    });

    // Verificamos que el enlace apunte a la ruta correcta
    expect(addPersonLink).toBeInTheDocument();
    expect(addPersonLink).toHaveAttribute("href", "/app/admin/personas/nueva");
  });
});
