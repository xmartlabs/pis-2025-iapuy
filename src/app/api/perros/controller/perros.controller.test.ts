import { describe, it, expect, vi, beforeEach } from "vitest";
import { PerrosController } from "@/app/api/perros/controller/perros.controller";
import type { NextRequest } from "next/server";

describe("PerrosController", () => {
  let controller: PerrosController;
  let service: any;

  beforeEach(() => {
    service = {
      findAll: vi.fn(),
      create: vi.fn(),
    };
    controller = new PerrosController(service);
    vi.clearAllMocks();
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
