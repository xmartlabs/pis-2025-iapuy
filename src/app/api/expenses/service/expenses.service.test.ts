import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExpensesService } from "./expenses.service";
import type { CreateExpenseDto } from "../dtos/create-expense.dto";

vi.mock("@/app/models/expense.entity", () => ({
  Expense: {
    create: vi.fn(),
    findOne: vi.fn(),
    findByPk: vi.fn(),
  },
}));

vi.mock("@/app/models/intervention.entity", () => ({
  Intervention: {
    findOne: vi.fn().mockResolvedValue({
      id: "87654321",
    }),
  },
}));

vi.mock("@/app/models/user.entity", () => ({
  User: {
    findOne: vi.fn().mockResolvedValue({
      id: "12345678",
    }),
  },
}));

vi.mock("@/app/models/registro-sanidad.entity", () => ({
  RegistroSanidad: { findByPk: vi.fn(), findAll: vi.fn() },
}));
vi.mock("@/app/models/vacuna.entity", () => ({
  Vacuna: { findByPk: vi.fn(), findOne: vi.fn(), findAll: vi.fn() },
}));
vi.mock("@/app/models/banio.entity", () => ({
  Banio: { findByPk: vi.fn(), findOne: vi.fn(), findAll: vi.fn() },
}));
vi.mock("@/app/models/desparasitacion.entity", () => ({
  Desparasitacion: { findByPk: vi.fn(), findOne: vi.fn(), findAll: vi.fn() },
}));
vi.mock("@/app/models/perro.entity", () => ({
  Perro: { findAll: vi.fn() },
}));

describe("ExpensesService", () => {
  // eslint-disable-next-line init-declarations
  let service: ExpensesService;

  beforeEach(() => {
    service = new ExpensesService();
    vi.clearAllMocks();
  });

  it("correct expense info should create an expense", async () => {
    const { Expense } = (await vi.importMock(
      "@/app/models/expense.entity"
    )) as {
      Expense: { create: ReturnType<typeof vi.fn> };
    };

    const createMock = Expense.create;
    const newExpense: CreateExpenseDto = {
      userId: "12345678",
      interventionId: "87654321",
      type: "Baño",
      concept: "Lavado y Peinado",
      state: "Pendiente de pago",
      amount: 789,
    };

    createMock.mockImplementation((expense: CreateExpenseDto) => expense);

    const result = await service.createExpense(newExpense);

    expect(createMock).toHaveBeenCalled();
    expect(result).toEqual({
      ...newExpense,
      state: "no pagado",
    });
  });

  it("should throw an error if user does not exist", async () => {
    const { User } = (await vi.importMock("@/app/models/user.entity")) as {
      User: { findOne: ReturnType<typeof vi.fn> };
    };
    User.findOne.mockResolvedValue(null);

    const newExpense: CreateExpenseDto = {
      userId: "nonexistent-id",
      interventionId: "87654321",
      type: "Baño",
      concept: "Lavado y Peinado",
      state: "Pendiente de pago",
      amount: 789,
    };

    await expect(service.createExpense(newExpense)).rejects.toThrow(
      'User with id "nonexistent-id" not found'
    );
  });

  it("should throw an error if intervention does not exist", async () => {
    const { User } = (await vi.importMock("@/app/models/user.entity")) as {
      User: { findOne: ReturnType<typeof vi.fn> };
    };
    const { Intervention } = (await vi.importMock(
      "@/app/models/intervention.entity"
    )) as {
      Intervention: { findOne: ReturnType<typeof vi.fn> };
    };

    User.findOne.mockResolvedValue({ id: "12345678" });
    Intervention.findOne.mockResolvedValue(null);

    const newExpense: CreateExpenseDto = {
      userId: "12345678",
      interventionId: "nonexistent-id",
      type: "Traslado",
      concept: "Traslado hasta el lugar",
      state: "Pendiente de pago",
      amount: 789,
    };

    await expect(service.createExpense(newExpense)).rejects.toThrow(
      'Intervention with id "nonexistent-id" not found'
    );
  });

  // Tests análogos a gasto.service.test.ts

  describe("update (analogous to GastoService.update)", () => {
    // eslint-disable-next-line init-declarations
    let ExpenseMock: {
      findByPk: ReturnType<typeof vi.fn>;
    };

    beforeEach(async () => {
      const mod = await import("@/app/models/expense.entity");
      ExpenseMock = mod.Expense as unknown as {
        findByPk: ReturnType<typeof vi.fn>;
      };
    });

    it("returns null when expense not found", async () => {
      const spy = vi.spyOn(ExpenseMock, "findByPk").mockResolvedValue(null);

      const res = await service.update("1", {
        amount: 100,
      } as Partial<Record<string, unknown>>);

      expect(spy).toHaveBeenCalledWith("1");
      expect(res).toBeNull();
    });

    it("parses string amount to number and updates", async () => {
      const mockUpdate = vi.fn().mockResolvedValue({ id: "1", amount: 123 });
      const mockExpense = { update: mockUpdate };

      const spy = vi
        .spyOn(ExpenseMock, "findByPk")
        .mockResolvedValue(mockExpense as unknown as Promise<unknown>);

      const res = await service.update("1", {
        amount: "123",
      } as Partial<Record<string, unknown>>);

      expect(spy).toHaveBeenCalledWith("1");
      expect(mockUpdate).toHaveBeenCalledWith({ amount: 123 });
      expect(res).toEqual({ id: "1", amount: 123 });
    });

    it("keeps invalid string amount and updates with original value", async () => {
      const mockUpdate = vi.fn().mockResolvedValue({ id: "1", amount: "abc" });
      const mockExpense = { update: mockUpdate };

      const spy = vi
        .spyOn(ExpenseMock, "findByPk")
        .mockResolvedValue(mockExpense as unknown as Promise<unknown>);

      const res = await service.update("1", {
        amount: "abc",
      } as Partial<Record<string, unknown>>);

      expect(spy).toHaveBeenCalledWith("1");
      expect(mockUpdate).toHaveBeenCalledWith({ amount: "abc" });
      expect(res).toEqual({ id: "1", amount: "abc" });
    });

    it("updates when amount is numeric", async () => {
      const mockUpdate = vi.fn().mockResolvedValue({ id: "1", amount: 50 });
      const mockExpense = { update: mockUpdate };

      const spy = vi
        .spyOn(ExpenseMock, "findByPk")
        .mockResolvedValue(mockExpense as unknown as Promise<unknown>);

      const res = await service.update("1", {
        amount: 50,
      } as Partial<Record<string, unknown>>);

      expect(spy).toHaveBeenCalledWith("1");
      expect(mockUpdate).toHaveBeenCalledWith({ amount: 50 });
      expect(res).toEqual({ id: "1", amount: 50 });
    });

    // ------------------ getExpenseDetails ------------------
    it("getExpenseDetails returns vacuna event when sanidadId points to a vacuna", async () => {
      const { Expense } = (await vi.importMock(
        "@/app/models/expense.entity"
      )) as { Expense: { findByPk: ReturnType<typeof vi.fn> } };
      const { Vacuna } = (await vi.importMock(
        "@/app/models/vacuna.entity"
      )) as { Vacuna: { findByPk: ReturnType<typeof vi.fn> } };
      const { RegistroSanidad } = (await vi.importMock(
        "@/app/models/registro-sanidad.entity"
      )) as { RegistroSanidad: { findByPk: ReturnType<typeof vi.fn> } };

      const vacuna = { id: "v1", registroSanidadId: "r1" };
      const registro = { id: "r1" };

      Expense.findByPk = vi.fn().mockResolvedValue({
        id: "e1",
        type: "Vacunacion",
        sanidadId: "v1",
      });
      Vacuna.findByPk = vi.fn().mockResolvedValue(vacuna);
      RegistroSanidad.findByPk = vi.fn().mockResolvedValue(registro);

      const result = await service.getExpenseDetails("e1");
      expect(result).not.toBeNull();
      // @ts-expect-error test shape
      expect(result.event.kind).toBe("vacuna");
      // @ts-expect-error test shape
      expect(result.event.data).toEqual(vacuna);
      // @ts-expect-error test shape
      expect(result.registroSanidad).toEqual(registro);
    });

    it("getExpenseDetails fallback finds event by date when sanidadId missing", async () => {
      const { Expense } = (await vi.importMock(
        "@/app/models/expense.entity"
      )) as { Expense: { findByPk: ReturnType<typeof vi.fn> } };
      const { RegistroSanidad } = (await vi.importMock(
        "@/app/models/registro-sanidad.entity"
      )) as { RegistroSanidad: { findAll: ReturnType<typeof vi.fn> } };
      const { Vacuna } = (await vi.importMock(
        "@/app/models/vacuna.entity"
      )) as { Vacuna: { findOne: ReturnType<typeof vi.fn> } };

      // Expense with dateSanity and userId and no sanidadId
      const fecha = new Date("2025-09-20T12:00:00Z");
      Expense.findByPk = vi.fn().mockResolvedValue({
        id: "e2",
        type: "Vacunacion",
        sanidadId: null,
        dateSanity: fecha,
        userId: "u1",
      });

      // registro list with one registro id 'r2'
      RegistroSanidad.findAll = vi.fn().mockResolvedValue([{ id: "r2" }]);

      // Vacuna.findOne should be called and return a vacuna for that registro
      const vacuna = { id: "v2", registroSanidadId: "r2" };
      Vacuna.findOne = vi.fn().mockResolvedValue(vacuna);

      const result = await service.getExpenseDetails("e2");
      expect(result).not.toBeNull();
      // ensure the fallback attempted to find a vacuna for the registro
      expect(Vacuna.findOne).toHaveBeenCalled();
    });

    // ------------------ findInitialValuesForFilter ------------------
    it("findInitialValuesForFilter builds months and people from expenses", async () => {
      const { Expense } = (await vi.importMock(
        "@/app/models/expense.entity"
      )) as { Expense: { findAll: ReturnType<typeof vi.fn> } };

      const d1 = new Date(2025, 8, 5); // Sep 2025
      const d2 = new Date(2025, 7, 10); // Aug 2025

      Expense.findAll = vi.fn().mockResolvedValue([
        {
          id: "1",
          userId: "u1",
          state: "no pagado",
          dateSanity: d1,
          User: { ci: "u1", nombre: "User One" },
          Intervencion: undefined,
        },
        {
          id: "2",
          userId: "u2",
          state: "pagado",
          dateSanity: d2,
          User: { ci: "u2", nombre: "User Two" },
          Intervencion: undefined,
        },
      ]);

      const res = await service.findInitialValuesForFilter();
      expect(res.statuses).toEqual(["Pagado", "Pendiente de pago"]);
      expect(res.people.length).toBeGreaterThanOrEqual(2);
      expect(res.months.some((m) => m.includes("2025"))).toBe(true);
    });

    // ------------------ updateSanidadForExpense ------------------
    it("updateSanidadForExpense updates vacuna when sanidadId points to vacuna", async () => {
      const { Expense } = (await vi.importMock(
        "@/app/models/expense.entity"
      )) as { Expense: { findByPk: ReturnType<typeof vi.fn> } };
      const { Vacuna } = (await vi.importMock(
        "@/app/models/vacuna.entity"
      )) as { Vacuna: { findByPk: ReturnType<typeof vi.fn> } };

      const updateSpy = vi.fn().mockResolvedValue(true);
      Vacuna.findByPk = vi
        .fn()
        .mockResolvedValue({ id: "v3", update: updateSpy });
      Expense.findByPk = vi
        .fn()
        .mockResolvedValue({ id: "exp1", type: "Vacunacion", sanidadId: "v3" });

      const res = await service.updateSanidadForExpense("exp1", {
        vac: "Nueva",
      });
      expect(res).not.toBeNull();
      expect(updateSpy).toHaveBeenCalled();
    });
  });
});
