/* eslint-disable init-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { InterventionService } from "./intervention.service";
import { Intervention } from "@/app/models/intervention.entity";

vi.mock("@/lib/database", () => ({
  sequelize: { define: vi.fn(), sync: vi.fn(), authenticate: vi.fn() },
}));

vi.mock("@/app/models/institucion-intervenciones.entity", () => ({ InstitucionIntervencion: class {} }));
vi.mock("@/app/models/acompania.entity", () => ({ Acompania: class {} }));
vi.mock("@/app/models/institucion.entity", () => ({ Institucion: class {} }));
vi.mock("@/app/models/usrperro.entity", () => ({ UsrPerro: class {} }));
vi.mock("@/app/models/registro-sanidad.entity", () => ({ RegistroSanidad: class {} }));
vi.mock("@/app/models/banio.entity", () => ({ Banio: class {} }));
vi.mock("@/app/models/desparasitacion.entity", () => ({ Desparasitacion: class {} }));
vi.mock("@/app/models/expense.entity", () => ({ Expense: class {} }));
vi.mock("@/app/models/patologia.entity", () => ({ Patologia: class {} }));
vi.mock("@/app/models/vacuna.entity", () => ({ Vacuna: class {} }));
vi.mock("@/app/models/institution-contact.entity", () => ({ InstitutionContact: class {} }));
vi.mock("@/app/models/intitucion-patalogia.entity", () => ({ InstitucionPatologias: class {} }));

// Mock de Intervention
vi.mock("@/app/models/intervention.entity", () => ({
  Intervention: { 
    findAll: vi.fn(),
    count: vi.fn(),
  },
}));

// Mock de paginación
vi.mock("@/lib/pagination/transform", () => ({
  getPaginationResultFromModel: (_pagination: any, processed: any) => ({
    data: (processed.rows || []).map((r: any) => (typeof r.get === "function" ? r.get() : r)),
    count: processed.count,
  }),
}));

describe("IntervencionService", () => {
  let service: any;
  const mockPayload = { type: "Administrador" };

  beforeEach(() => {
    service = new InterventionService();
    vi.clearAllMocks();
  });

  it("findAll should return paginated intervenciones", async () => {
    (Intervention.findAll as any).mockResolvedValue([
      { get: () => ({ id: 1, descripcion: "Corte de emergencia", Institucion: { id: 2, nombre: "Inst A" } }) }
    ]);
    (Intervention.count as any).mockResolvedValue(1);

    const pagination = { query: "", size: 10, getOffset: () => 0, getOrder: () => [] };
    const result = await service.findAll(pagination as any, mockPayload);

    expect(result.data[0].descripcion).toBe("Corte de emergencia");
    expect(result.count).toBe(1);
  });

  it("findAll should handle empty results", async () => {
    (Intervention.findAll as any).mockResolvedValue([]);
    (Intervention.count as any).mockResolvedValue(0);

    const pagination = { query: "", size: 10, getOffset: () => 0, getOrder: () => [] };
    const result = await service.findAll(pagination as any, mockPayload);

    expect(result.data).toHaveLength(0);
    expect(result.count).toBe(0);
  });

  it("findAll should filter by institucion nombre when query provided", async () => {
    (Intervention.findAll as any).mockResolvedValue([
      { get: () => ({ id: 1, descripcion: "Corte", Institucion: { id: 2, nombre: "Inst A" } }) }
    ]);
    (Intervention.count as any).mockResolvedValue(1);

    const pagination = { query: "Inst A", size: 10, getOffset: () => 0, getOrder: () => [] };
    const result = await service.findAll(pagination as any, mockPayload);

    expect(result.data[0].descripcion).toBe("Corte");
    expect(result.count).toBe(1);
  });

  it("findAll passes order correctly", async () => {
    const mockFindAll = vi.fn().mockResolvedValue([{ get: () => ({ id: 1, descripcion: "Corte" }) }]);
    const mockCount = vi.fn().mockResolvedValue(1);
    (Intervention.findAll as any) = mockFindAll;
    (Intervention.count as any) = mockCount;

    const pagination = { query: "", size: 10, getOffset: () => 0, getOrder: () => [["descripcion", "ASC"]] };
    await service.findAll(pagination as any, mockPayload);

    expect(mockFindAll).toHaveBeenCalledWith(expect.objectContaining({ order: [["descripcion", "ASC"]] }));
  });

  it("findAll handles offset beyond total rows", async () => {
    (Intervention.findAll as any).mockResolvedValue([]);
    (Intervention.count as any).mockResolvedValue(2);

    const pagination = { query: "", size: 10, getOffset: () => 100, getOrder: () => [] };
    const result = await service.findAll(pagination as any, mockPayload);

    expect(result.data).toHaveLength(0);
    expect(result.count).toBe(2);
  });

  it("findAll should pass limit = 0 if pagination size is 0", async () => {
    const mockFindAll = vi.fn().mockResolvedValue([]);
    const mockCount = vi.fn().mockResolvedValue(0);
    (Intervention.findAll as any) = mockFindAll;
    (Intervention.count as any) = mockCount;

    const pagination = { query: "", size: 0, getOffset: () => 0, getOrder: () => [] };
    await service.findAll(pagination as any, mockPayload);

    expect(mockFindAll).toHaveBeenCalledWith(expect.objectContaining({ limit: 0 }));
  });

  it("findAll should propagate DB errors", async () => {
    (Intervention.findAll as any).mockRejectedValue(new Error("DB error"));
    (Intervention.count as any).mockResolvedValue(0);
    const pagination = { query: "", size: 10, getOffset: () => 0, getOrder: () => [] };

    await expect(service.findAll(pagination as any, mockPayload)).rejects.toThrow("DB error");
  });

  it("findInterventionByDogId should return interventions for a given dogId", async () => {
    (Intervention.findAll as any).mockResolvedValue([
      { get: () => ({ id: 1, descripcion: "Atención", UsrPerros: [{ perroId: "5" }], Institucion: { id: 2, nombre: "Inst" } }) }
    ]);
    (Intervention.count as any).mockResolvedValue(1);

    const pagination = { query: "", size: 10, getOffset: () => 0, getOrder: () => [] };
    const result = await service.findInterventionByDogId(pagination as any, "5", mockPayload);

    expect(result.count).toBe(1);
    expect(result.data[0].descripcion).toBe("Atención");
  });

  it("findInterventionByDogId should filter by descripcion when query provided", async () => {
    (Intervention.findAll as any).mockResolvedValue([
      { get: () => ({ id: 1, descripcion: "Corte", UsrPerros: [{ perroId: "7" }], Institucion: { id: 2, nombre: "Inst" } }) }
    ]);
    (Intervention.count as any).mockResolvedValue(1);

    const pagination = { query: "corte", size: 10, getOffset: () => 0, getOrder: () => [] };
    const result = await service.findInterventionByDogId(pagination as any, "7", mockPayload);

    expect(result.count).toBe(1);
    expect(result.data[0].descripcion).toBe("Corte");
  });

  it("findInterventionByDogId should propagate DB errors", async () => {
    (Intervention.findAll as any).mockRejectedValue(new Error("DB error"));
    (Intervention.count as any).mockResolvedValue(0);
    const pagination = { query: "", size: 10, getOffset: () => 0, getOrder: () => [] };

    await expect(service.findInterventionByDogId(pagination as any, "1", mockPayload)).rejects.toThrow("DB error");
  });
});
