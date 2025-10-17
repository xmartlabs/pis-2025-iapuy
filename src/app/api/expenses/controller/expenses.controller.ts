
import { ExpensesService } from "../service/expenses.service";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import type { NextRequest } from "next/server";
import type { CreateExpenseDto } from "../dtos/create-expense.dto";
import { type  PayloadForUser } from "../../users/service/user.service";
import { type FiltersExpenseDto } from "../dtos/initial-filter.dto";

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
    

  async getExpensesInitialFilters(): Promise<FiltersExpenseDto> {
    const filters = await this.expensesService.findInitialValuesForFilter();
    return filters;
  }


  async createExpense(request: NextRequest) {
    const expenseData: CreateExpenseDto =
      (await request.json()) as CreateExpenseDto;
    return await this.expensesService.createExpense(expenseData);
  }
}
