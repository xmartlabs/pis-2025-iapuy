import { describe, it, expect, beforeEach, vi } from "vitest";
import { PerrosController } from "@/app/api/perros/controller/perros.controller";
import type { NextRequest } from "next/server";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import type { Perro } from "@/app/models/perro.entity";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";

// --- Mock del servicio con tipos correctos ---
interface MockPerrosService {
  findAll: (pagination: PaginationDto) => Promise<PaginationResultDto<Perro>>;
  create: (dto: Partial<Perro>) => Promise<Perro>;
}

// eslint-disable-next-line init-declarations
let controller: PerrosController;
// eslint-disable-next-line init-declarations
let service: MockPerrosService;

beforeEach(() => {
  service = {
    findAll: vi.fn(),
    create: vi.fn(),
  };
  controller = new PerrosController(service);
  vi.clearAllMocks();
});

describe("PerrosController", () => {
  it("getPerros debería devolver lista de perros", async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    (service.findAll as unknown as vi.Mock).mockResolvedValue({
      data: [{ id: "1", nombre: "Rex" } as Perro],
      totalItems: 1,
      totalPages: 1,
      page: 1,
      size: 10,
      count: 1,
    });

    const pagination: PaginationDto = {
      query: "",
      page: 1,
      size: 10,
      getOffset: () => 0,
      getOrder: () => [],
    };

    const res = await controller.getPerros(pagination);

    expect(service.findAll).toHaveBeenCalled();
    expect(res.data[0].nombre).toBe("Rex");
  });

  it("createPerro debería devolver perro creado", async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    (service.create as unknown as vi.Mock).mockResolvedValue({
      id: "2",
      nombre: "Lassie",
      descripcion: "Collie",
      fortalezas: "Inteligente",
      duenioId: "321",
      createdAt: new Date(),
    });

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    (service.create as unknown as vi.Mock).mockRejectedValue(new Error("DB error"));

    const mockRequest = {
      json: vi.fn().mockResolvedValue({ nombre: "ErrorDog" }),
    } as unknown as NextRequest;

    await expect(controller.createPerro(mockRequest)).rejects.toThrow("DB error");
  });
});
