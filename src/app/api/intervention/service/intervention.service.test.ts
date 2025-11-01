/* eslint-disable */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { InterventionService } from "./intervention.service";
import { Intervention } from "@/app/models/intervention.entity";
import { Op } from "sequelize";

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

  it("findAll should parse months ISO label and include timeStamp between", async () => {
    const mockFindAll = vi.fn().mockResolvedValue([]);
    const mockCount = vi.fn().mockResolvedValue(0);
    (Intervention.findAll as any) = mockFindAll;
    (Intervention.count as any) = mockCount;

    const pagination = { query: "", size: 10, getOffset: () => 0, getOrder: () => [] };
    await service.findAll(pagination as any, mockPayload, "2025-11", null);

    const calledWith = mockFindAll.mock.calls[0][0];
    expect(calledWith.where).toHaveProperty("timeStamp");
    // timeStamp should use Op.between
    expect(calledWith.where.timeStamp[Op.between]).toBeInstanceOf(Array);
    expect(calledWith.where.timeStamp[Op.between][0]).toBeInstanceOf(Date);
  });

  it("findAllSimple returns mapped interventions for admin", async () => {
    const sample = [{ id: "i1", tipo: "T", timeStamp: new Date(), Institucions: [{ id: "inst1", nombre: "X" }] }];
    (Intervention.findAll as any).mockResolvedValue(sample);

    const res = await service.findAllSimple({ type: "Administrador" } as any, null);
    expect(res).toHaveLength(1);
    expect(res[0]).toHaveProperty("intervensionId", "i1");
  });

  it("findAllSimple merges viaUsers and viaUsrPerro for collaborator", async () => {
    const viaUsers = [{ id: "a1", tipo: "T", timeStamp: new Date(), Institucions: [{ id: "inst1", nombre: "X" }] }];
    const viaUsrPerro = [{ id: "a2", tipo: "T", timeStamp: new Date(), Institucions: [{ id: "inst2", nombre: "Y" }] }];
    const mockFindAll = vi.fn()
      .mockResolvedValueOnce(viaUsers)
      .mockResolvedValueOnce(viaUsrPerro);
    (Intervention.findAll as any) = mockFindAll;

    const res = await service.findAllSimple({ type: "Colaborador", ci: "123" } as any, null);
    expect(res.length).toBe(2);
    expect(res.map((r: { intervensionId: any; }) => r.intervensionId)).toEqual(expect.arrayContaining(["a1","a2"]));
  });

  describe("findUsersInvolvedInIntervention", () => {
    it("throws when intervention not found", async () => {
      // stub internal findIntervention to return null
      vi.spyOn(service as any, "findIntervention").mockResolvedValue(null);
      await expect(service.findUsersInvolvedInIntervention({ type: "Administrador" } as any, "nope")).rejects.toThrow(/not found/);
    });

    it("returns [] when Intervention.findByPk returns null", async () => {
      vi.spyOn(service as any, "findIntervention").mockResolvedValue({ id: "i1" });
      (Intervention.findByPk as any) = vi.fn().mockResolvedValue(null);
      const res = await service.findUsersInvolvedInIntervention({ type: "Administrador" } as any, "i1");
      expect(res).toEqual([]);
    });

    it("throws for collaborator when not involved", async () => {
      vi.spyOn(service as any, "findIntervention").mockResolvedValue({ id: "i1" });
      (Intervention.findByPk as any) = vi.fn().mockResolvedValue({ Users: [], UsrPerroIntervention: [{ User: { ci: "999", nombre: "Other" } }] });
      await expect(service.findUsersInvolvedInIntervention({ type: "Colaborador", ci: "123", name: "Me" } as any, "i1")).rejects.toThrow(/colaborador no participa/);
    });

    it("returns only collaborator data when involved", async () => {
      vi.spyOn(service as any, "findIntervention").mockResolvedValue({ id: "i1" });
      (Intervention.findByPk as any) = vi.fn().mockResolvedValue({ Users: [], UsrPerroIntervention: [{ User: { ci: "123", nombre: "Me" } }] });
      const res = await service.findUsersInvolvedInIntervention({ type: "Colaborador", ci: "123", name: "Me" } as any, "i1");
      expect(res).toEqual([{ userCi: "123", userName: "Me" }]);
    });

    it("returns merged users for admin", async () => {
      vi.spyOn(service as any, "findIntervention").mockResolvedValue({ id: "i1" });
      (Intervention.findByPk as any) = vi.fn().mockResolvedValue({ Users: [{ ci: "1", nombre: "A" }], UsrPerroIntervention: [{ User: { ci: "2", nombre: "B" } }] });
      const res = await service.findUsersInvolvedInIntervention({ type: "Administrador" } as any, "i1");
      expect(res).toEqual(expect.arrayContaining([{ userCi: "1", userName: "A" }, { userCi: "2", userName: "B" }]));
    });
  });
});
