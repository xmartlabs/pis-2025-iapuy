import { describe, it, expect, vi, beforeEach } from "vitest";
import { PerrosService } from "./perros.service";
import { PerrosController } from "../controller/perros.controller";
import { Perro } from "@/app/models/perro.entity";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import type { PayloadForUser } from "../detalles/route";


vi.mock("@/app/models/perro.entity", () => ({
  Perro: {
    findAndCountAll: vi.fn(),
    destroy: vi.fn(),
    findByPk: vi.fn(),  
  },
}));

vi.mock("@/app/models/user.entity", () => ({ User: {} }));
vi.mock("@/app/models/usrperro.entity", () => ({ UsrPerro: {} }));
vi.mock("@/app/models/intervencion.entity", () => ({ Intervencion: {} }));
vi.mock("@/app/models/registro-sanidad.entity", () => ({ RegistroSanidad: {} }));
vi.mock("@/app/models/vacuna.entity", () => ({ Vacuna: {} }));
vi.mock("@/lib/pagination/transform", () => ({
  getPaginationResultFromModel: (_pagination: unknown, processed: { rows: unknown[]; count: number }) => ({
    data: processed.rows,
    count: processed.count,
  }),
}));

describe("PerrosService", () => {
  let service: PerrosService = {} as PerrosService;
  beforeEach(() => {
    service = new PerrosService();
    vi.clearAllMocks();
  });

  // --- Tests findAll ---
  it("findAll should return paginated perros", async () => {
    vi.spyOn(Perro, "findAndCountAll").mockResolvedValue(
    {
      count: 1,
      rows: [
        { get: () => ({ id: 1, nombre: "Firulais", UsrPerros: [] }) },
      ],
    } as unknown as Awaited<ReturnType<typeof Perro.findAndCountAll>>
  );

  const pagination: PaginationDto = {
    query: "",
    size: 10,
    page: 1,           
    getOffset: () => 0,
    getOrder: () => [],
  };

  const result = await service.findAll(pagination);

  expect(result.data[0].nombre).toBe("Firulais");
  expect(result.count).toBe(1);
});

  it("findAll should handle empty results", async () => {

    vi.spyOn(Perro, "findAndCountAll").mockResolvedValue(
      {
        count: 0,
        rows: [],
      } as unknown as Awaited<ReturnType<typeof Perro.findAndCountAll>>
    );

    
    const pagination: PaginationDto = {
      page: 1,           
      size: 10,
      query: "",
      getOffset: () => 0,
      getOrder: () => [],
    };

    const result = await service.findAll(pagination);

    expect(result.data).toHaveLength(0);
    expect(result.count).toBe(0);
  });

  it("findAll should return paginated perros", async () => {
    vi.spyOn(Perro, "findAndCountAll").mockImplementation(() =>
      Promise.resolve({
        count: 1,
        rows: [{ get: () => ({ id: 1, nombre: "Firulais", UsrPerros: [] }) }],
      } as unknown as ReturnType<typeof Perro.findAndCountAll>)
    );

    const pagination: PaginationDto = {
      page: 1,
      size: 10,
      query: "Firulais",
      getOffset: () => 0,
      getOrder: () => [],
    };

    const result = await service.findAll(pagination);

    expect(result.data[0].nombre).toBe("Firulais");
    expect(result.count).toBe(1);
  });
  it("findAll handles offset beyond total rows", async () => {

    vi.spyOn(Perro, "findAndCountAll").mockImplementation(() =>
      Promise.resolve({
        count: 2,
        rows: [],
      } as unknown as ReturnType<typeof Perro.findAndCountAll>)
    );

    const pagination: PaginationDto = {
      page: 11, 
      size: 10,
      query: "",
      getOffset: () => 100, 
      getOrder: () => [],
    };

    const result = await service.findAll(pagination);

    expect(result.data).toHaveLength(0);
    expect(result.count).toBe(2);
  });

  it("findAll passes order correctly", async () => {
    const mockFn = vi
      .spyOn(Perro, "findAndCountAll")
      .mockImplementation(() =>
        Promise.resolve({
          count: 1,
          rows: [{ get: () => ({ id: 1, nombre: "Firulais", UsrPerros: [] }) }],
        } as unknown as ReturnType<typeof Perro.findAndCountAll>)
      );

    const pagination: PaginationDto = {
      page: 1,
      size: 10,
      query: "",
      getOffset: () => 0,
      getOrder: () => [["nombre", "ASC"]],
    };

    await service.findAll(pagination);
    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ order: [["nombre", "ASC"]] }));
  });

  it("findAll handles multiple rows", async () => {
  
    vi.spyOn(Perro, "findAndCountAll").mockImplementation(() =>
      Promise.resolve({
        count: 2,
        rows: [
          { get: () => ({ id: 1, nombre: "Firulais", UsrPerros: [] }) },
          { get: () => ({ id: 2, nombre: "Bobby", UsrPerros: [] }) },
        ],
      } as unknown as ReturnType<typeof Perro.findAndCountAll>)
    );

    const pagination: PaginationDto = {
      page: 1,
      size: 10,
      query: "",
      getOffset: () => 0,
      getOrder: () => [],
    };

    const result = await service.findAll(pagination);

    expect(result.data).toHaveLength(2);
    expect(result.data.map((p) => p.nombre)).toEqual(["Firulais", "Bobby"]);
  });

  it("findAll should propagate DB errors", async () => {
  
    vi.spyOn(Perro, "findAndCountAll").mockImplementation(() =>
      Promise.reject(new Error("DB error"))
    );

    const pagination: PaginationDto = {
      page: 1,
      size: 10,
      query: "",
      getOffset: () => 0,
      getOrder: () => [],
    };

    await expect(service.findAll(pagination)).rejects.toThrow("DB error");
  });

  it("findAll should handle undefined query without where", async () => {
    const mockFn = vi.spyOn(Perro, "findAndCountAll").mockImplementation(() =>
      Promise.resolve({
        count: 0,
        rows: [],
      } as unknown as ReturnType<typeof Perro.findAndCountAll>)
    );

    const pagination: PaginationDto = {
      page: 1,
      size: 10,
      query: undefined,
      getOffset: () => 0,
      getOrder: () => [],
    };

    await service.findAll(pagination);

    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ where: undefined }));
  });

  it("findAll should pass limit = 0 if pagination size is 0", async () => {
    const mockFn = vi.spyOn(Perro, "findAndCountAll").mockImplementation(() =>
      Promise.resolve({
        count: 0,
        rows: [],
      } as unknown as ReturnType<typeof Perro.findAndCountAll>)
    );

    const pagination: PaginationDto = {
      page: 1,
      size: 0,
      query: "",
      getOffset: () => 0,
      getOrder: () => [],
    };

    await service.findAll(pagination);

    // en la implementación dentro del service el limit solo se establece si pagination.size > 0:
    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ limit: undefined }));
  });

  // --- Tests delete ---
  it("delete returns true if perro is deleted", async () => {
    const mockFn = vi.spyOn(Perro, "destroy").mockResolvedValue(1);

    const result = await service.delete("1");

    expect(mockFn).toHaveBeenCalledWith({ where: { id: "1" } });
    expect(result).toBe(true);
  });


  it("delete returns false if perro does not exist", async () => {
    const mockFn = vi.spyOn(Perro, "destroy").mockResolvedValue(0);

    const result = await service.delete("1");

    expect(mockFn).toHaveBeenCalledWith({ where: { id: "1" } });
    expect(result).toBe(false);
  });

  it("delete propagates error", async () => {
    vi.spyOn(Perro, "destroy").mockRejectedValue(new Error("DB error"));

    await expect(service.delete("1")).rejects.toThrow("DB error");
  });


it("findAll should calculate intervencionCount from UsrPerros", async () => {
  vi.spyOn(Perro, "findAndCountAll").mockImplementation(() =>
    Promise.resolve({
      count: 1,
      rows: [
        {
          get: () => ({
            id: 1,
            nombre: "Firulais",
            UsrPerros: [{ id: 10 }, { id: 20 }],
          }),
        },
      ],
    } as unknown as ReturnType<typeof Perro.findAndCountAll>)
  );

  const pagination: PaginationDto = {
    page: 1,
    size: 10,
    query: "",
    getOffset: () => 0,
    getOrder: () => [],
  };

  const result = await service.findAll(pagination);

  type PerroWithCount = Perro & { intervencionCount: number };

  const firulais = result.data[0] as PerroWithCount;

  expect(firulais.intervencionCount).toBe(2);
  expect(firulais.UsrPerros).toBeUndefined();
});


it("should return perro details when found", async () => {
  type MockPerro = {
    id: number;
    nombre: string;
    descripcion: string;
    fortalezas: string;
    duenioId: number;
    User: { nombre: string; ci: string };
    deletedAt: Date | null;
  };

  const mockPerro: MockPerro = {
    id: 1,
    nombre: "Firulais",
    descripcion: "Un perro muy bueno",
    fortalezas: "Leal",
    duenioId: 2,
    User: { nombre: "Juan", ci: "12345678" },
    deletedAt: null,
  };

  vi.spyOn(Perro as unknown as { findByPk: (id: string) => Promise<MockPerro | null> }, "findByPk")
    .mockResolvedValue(mockPerro);

  const result = await service.findOne("1", { ci: "123", name: "test", type: "Administrador" } as PayloadForUser);

  expect(result.status).toBe(200);
  expect(result.perro).toBeDefined();
  expect(result.perro!.id).toBe(1);
  expect(result.perro!.nombre).toBe("Firulais");
  expect(result.perro!.descripcion).toBe("Un perro muy bueno");
  expect(result.perro!.fortalezas).toBe("Leal");
  expect(result.perro!.duenioId).toBe(2);
  expect(result.perro!.deletedAt).toBe(null);
  expect(result.perro!.duenioNombre).toBe("Juan");
});

it("should return error when perro not found", async () => {
    vi.spyOn(Perro as unknown as { findByPk: (id: string) => Promise<null> }, "findByPk")
      .mockResolvedValue(null);

  const result = await service.findOne("120", { ci: "123", name: "test", type: "Administrador" } as PayloadForUser);

    expect(result.status).toBe(404);
    expect(result.error).toBe("Perro no encontrado");
  });

});
  describe("PerrosController", () => {
  let controller: PerrosController = null!;
  let service: PerrosService = null!;

  beforeEach(() => {
    service = new PerrosService();
    controller = new PerrosController(service);
    vi.clearAllMocks();
  });

  // --- Tests deletePerro usando vi.spyOn ---
  it("deletePerro should return true when service.delete resolves true", async () => {
    vi.spyOn(service, "delete").mockResolvedValue(true);

    const result = await controller.deletePerro("1");
    vi.spyOn(service, "delete" as keyof PerrosService).mockResolvedValue(true);
    expect(result).toBe(true);
  });

  it("deletePerro should return false when service.delete resolves false", async () => {
    vi.spyOn(service, "delete").mockResolvedValue(false);

    const result = await controller.deletePerro("1");
    vi.spyOn(service, "delete" as keyof PerrosService).mockResolvedValue(true);

    expect(result).toBe(false);
  });

  it("deletePerro should return false when service.delete throws error", async () => {
    vi.spyOn(service, "delete").mockRejectedValue(new Error("DB error"));

    const result = await controller.deletePerro("1");
    vi.spyOn(service, "delete" as keyof PerrosService).mockResolvedValue(true);

    expect(result).toBe(false);
  });
});
