/* eslint-disable */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";
import { ExpensesController } from "./expenses.controller";
import type { ExpensesService } from "../service/expenses.service";
import type { PayloadForUser } from "../../users/service/user.service";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";

// ---- Mocks ----
vi.mock("../service/expenses.service", () => ({
  ExpensesService: vi.fn().mockImplementation(() => ({
    createExpense: vi.fn(),
  })),
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

describe("ExpensesController", () => {
  let controller: ExpensesController | undefined = undefined;
  let expensesService:
    | (ExpensesService & {
        createExpense: ReturnType<typeof vi.fn>;
      })
    | undefined = undefined;

  beforeEach(() => {
    expensesService = {
      createExpense: vi.fn(),
      deleteExpense: vi.fn(),
      findAll: vi.fn(),
      findInitialValuesForFilter: vi.fn(),
      update: vi.fn(),
      getExpenseDetails: vi.fn(),
      updateSanidadForExpense: vi.fn(),
    } as unknown as ExpensesService & {
      createExpense: ReturnType<typeof vi.fn>;
      deleteExpense: ReturnType<typeof vi.fn>;
      findAll: ReturnType<typeof vi.fn>;
      findInitialValuesForFilter: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      getExpenseDetails: ReturnType<typeof vi.fn>;
      updateSanidadForExpense: ReturnType<typeof vi.fn>;
    };
    controller = new ExpensesController(expensesService);
    vi.clearAllMocks();
    controller = new ExpensesController(expensesService);
    vi.clearAllMocks();
  });

  it("createExpense returns expense if created", async () => {
    const expenseData = {
      userId: "12345678",
      interventionId: "87654321",
      type: "Baño",
      concept: "Lavado y Peinado",
      state: "Pendiente de pago",
      amount: 789,
    };
    const req = {
      json: () => expenseData,
    };
    expensesService!.createExpense.mockResolvedValue({
      id: "1",
      ...expenseData,
    });
    const result = await controller!.createExpense(
      req as unknown as NextRequest
    );
    expect(expensesService!.createExpense).toHaveBeenCalledWith(expenseData);
    expect(result).toEqual({ id: "1", ...expenseData });
  });

  it("delete returns result from service when deleting", async () => {
    const payload = { type: "Administrador", ci: "12345678" } as PayloadForUser;
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const mockDeleteExpense = expensesService!.deleteExpense as ReturnType<
      typeof vi.fn
    >;
    mockDeleteExpense.mockResolvedValue(1);

    const result = await controller!.delete("1", payload);

    expect(mockDeleteExpense).toHaveBeenCalledWith("1", payload);
    expect(result).toEqual(1);
  });

  it("delete returns 0 when service returns 0 (not found)", async () => {
    const payload = { type: "Usuario", ci: "12345678" } as PayloadForUser;
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const mockDeleteExpense = expensesService!.deleteExpense as ReturnType<
      typeof vi.fn
    >;
    mockDeleteExpense.mockResolvedValue(0);

    const result = await controller!.delete("nonexistent", payload);

    expect(mockDeleteExpense).toHaveBeenCalledWith("nonexistent", payload);
    expect(result).toEqual(0);
  });

  it("getExpenses delegates to service.findAll with provided filters", async () => {
    const pagination = {
      query: "",
      size: 10,
      getOffset: () => 0,
      getOrder: () => [],
    } as unknown;
    const payload = { type: "Administrador", ci: "1" } as unknown;
    const expected = { count: 1, data: [] };
    (expensesService!.findAll as ReturnType<typeof vi.fn>).mockResolvedValue(
      expected
    );

    const res = await controller!.getExpenses(
      pagination as PaginationDto,
      payload as PayloadForUser,
      "2025-11",
      "Pagado",
      "u1"
    );

    expect(expensesService!.findAll).toHaveBeenCalledWith(
      pagination,
      payload,
      "2025-11",
      "Pagado",
      "u1"
    );
    expect(res).toBe(expected);
  });

  it("getExpensesInitialFilters returns service result", async () => {
    const expected = { people: [], statuses: [], months: [] } as unknown;
    (
      expensesService!.findInitialValuesForFilter as ReturnType<typeof vi.fn>
    ).mockResolvedValue(expected);
    const res = await controller!.getExpensesInitialFilters();
    expect(expensesService!.findInitialValuesForFilter).toHaveBeenCalled();
    expect(res).toBe(expected);
  });

  it("updateExpense delegates to service.update", async () => {
    const updated = { id: "1", amount: 50 } as unknown;
    (expensesService!.update as ReturnType<typeof vi.fn>).mockResolvedValue(
      updated
    );
    const res = await controller!.updateExpense("1", { amount: 50 });
    expect(expensesService!.update).toHaveBeenCalledWith("1", { amount: 50 });
    expect(res).toBe(updated);
  });

  it("getExpenseDetails delegates to service.getExpenseDetails", async () => {
    const detail = { id: "1", event: {} } as unknown;
    (
      expensesService!.getExpenseDetails as ReturnType<typeof vi.fn>
    ).mockResolvedValue(detail);
    const res = await controller!.getExpenseDetails("1");
    expect(expensesService!.getExpenseDetails).toHaveBeenCalledWith("1");
    expect(res).toBe(detail);
  });

  it("updateSanidadForExpense delegates to service.updateSanidadForExpense", async () => {
    const out = { id: "s1" } as unknown;
    (
      expensesService!.updateSanidadForExpense as ReturnType<typeof vi.fn>
    ).mockResolvedValue(out);
    const res = await controller!.updateSanidadForExpense("1", { nota: "x" });
    expect(expensesService!.updateSanidadForExpense).toHaveBeenCalledWith("1", {
      nota: "x",
    });
    expect(res).toBe(out);
  });
});
