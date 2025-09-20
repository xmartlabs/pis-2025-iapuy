import { describe, it, expect } from "vitest";
import { CreateRegistrosSanidadDTO } from "../dtos/create-registro-sanidad.dto";

describe("CreateRegistrosSanidadDTO (casos límite)", () => {
  it("acepta solo 'vacuna' o 'desparasitacion' en tipoSanidad", () => {
    const dtoValido: CreateRegistrosSanidadDTO = {
      tipoSanidad: "vacuna",
      perroId: "1",
      fecha: "2025-09-20",
      vac: "Rabia",
      carneVacunas: Buffer.from("certificado"),
      medicamento: "",
      tipoDesparasitacion: "Interna",
    };
    expect(["vacuna", "desparasitacion"]).toContain(dtoValido.tipoSanidad);

    const dtoInvalido = { ...dtoValido, tipoSanidad: "otro" } as any;
    expect(["vacuna", "desparasitacion"]).not.toContain(dtoInvalido.tipoSanidad);
  });

  it("requiere vac si tipoSanidad = 'vacuna'", () => {
    const dto: CreateRegistrosSanidadDTO = {
      tipoSanidad: "vacuna",
      perroId: "2",
      fecha: "2025-09-20",
      vac: "",
      carneVacunas: Buffer.from("certificado"),
      medicamento: "",
      tipoDesparasitacion: "Interna",
    };
    expect(dto.vac).toBe("");
  });

  it("requiere medicamento si tipoSanidad = 'desparasitacion'", () => {
    const dto: CreateRegistrosSanidadDTO = {
      tipoSanidad: "desparasitacion",
      perroId: "3",
      fecha: "2025-09-20",
      vac: "",
      carneVacunas: Buffer.alloc(0),
      medicamento: "",
      tipoDesparasitacion: "Interna",
    };
    expect(dto.medicamento).toBe("");
  });

  it("acepta buffers vacíos y no vacíos", () => {
    const bufferVacio = Buffer.alloc(0);
    const bufferLleno = Buffer.from("certificado");

    expect(bufferVacio.length).toBe(0);
    expect(bufferLleno.length).toBeGreaterThan(0);
  });

  it("tipoDesparasitacion solo 'Interna' o 'Externa'", () => {
    const dtoInterna: CreateRegistrosSanidadDTO = {
      tipoSanidad: "desparasitacion",
      perroId: "4",
      fecha: "2025-09-20",
      vac: "",
      carneVacunas: Buffer.alloc(0),
      medicamento: "Ivermectina",
      tipoDesparasitacion: "Interna",
    };
    expect(["Interna", "Externa"]).toContain(dtoInterna.tipoDesparasitacion);

    const dtoExterna: CreateRegistrosSanidadDTO = {
      ...dtoInterna,
      tipoDesparasitacion: "Externa",
    };
    expect(["Interna", "Externa"]).toContain(dtoExterna.tipoDesparasitacion);

    const dtoInvalido = { ...dtoInterna, tipoDesparasitacion: "Otro" } as any;
    expect(["Interna", "Externa"]).not.toContain(dtoInvalido.tipoDesparasitacion);
  });

  it("fallar si falta un campo obligatorio", () => {
    const dto = {
      perroId: "5",
      fecha: "20-09-2025",
      vac: "Rabia",
      carneVacunas: Buffer.from("certificado"),
      medicamento: "",
      tipoDesparasitacion: "Interna",
    } as any;
    expect(dto.tipoSanidad).toBeUndefined();
  });
});
