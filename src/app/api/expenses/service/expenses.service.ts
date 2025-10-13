import { Expense } from "@/app/models/expense.entity";
import { Intervention } from "@/app/models/intervention.entity";
import { User } from "@/app/models/user.entity";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";
import { Op } from "sequelize";
import type { CreateExpenseDto } from "../dtos/create-expense.dto";

export class ExpensesService {
  async findAll(
    pagination: PaginationDto
  ): Promise<PaginationResultDto<Expense>> {
    const result = await Expense.findAndCountAll({
      where: pagination.query
        ? { concepto: { [Op.iLike]: `%${pagination.query}%` } }
        : undefined,
      include: [
        {
          model: User,
          as: "User",
        },
        {
          model: Intervention,
        },
      ],
      limit: pagination.size,
      offset: pagination.getOffset(),
      order: pagination.getOrder(),
    });

    return getPaginationResultFromModel(pagination, result);
  }

  async createExpense(request: CreateExpenseDto): Promise<Expense> {
    const [intervention, user] = await Promise.all([
      Intervention.findOne({
        where: { id: request.interventionId },
        attributes: ["id"],
      }),
      User.findOne({
        where: { ci: request.userId },
        attributes: ["ci"],
      }),
    ]);
    if (
      request.type !== "Baño" &&
      request.type !== "Vacunacion" &&
      request.type !== "Desparasitacion Interna" &&
      request.type !== "Desparasitacion Externa" &&
      !intervention
    ) {
      throw new Error(
        `Intervention with id "${request.interventionId}" not found`
      );
    }
    if (!user) {
      throw new Error(`User with id "${request.userId}" not found`);
    }
    const expense = await Expense.create({
      userId: request.userId,
      interventionId: request.interventionId,
      type: request.type,
      concept: request.concept,
      state: request.state === "Pendiente de pago" ? "no pagado" : "pagado",
      amount: request.amount,
    });

    return expense;
  }
}
