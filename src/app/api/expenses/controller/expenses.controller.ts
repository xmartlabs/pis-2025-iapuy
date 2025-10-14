
import { ExpensesService } from "../service/expenses.service";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import type { NextRequest } from "next/server";
import type { CreateExpenseDto } from "../dtos/create-expense.dto";
import { type  PayloadForUser } from "../../users/service/user.service";

export class ExpensesController {
  constructor(
    private readonly expensesService: ExpensesService = new ExpensesService()
  ) {}

  async getExpenses(
      pagination: PaginationDto,
      payload: PayloadForUser,
      months: string | null,
      statuses: string | null,
      people: string | null
    ) {
      return await this.expensesService.findAll(
        pagination,
        payload,
        months,
        statuses,
        people
      );
    }

  async createExpense(request: NextRequest) {
    const expenseData: CreateExpenseDto =
      (await request.json()) as CreateExpenseDto;
    return await this.expensesService.createExpense(expenseData);
  }
}
