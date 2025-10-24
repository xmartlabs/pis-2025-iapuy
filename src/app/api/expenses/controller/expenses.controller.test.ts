import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";
import { ExpensesController } from "./expenses.controller";
import type { ExpensesService } from "../service/expenses.service";
import type { PayloadForUser } from "../../users/service/user.service";

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
    | (ExpensesService & { createExpense: ReturnType<typeof vi.fn> })
    | undefined = undefined;

  beforeEach(() => {
    expensesService = {
      createExpense: vi.fn(),
      deleteExpense: vi.fn(),
    } as unknown as ExpensesService & {
      createExpense: ReturnType<typeof vi.fn>;
      deleteExpense: ReturnType<typeof vi.fn>;
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
    const mockDeleteExpense = expensesService!.deleteExpense as ReturnType<typeof vi.fn>;
    mockDeleteExpense.mockResolvedValue(1);

    const result = await controller!.delete("1", payload);

    expect(mockDeleteExpense).toHaveBeenCalledWith("1", payload);
    expect(result).toEqual(1);
  });

  it("delete returns 0 when service returns 0 (not found)", async () => {
    const payload = { type: "Usuario", ci: "12345678" } as PayloadForUser;
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const mockDeleteExpense = expensesService!.deleteExpense as ReturnType<typeof vi.fn>;
    mockDeleteExpense.mockResolvedValue(0);

    const result = await controller!.delete("nonexistent", payload);

    expect(mockDeleteExpense).toHaveBeenCalledWith(
      "nonexistent",
      payload
    );
    expect(result).toEqual(0);
  });
});
