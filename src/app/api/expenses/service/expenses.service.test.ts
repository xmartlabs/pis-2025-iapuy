import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExpensesService } from "./expenses.service";
import type { CreateExpenseDto } from "../dtos/create-expense.dto";

vi.mock("@/app/models/expense.entity", () => ({
  Expense: {
    create: vi.fn(),
    findOne: vi.fn(),
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
    )) as { Expense: { create: ReturnType<typeof vi.fn> } };
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

    expect(createMock).toHaveBeenCalledWith({
      ...newExpense,
      state: "no pagado",
    });
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
});
