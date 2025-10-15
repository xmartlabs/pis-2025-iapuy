import { NextResponse } from "next/server";
import { ExpensesService } from "../service/expenses.service";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import type { NextRequest } from "next/server";
import type { CreateExpenseDto } from "../dtos/create-expense.dto";
import type { Expense } from "@/app/models/expense.entity";

export class ExpensesController {
  constructor(
    private readonly expensesService: ExpensesService = new ExpensesService()
  ) {}
  async getExpenses(pagination: PaginationDto) {
    try {
      const users = await this.expensesService.findAll(pagination);
      return NextResponse.json(users);
    } catch {
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }

  async createExpense(request: NextRequest) {
    const expenseData: CreateExpenseDto =
      (await request.json()) as CreateExpenseDto;
    return await this.expensesService.createExpense(expenseData);
  }

  async updateExpense(id: string, data: Partial<Expense>) {
    return await this.expensesService.update(id, data);
  }
}
