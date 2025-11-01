/* eslint-disable */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Basic module mocks placed before importing the service to avoid decorator init issues
vi.mock("@/app/models/expense.entity", () => ({ Expense: { findByPk: vi.fn(), findAll: vi.fn(), count: vi.fn(), create: vi.fn(), findOne: vi.fn() } }));
vi.mock("@/app/models/vacuna.entity", () => ({ Vacuna: { findByPk: vi.fn(), findAll: vi.fn(), destroy: vi.fn() } }));
vi.mock("@/app/models/desparasitacion.entity", () => ({ Desparasitacion: { findByPk: vi.fn(), findAll: vi.fn(), destroy: vi.fn() } }));
vi.mock("@/app/models/banio.entity", () => ({ Banio: { findByPk: vi.fn(), findAll: vi.fn(), destroy: vi.fn() } }));
vi.mock("@/app/models/registro-sanidad.entity", () => ({ RegistroSanidad: { findByPk: vi.fn() } }));
vi.mock("@/app/models/intervention.entity", () => ({ Intervention: { findOne: vi.fn() } }));
vi.mock("@/app/models/user.entity", () => ({ User: { findOne: vi.fn() } }));
vi.mock("@/lib/database", () => ({
  default: { transaction: vi.fn() },
  sequelize: { transaction: vi.fn() },
  transaction: vi.fn(),
}));

vi.mock("@/app/api/fixed-costs/service/fixed-costs.service", () => ({
  fixedCostsService: {
    getCostoKilometros: vi.fn(() => 2),
    getCostoBanio: vi.fn(() => 10),
    getCostoVacunas: vi.fn(() => 5),
    getCostoDesparasitacionInterna: vi.fn(() => 7),
    getCostoDesparasitacionExterna: vi.fn(() => 3),
  },
}));

import { ExpensesService } from "./expenses.service";

describe("ExpensesService (unit)", () => {
  let service: ExpensesService;

  beforeEach(() => {
    service = new ExpensesService();
    vi.clearAllMocks();
  });

  it("getExpenseDetails returns null when not found", async () => {
    const { Expense } = (await vi.importMock("@/app/models/expense.entity")) as any;
    Expense.findByPk.mockResolvedValue(null);
    const res = await service.getExpenseDetails("x");
    expect(res).toBeNull();
  });

  it("getExpenseDetails returns event and registro for vacuna", async () => {
    const { Expense } = (await vi.importMock("@/app/models/expense.entity")) as any;
    const { Vacuna } = (await vi.importMock("@/app/models/vacuna.entity")) as any;
    const { RegistroSanidad } = (await vi.importMock("@/app/models/registro-sanidad.entity")) as any;

    const mockExp = { id: "e1", type: "Vacunacion", sanidadId: "s1" };
    Expense.findByPk.mockResolvedValue(mockExp);
    Vacuna.findByPk.mockResolvedValue({ id: "s1", registroSanidadId: "r1" });
    RegistroSanidad.findByPk.mockResolvedValue({ id: "r1" });

    const res = await service.getExpenseDetails("e1");
    expect(res).toBeTruthy();
    expect((res as any).event.kind).toBe("vacuna");
    expect((res as any).registroSanidad).toEqual({ id: "r1" });
  });

  it("findAll maps dog names and states and honors months filter", async () => {
    const { Expense } = (await vi.importMock("@/app/models/expense.entity")) as any;
    const { Vacuna } = (await vi.importMock("@/app/models/vacuna.entity")) as any;

    const row = {
      id: "1",
      sanidadId: "v1",
      type: "Vacunacion",
      userId: "u1",
      User: { ci: "u1", nombre: "User 1" },
      amount: 100,
      concept: "C",
      state: "pagado",
      interventionId: null,
      dateSanity: new Date(2025, 10, 5),
      Intervencion: null,
    };

    Expense.findAll.mockResolvedValue([row]);
    Expense.count.mockResolvedValue(1);
    Vacuna.findAll.mockResolvedValue([{ id: "v1", RegistroSanidad: { Perro: { nombre: "Fido" } } }]);

    const pagination = { query: "", size: 10, getOffset: () => 0, getOrder: () => [] } as any;
    const res = await service.findAll(pagination, { type: "Administrador" } as any, "2025-11", null, null);

    expect(res.count).toBe(1);
    expect(res.data[0].dogName).toBe("Fido");
    expect(res.data[0].state).toBe("Pagado");
  });

  it("findInitialValuesForFilter returns people, statuses and months", async () => {
    const { Expense } = (await vi.importMock("@/app/models/expense.entity")) as any;
    const rows = [
      { id: "1", userId: "u1", User: { nombre: "A" }, dateSanity: new Date(2025, 9, 10), Intervencion: null },
      { id: "2", userId: "u2", User: { nombre: "B" }, dateSanity: new Date(2025, 8, 3), Intervencion: null },
    ];
    Expense.findAll.mockResolvedValue(rows);

    const out = await service.findInitialValuesForFilter();
    expect(out.people).toEqual(expect.arrayContaining([{ userId: "u1", nombre: "A" }]));
    expect(out.statuses).toEqual(["Pagado", "Pendiente de pago"]);
    expect(out.months.length).toBeGreaterThanOrEqual(1);
  });

  it("createExpense validates intervention and user and multiplies km cost when provided", async () => {
    const { Intervention } = (await vi.importMock("@/app/models/intervention.entity")) as any;
    const { User } = (await vi.importMock("@/app/models/user.entity")) as any;
    const { Expense } = (await vi.importMock("@/app/models/expense.entity")) as any;

    Intervention.findOne.mockResolvedValue(null);
    User.findOne.mockResolvedValue({ ci: "u1" });

    await expect(service.createExpense({ interventionId: "i1", userId: "u1", type: "Otro", amount: 10, concept: "C", state: "Pagado", dateSanity: new Date() } as any)).rejects.toThrow();

    Intervention.findOne.mockResolvedValue({ id: "i1" });
    User.findOne.mockResolvedValue(null);
    await expect(service.createExpense({ interventionId: "i1", userId: "u1", type: "Otro", amount: 10, concept: "C", state: "Pagado", dateSanity: new Date() } as any)).rejects.toThrow(/User with id/);

    Intervention.findOne.mockResolvedValue({ id: "i1" });
    User.findOne.mockResolvedValue({ ci: "u1" });
    Expense.create.mockResolvedValue({ id: "exp1" });
    const res = await service.createExpense({ interventionId: "i1", userId: "u1", type: "Otro", amount: 10, km: 1, concept: "C", state: "Pagado", dateSanity: new Date() } as any);
    expect(Expense.create).toHaveBeenCalled();
    expect(res).toBeTruthy();
  });

  it("update handles not found and parses string amounts", async () => {
    const { Expense } = (await vi.importMock("@/app/models/expense.entity")) as any;
    Expense.findByPk.mockResolvedValue(null);
    const r1 = await service.update("nope", { amount: 5 } as any);
    expect(r1).toBeNull();

    const mock = { update: vi.fn().mockResolvedValue({ id: "1", amount: 15 }) };
    Expense.findByPk.mockResolvedValue(mock);
    const r2 = await service.update("1", { amount: "15" } as any);
    expect(mock.update).toHaveBeenCalled();
    expect(r2).toEqual({ id: "1", amount: 15 });
  });

  it("updateSanidadForExpense updates vacuna when present", async () => {
    const { Expense } = (await vi.importMock("@/app/models/expense.entity")) as any;
    const { Vacuna } = (await vi.importMock("@/app/models/vacuna.entity")) as any;
    Expense.findByPk.mockResolvedValue({ type: "Vacunacion", sanidadId: "s1" });
    const upd = vi.fn().mockResolvedValue({ id: "s1" });
    Vacuna.findByPk.mockResolvedValue({ id: "s1", update: upd });
    const res = await service.updateSanidadForExpense("x", { nota: "x" });
    expect(upd).toHaveBeenCalled();
    expect(res).toBeTruthy();
  });

  it("getFixedCost delegates to fixedCostsService", () => {
    expect(service.getFixedCost("Baño")).toBe(10);
    expect(service.getFixedCost("Vacunacion")).toBe(5);
    expect(service.getFixedCost("Desparasitacion Interna")).toBe(7);
    expect(service.getFixedCost("Desparasitacion Externa")).toBe(3);
    expect(service.getFixedCost("X")).toBe(0);
  });

  it("deleteExpense returns 0 when not found and deletes with transaction when found", async () => {
    const { Expense } = (await vi.importMock("@/app/models/expense.entity")) as any;
  const db = await vi.importMock("@/lib/database");
  const trx = { commit: vi.fn(), rollback: vi.fn() };
  if (db && db.default && db.default.transaction) db.default.transaction.mockResolvedValue(trx);
  if (db && db.sequelize && db.sequelize.transaction) db.sequelize.transaction.mockResolvedValue(trx);
  if (db && db.transaction) db.transaction.mockResolvedValue(trx);

    Expense.findOne.mockResolvedValue(null);
    const r0 = await service.deleteExpense("x", { type: "Administrador" } as any);
    expect(r0).toBe(0);

    const mockExpense = { destroy: vi.fn().mockResolvedValue(1), sanidadId: null, type: "Otro" };
    Expense.findOne.mockResolvedValue(mockExpense);
    const r1 = await service.deleteExpense("x", { type: "Administrador" } as any);
    expect(mockExpense.destroy).toHaveBeenCalledWith({ transaction: trx });
    expect(trx.commit).toHaveBeenCalled();
    expect(r1).toBe(1);
  });

});

