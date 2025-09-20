import { describe, it, expect, vi, beforeEach } from "vitest";
import { PerrosService } from "./perros.service";
import { PerrosController } from "../controller/perros.controller";
import { Perro } from "@/app/models/perro.entity";
import { Op } from "sequelize";

// --- Mocks de modelos ---
vi.mock("@/app/models/perro.entity", () => ({
  Perro: { findAndCountAll: vi.fn(), destroy: vi.fn() },
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

  // --- Tests findAll ---
  it("findAll should return paginated perros", async () => {
    (Perro.findAndCountAll as any).mockResolvedValue({
      count: 1,
      rows: [{ get: () => ({ id: 1, nombre: "Firulais", UsrPerros: [] }) }],
    });

    const pagination = { query: "", size: 10, getOffset: () => 0, getOrder: () => [] };
    const result = await service.findAll(pagination as any);

    expect(result.data[0].nombre).toBe("Firulais");
    expect(result.count).toBe(1);
  });

  it("findAll should handle empty results", async () => {
    (Perro.findAndCountAll as any).mockResolvedValue({ count: 0, rows: [] });

    const pagination = { query: "", size: 10, getOffset: () => 0, getOrder: () => [] };
    const result = await service.findAll(pagination as any);

    expect(result.data).toHaveLength(0);
    expect(result.count).toBe(0);
  });

  it("findAll should filter by query", async () => {
    (Perro.findAndCountAll as any).mockImplementation((args: any) => {
      const where = args.where;
      if (where?.nombre?.[Op.iLike] === "%Firulais%") {
        return { count: 1, rows: [{ get: () => ({ id: 1, nombre: "Firulais", UsrPerros: [] }) }] };
      }
      return { count: 0, rows: [] };
    });

    const pagination = { query: "Firulais", size: 10, getOffset: () => 0, getOrder: () => [] };
    const result = await service.findAll(pagination as any);

    expect(result.data[0].nombre).toBe("Firulais");
    expect(result.count).toBe(1);
  });

  it("findAll handles offset beyond total rows", async () => {
    (Perro.findAndCountAll as any).mockResolvedValue({ count: 2, rows: [] });

    const pagination = { query: "", size: 10, getOffset: () => 100, getOrder: () => [] };
    const result = await service.findAll(pagination as any);

    expect(result.data).toHaveLength(0);
    expect(result.count).toBe(2);
  });

  it("findAll passes order correctly", async () => {
    const mockFn = vi.fn().mockResolvedValue({ count: 1, rows: [{ get: () => ({ id: 1, nombre: "Firulais", UsrPerros: [] }) }] });
    (Perro.findAndCountAll as any) = mockFn;

    const pagination = { query: "", size: 10, getOffset: () => 0, getOrder: () => [["nombre", "ASC"]] };
    await service.findAll(pagination as any);

    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ order: [["nombre", "ASC"]] }));
  });

  it("findAll handles multiple rows", async () => {
    (Perro.findAndCountAll as any).mockResolvedValue({
      count: 2,
      rows: [
        { get: () => ({ id: 1, nombre: "Firulais", UsrPerros: [] }) },
        { get: () => ({ id: 2, nombre: "Bobby", UsrPerros: [] }) },
      ],
    });

    const pagination = { query: "", size: 10, getOffset: () => 0, getOrder: () => [] };
    const result = await service.findAll(pagination as any);

    expect(result.data).toHaveLength(2);
    expect(result.data.map(p => p.nombre)).toEqual(["Firulais", "Bobby"]);
  });

  it("findAll should propagate DB errors", async () => {
    (Perro.findAndCountAll as any).mockRejectedValue(new Error("DB error"));
    const pagination = { query: "", size: 10, getOffset: () => 0, getOrder: () => [] };

    await expect(service.findAll(pagination as any)).rejects.toThrow("DB error");
  });

  it("findAll should handle undefined query without where", async () => {
    const mockFn = vi.fn().mockResolvedValue({ count: 0, rows: [] });
    (Perro.findAndCountAll as any) = mockFn;

    const pagination = { query: undefined, size: 10, getOffset: () => 0, getOrder: () => [] };
    await service.findAll(pagination as any);

    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ where: undefined }));
  });

  it("findAll should pass limit = 0 if pagination size is 0", async () => {
    const mockFn = vi.fn().mockResolvedValue({ count: 0, rows: [] });
    (Perro.findAndCountAll as any) = mockFn;

    const pagination = { query: "", size: 0, getOffset: () => 0, getOrder: () => [] };
    await service.findAll(pagination as any);

    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ limit: 0 }));
  });

  // --- Tests delete ---
  it("delete returns true if perro is deleted", async () => {
    (Perro.destroy as any).mockResolvedValue(1);

    const result = await service.delete("1");
    expect(Perro.destroy).toHaveBeenCalledWith({ where: { id: "1" } });
    expect(result).toBe(true);
  });

  it("delete returns false if perro does not exist", async () => {
    (Perro.destroy as any).mockResolvedValue(0);

    const result = await service.delete("1");
    expect(Perro.destroy).toHaveBeenCalledWith({ where: { id: "1" } });
    expect(result).toBe(false);
  });

  it("delete propagates error", async () => {
    (Perro.destroy as any).mockRejectedValue(new Error("DB error"));

    await expect(service.delete("1")).rejects.toThrow("DB error");
  });
});

describe("PerrosController", () => {
  let controller: PerrosController;
  let service: PerrosService;

  beforeEach(() => {
    service = new PerrosService();
    controller = new PerrosController(service);
    vi.clearAllMocks();
  });

  // --- Tests deletePerro usando vi.spyOn ---
  it("deletePerro should return true when service.delete resolves true", async () => {
    vi.spyOn(service, "delete").mockResolvedValue(true);

    const result = await controller.deletePerro("1");
    expect(service.delete).toHaveBeenCalledWith("1");
    expect(result).toBe(true);
  });

  it("deletePerro should return false when service.delete resolves false", async () => {
    vi.spyOn(service, "delete").mockResolvedValue(false);

    const result = await controller.deletePerro("1");
    expect(service.delete).toHaveBeenCalledWith("1");
    expect(result).toBe(false);
  });

  it("deletePerro should return false when service.delete throws error", async () => {
    vi.spyOn(service, "delete").mockRejectedValue(new Error("DB error"));

    const result = await controller.deletePerro("1");
    expect(service.delete).toHaveBeenCalledWith("1");
    expect(result).toBe(false);
  });
});
