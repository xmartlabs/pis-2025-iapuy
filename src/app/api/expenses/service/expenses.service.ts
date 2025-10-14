import { Expense } from "@/app/models/expense.entity";
import { Intervention } from "@/app/models/intervention.entity";
import { User } from "@/app/models/user.entity";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import { Op } from "sequelize";
import type { CreateExpenseDto } from "../dtos/create-expense.dto";
import { type PayloadForUser } from "../../users/service/user.service";
import { type ListExpenseDto } from "../dtos/list-expense.dto";
export class ExpensesService {
  
  async findAll(
  pagination: PaginationDto,
  payload: PayloadForUser,
  months: string | null,
  statuses: string | null,
  people: string | null
): Promise<PaginationResultDto<ListExpenseDto>> {
  const whereBase: Record<string, unknown> =
    payload.type === "Administrador" || payload.type === "Colaborador"
      ? {}
      : { userId: payload.ci };


  if (statuses && statuses.trim()) {
    const statusesArr = statuses.split(",").map((s) => s.trim()).filter(Boolean);
    if (statusesArr.length) {
      whereBase.state = { [Op.in]: statusesArr };
    }
  }
  if (people && people.trim()) {
    const peopleArr = people.split(",").map((p) => p.trim()).filter(Boolean);
    if (peopleArr.length) {
      whereBase.userId = { [Op.in]: peopleArr };
    }
  }

  let fechaWhere: Record<string, unknown> | undefined = undefined;
  if (months && months.trim()) {
    const [year, month] = months.split("-").map(Number); // ej: "2025-10"
    if (year && month) {
      const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
      const end = new Date(year, month, 0, 23, 59, 59, 999);
      fechaWhere = { [Op.between]: [start, end] };
    }
  }
  console.log(fechaWhere)
  const result = await Expense.findAndCountAll({
    where: {
      ...whereBase,
      ...(fechaWhere ? { dateSanity: fechaWhere } : {}),
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["ci", "nombre"],
      },
      {
        model: Intervention,
        as: "intervention",
        attributes: ["id", "timeStamp"],
        required: false,
        ...(fechaWhere ? { where: { timeStamp: fechaWhere } } : {}),
      },
    ],
    limit: pagination.size,
    offset: pagination.getOffset(),
    order: pagination.getOrder(),
  });

  const data: ListExpenseDto[] = await Promise.all(
  result.rows.map(async (exp) => {
    let fecha: Date | null = null;
    if (exp.interventionId) {
      const intervention = await Intervention.findByPk(exp.interventionId, {
        attributes: ["timeStamp"],
      });
      fecha = intervention?.timeStamp ?? null;
    } else {
      fecha = exp.dateSanity;
    }

    let userExpense: { ci: string; nombre: string } | undefined = undefined;
    if (exp.userId) {
      const user = await User.findByPk(exp.userId, {
        attributes: ["ci", "nombre"],
      });
      if (user) {
        userExpense = { ci: user.ci, nombre: user.nombre };
      }
    }

    return {
      id: exp.id,
      userId: exp.userId,
      concept: exp.concept,
      type: exp.type,
      state: exp.state === "pagado" ? "Pagado" : "Pendiente de Pago",
      amount: exp.amount,
      fecha,
      user: userExpense,
    };
  })
);
  
  return {
    data,
    count: result.count,
    totalPages: Math.ceil(result.count / pagination.size),
    totalItems: result.count,
    page: pagination.page,
    size: pagination.size,
  };
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
    if (!intervention) {
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
