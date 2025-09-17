import { render, screen} from "@testing-library/react";
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

    expect(await screen.findByText("No hay datos disponibles")).toBeInTheDocument();
  });

  it("muestra lista de usuarios cuando la API responde con datos", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
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

    expect(await screen.findByText("Error al obtener usuarios.")).toBeInTheDocument();
  });
});
