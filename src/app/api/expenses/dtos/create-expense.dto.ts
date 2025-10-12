import type { ExpenseType } from "../../../models/expense.entity";

export class CreateExpenseDto {
  declare userId: string;

  declare interventionId: string;

  declare type: ExpenseType;

  declare concept: string;

  declare state: "Pendiente de pago" | "Pagado";

  declare amount: number;
}
