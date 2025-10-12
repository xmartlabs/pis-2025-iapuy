import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";
import { ExpensesService } from "../service/expenses.service";
import { ExpensesController } from "./expenses.controller";

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
    } as unknown as ExpensesService & {
      createExpense: ReturnType<typeof vi.fn>;
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
    const result = await controller!.createExpense(req as NextRequest);
    expect(expensesService!.createExpense).toHaveBeenCalledWith(expenseData);
    expect(result).toEqual({ id: "1", ...expenseData });
  });
});
