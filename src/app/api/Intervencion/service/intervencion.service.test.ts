import { describe, it, expect, vi, beforeEach } from "vitest";
import { IntervencionService } from "./Intervencion.service";
import { Intervencion } from "@/app/models/intervencion.entity";
import { Op } from "sequelize";

// Mocks de modelos
vi.mock("@/app/models/intervencion.entity", () => ({ Intervencion: { findAndCountAll: vi.fn() } }));
vi.mock("@/app/models/institucion.entity", () => ({ Institucion: {} }));
vi.mock("@/app/models/usrperro.entity", () => ({ UsrPerro: {} }));
vi.mock("@/lib/pagination/transform", () => ({
  getPaginationResultFromModel: (_pagination: any, processed: any) => ({
    data: (processed.rows || []).map((r: any) => (typeof r.get === "function" ? r.get() : r)),
    count: processed.count,
  }),
}));

describe("IntervencionService", () => {
  let service: IntervencionService;

  beforeEach(() => {
    service = new IntervencionService();
    vi.clearAllMocks();
  });

  it("findAll should return paginated intervenciones", async () => {
    (Intervencion.findAndCountAll as any).mockResolvedValue({
      count: 1,
      rows: [{ get: () => ({ id: 1, descripcion: "Corte de emergencia", Institucion: { id: 2, nombre: "Inst A" } }) }],
    });

    const pagination = { query: "", size: 10, getOffset: () => 0, getOrder: () => [] };
    const result = await service.findAll(pagination as any);

    expect(result.data[0].descripcion).toBe("Corte de emergencia");
    expect(result.count).toBe(1);
  });

  it("findAll should handle empty results", async () => {
    (Intervencion.findAndCountAll as any).mockResolvedValue({ count: 0, rows: [] });

    const pagination = { query: "", size: 10, getOffset: () => 0, getOrder: () => [] };
    const result = await service.findAll(pagination as any);

    expect(result.data).toHaveLength(0);
    expect(result.count).toBe(0);
  });

  it("findAll should filter by institucion nombre when query provided", async () => {
    (Intervencion.findAndCountAll as any).mockImplementation((args: any) => {
      const include = args.include || [];
      // detectamos el include de Institucion por sus attributes y la presencia de where.nombre
      const inst = include.find((i: any) => Array.isArray(i.attributes) && i.attributes.includes("nombre"));
      const where = inst?.where;
      if (where?.nombre?.[Op.iLike] === "%Inst A%") {
        return { count: 1, rows: [{ get: () => ({ id: 1, descripcion: "Corte", Institucion: { id: 2, nombre: "Inst A" } }) }] };
      }
      return { count: 0, rows: [] };
    });

    const pagination = { query: "Inst A", size: 10, getOffset: () => 0, getOrder: () => [] };
    const result = await service.findAll(pagination as any);

    expect(result.data[0].descripcion).toBe("Corte");
    expect(result.count).toBe(1);
  });

  it("findAll passes order correctly", async () => {
    const mockFn = vi.fn().mockResolvedValue({ count: 1, rows: [{ get: () => ({ id: 1, descripcion: "Corte" }) }] });
    (Intervencion.findAndCountAll as any) = mockFn;

    const pagination = { query: "", size: 10, getOffset: () => 0, getOrder: () => [["descripcion", "ASC"]] };
    await service.findAll(pagination as any);

    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ order: [["descripcion", "ASC"]] }));
  });

  it("findAll handles offset beyond total rows", async () => {
    (Intervencion.findAndCountAll as any).mockResolvedValue({ count: 2, rows: [] });

    const pagination = { query: "", size: 10, getOffset: () => 100, getOrder: () => [] };
    const result = await service.findAll(pagination as any);

    expect(result.data).toHaveLength(0);
    expect(result.count).toBe(2);
  });

  it("findAll should pass limit = 0 if pagination size is 0", async () => {
    const mockFn = vi.fn().mockResolvedValue({ count: 0, rows: [] });
    (Intervencion.findAndCountAll as any) = mockFn;

    const pagination = { query: "", size: 0, getOffset: () => 0, getOrder: () => [] };
    await service.findAll(pagination as any);

    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ limit: 0 }));
  });

  it("findAll should propagate DB errors", async () => {
    (Intervencion.findAndCountAll as any).mockRejectedValue(new Error("DB error"));
    const pagination = { query: "", size: 10, getOffset: () => 0, getOrder: () => [] };

    await expect(service.findAll(pagination as any)).rejects.toThrow("DB error");
  });

  // Tests for findInterventionByDogId
  it("findInterventionByDogId should return interventions for a given dogId", async () => {
    (Intervencion.findAndCountAll as any).mockResolvedValue({
      count: 1,
      rows: [{ get: () => ({ id: 1, descripcion: "Atención", UsrPerros: [{ perroId: "5" }], Institucion: { id: 2, nombre: "Inst" } }) }],
    });

    const pagination = { query: "", size: 10, getOffset: () => 0, getOrder: () => [] };
    const result = await service.findInterventionByDogId(pagination as any, "5");

    expect(result.count).toBe(1);
    expect(result.data[0].descripcion).toBe("Atención");
  });

  it("findInterventionByDogId should filter by descripcion when query provided", async () => {
    (Intervencion.findAndCountAll as any).mockImplementation((args: any) => {
      const where = args.where || {};
      if (where?.descripcion?.[Op.iLike] === "%corte%") {
        return { count: 1, rows: [{ get: () => ({ id: 1, descripcion: "Corte", UsrPerros: [{ perroId: "7" }], Institucion: { id: 2, nombre: "Inst" } }) }] };
      }
      return { count: 0, rows: [] };
    });

    const pagination = { query: "corte", size: 10, getOffset: () => 0, getOrder: () => [] };
    const result = await service.findInterventionByDogId(pagination as any, "7");

    expect(result.count).toBe(1);
    expect(result.data[0].descripcion).toBe("Corte");
  });

  it("findInterventionByDogId should propagate DB errors", async () => {
    (Intervencion.findAndCountAll as any).mockRejectedValue(new Error("DB error"));
    const pagination = { query: "", size: 10, getOffset: () => 0, getOrder: () => [] };

    await expect(service.findInterventionByDogId(pagination as any, "1")).rejects.toThrow("DB error");
  });
});
