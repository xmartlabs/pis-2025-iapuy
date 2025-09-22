import { describe, it, expect, vi, beforeEach } from "vitest";
import { PerrosService } from "./perros.service";
import { Perro as PerroModel } from "@/app/models/perro.entity";
import { Op } from "sequelize";


// Mock de entidades
vi.mock("@/app/models/perro.entity", () => ({
  Perro: { findAndCountAll: vi.fn() },
}));
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

describe("PerrosService", () => {
  let service: PerrosService;

  beforeEach(() => {
    service = new PerrosService();
    vi.clearAllMocks();
  });

  it("findAll should return paginated perros", async () => {
    // Mock de la respuesta de Sequelize
    (PerroModel.findAndCountAll as any).mockResolvedValue({
      count: 1,
      rows: [
        {
          get: () => ({
            id: 1,
            nombre: "Firulais",
          }),
        },
      ],
    });

    const pagination = {
      query: "",
      size: 10,
      getOffset: () => 0,
      getOrder: () => [],
    };

    const result = await service.findAll(pagination as any);

    const firulais = result.data[0];

    expect(firulais.nombre).toBe("Firulais");
    expect(result.count).toBe(1);
  });

  it("findAll should handle empty results", async () => {
    (PerroModel.findAndCountAll as any).mockResolvedValue({
      count: 0,
      rows: [],
    });

    const pagination = { query: "", size: 10, getOffset: () => 0, getOrder: () => [] };
    const result = await service.findAll(pagination as any);

    expect(result.data).toHaveLength(0);
    expect(result.count).toBe(0);
  });

  it("findAll should filter by query", async () => {
    (PerroModel.findAndCountAll as any).mockImplementation((args: any) => {
      const where = args.where;
      if (where?.nombre?.[Op.iLike] === "%Firulais%") {
        return { count: 1, rows: [{ get: () => ({ id: 1, nombre: "Firulais" }) }] };
      }
      return { count: 0, rows: [] };
    });

    const pagination = { query: "Firulais", size: 10, getOffset: () => 0, getOrder: () => [] };
    const result = await service.findAll(pagination as any);

    expect(result.data[0].nombre).toBe("Firulais");
    expect(result.count).toBe(1);
  });
  it("findAll handles offset beyond total rows", async () => {
    (PerroModel.findAndCountAll as any).mockResolvedValue({
      count: 2,
      rows: [],
    });

    const pagination = { query: "", size: 10, getOffset: () => 100, getOrder: () => [] };
    const result = await service.findAll(pagination as any);

    expect(result.data).toHaveLength(0);
    expect(result.count).toBe(2);
  });
  it("findAll passes order correctly", async () => {
    const mockFn = vi.fn().mockResolvedValue({ count: 1, rows: [{ get: () => ({ id: 1, nombre: "Firulais" }) }] });
    (PerroModel.findAndCountAll as any) = mockFn;

    const pagination = { query: "", size: 10, getOffset: () => 0, getOrder: () => [["nombre", "ASC"]] };
    await service.findAll(pagination as any);

    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ order: [["nombre", "ASC"]] }));
  });

  it("findAll handles multiple rows", async () => {
    (PerroModel.findAndCountAll as any).mockResolvedValue({
      count: 2,
      rows: [
        { get: () => ({ id: 1, nombre: "Firulais" }) },
        { get: () => ({ id: 2, nombre: "Bobby" }) },
      ],
    });

    const pagination = { query: "", size: 10, getOffset: () => 0, getOrder: () => [] };
    const result = await service.findAll(pagination as any);

    expect(result.data).toHaveLength(2);
    expect(result.data.map(p => p.nombre)).toEqual(["Firulais", "Bobby"]);
  });

  it("findAll should propagate DB errors", async () => {
    (PerroModel.findAndCountAll as any).mockRejectedValue(new Error("DB error"));
    const pagination = { query: "", size: 10, getOffset: () => 0, getOrder: () => [] };

    await expect(service.findAll(pagination as any)).rejects.toThrow("DB error");
  });

it("findAll should handle undefined query without where", async () => {
  const mockFn = vi.fn().mockResolvedValue({ count: 0, rows: [] });
  (PerroModel.findAndCountAll as any) = mockFn;

  const pagination = { query: undefined, size: 10, getOffset: () => 0, getOrder: () => [] };
  await service.findAll(pagination as any);

  expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ where: undefined }));
});
it("findAll should pass limit = 0 if pagination size is 0", async () => {
  const mockFn = vi.fn().mockResolvedValue({ count: 0, rows: [] });
  (PerroModel.findAndCountAll as any) = mockFn;

  const pagination = { query: "", size: 0, getOffset: () => 0, getOrder: () => [] };
  await service.findAll(pagination as any);

  expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ limit: 0 }));
});
it("findAll should calculate intervencionCount from UsrPerros", async () => {
  (PerroModel.findAndCountAll as any).mockResolvedValue({
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
  });

  const pagination = { query: "", size: 10, getOffset: () => 0, getOrder: () => [] };
  const result = await service.findAll(pagination as any);

  
  const firulais = result.data[0] as any;

  expect(firulais.intervencionCount).toBe(2);
  expect(firulais.UsrPerros).toBeUndefined();
});

it("should return perro details when found", async () => {
    const mockPerro = {
      id: 1,
      nombre: "Firulais",
      descripcion: "Un perro muy bueno",
      fortalezas: "Leal",
      duenioId: 2,
      User: { nombre: "Juan", ci: "12345678" },
      deletedAt: null,
    };
    // Mock de findByPk para devolver un perro
    (PerroModel.findByPk as any) = vi.fn().mockResolvedValue(mockPerro);

    const service = new PerrosService();
    const result = await service.findOne("1");

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
    (PerroModel.findByPk as any) = vi.fn().mockResolvedValue(null);

    const service = new PerrosService();
    const result = await service.findOne("120");

    expect(result.status).toBe(404);
    expect(result.error).toBe("Perro no encontrado");
  });
});