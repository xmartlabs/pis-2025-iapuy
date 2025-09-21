// src/app/api/perros/controller/perros.controller.test.ts
import "reflect-metadata";
import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mocks que deben ejecutarse antes de importar cualquier módulo que pueda inicializar sequelize ---
vi.mock("@/app/models/perro.entity", () => ({ Perro: {} }));
vi.mock("@/app/models/user.entity", () => ({ User: {} }));
vi.mock("@/app/models/usrperro.entity", () => ({ UsrPerro: {} }));
vi.mock("@/app/models/intervencion.entity", () => ({ Intervencion: {} }));
vi.mock("@/app/models/registro-sanidad.entity", () => ({ RegistroSanidad: {} }));
vi.mock("@/app/models/vacuna.entity", () => ({ Vacuna: {} }));

vi.mock("@/lib/pagination/transform", () => ({
  getPaginationResultFromModel: (_pagination: any, processed: any) => ({
    data: processed.rows,
    count: processed.count,
  }),
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((data, opts) => ({ data, ...opts })),
  },
}));
// --------------------------------------------------------------------------------------------

import { PerrosController } from "@/app/api/perros/controller/perros.controller";
import type { NextRequest } from "next/server";

describe("PerrosController", () => {
  let controller: PerrosController;
  let service: any;

  beforeEach(() => {
    // limpiar mocks primero para evitar efectos entre tests
    vi.clearAllMocks();

    service = {
      findAll: vi.fn(),
      create: vi.fn(),
    };
    controller = new PerrosController(service);
  });

  it("getPerros debería devolver lista de perros", async () => {
    service.findAll.mockResolvedValue({ data: [{ id: 1, nombre: "Rex" }] });

    const res = await controller.getPerros({} as any);

    expect(service.findAll).toHaveBeenCalled();
    expect(res.data[0].nombre).toBe("Rex");
  });

  it("createPerro debería devolver perro creado", async () => {
    service.create.mockResolvedValue({ id: 2, nombre: "Lassie" });

    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        nombre: "Lassie",
        descripcion: "Collie",
        fortalezas: "Inteligente",
        duenioId: "321",
      }),
    } as unknown as NextRequest;

    const res = await controller.createPerro(mockRequest);

    expect(service.create).toHaveBeenCalledWith({
      nombre: "Lassie",
      descripcion: "Collie",
      fortalezas: "Inteligente",
      duenioId: "321",
    });
    expect(res.nombre).toBe("Lassie");
  });

  it("createPerro debería propagar error si el servicio falla", async () => {
    service.create.mockRejectedValue(new Error("DB error"));

    const mockRequest = {
      json: vi.fn().mockResolvedValue({ nombre: "ErrorDog" }),
    } as unknown as NextRequest;

    await expect(controller.createPerro(mockRequest)).rejects.toThrow("DB error");
  });
});

