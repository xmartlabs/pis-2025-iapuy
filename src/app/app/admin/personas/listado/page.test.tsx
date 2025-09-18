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
});
