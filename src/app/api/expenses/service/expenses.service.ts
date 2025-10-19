import { Expense } from "@/app/models/expense.entity";
import { Intervention } from "@/app/models/intervention.entity";
import { User } from "@/app/models/user.entity";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";
import { Op, type Transaction } from "sequelize";
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

  async createExpense(request: CreateExpenseDto, options?: { transaction?: Transaction }): Promise<Expense> {
    const transaction = options?.transaction;
    const [intervention, user] = await Promise.all([
      request.interventionId && request.interventionId.trim() !== "" 
        ? Intervention.findOne({
            where: { id: request.interventionId },
            attributes: ["id"],
            ...(transaction && { transaction }),
          })
        : null,
      User.findOne({
        where: { ci: request.userId },
        attributes: ["ci"],
        ...(transaction && { transaction }),
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
      interventionId: request.interventionId && request.interventionId.trim() !== "" 
        ? request.interventionId 
        : null,
      type: request.type,
      concept: request.concept,
      state: request.state === "Pendiente de pago" ? "no pagado" : "pagado",
      amount: request.amount,
    }, transaction ? { transaction } : {});

    return expense;
  }

  async update(id: string, data: Partial<Expense>): Promise<Expense | null> {
    const expense = await Expense.findByPk(id);
    if (!expense) return null;
    const toUpdate: Partial<Expense> = { ...data };
    if (toUpdate.amount && typeof toUpdate.amount === "string") {
      const parsed = Number(toUpdate.amount as unknown as string);
      if (!Number.isNaN(parsed)) {
        (toUpdate as unknown as Record<string, unknown>).amount = parsed;
      }
    }

    const updated = await expense.update(
      toUpdate as unknown as Partial<Expense>
    );
    return updated;
  }

  getFixedCost(sanidadtype: string): number {
    switch (sanidadtype) {
      case "Baño":
        return 50;
      case "Vacunacion":
        return 80;
      case "Desparasitacion Interna":
        return 30;
      case "Desparasitacion Externa":
        return 40;
      default:
        return 0;
    }
  }
}
