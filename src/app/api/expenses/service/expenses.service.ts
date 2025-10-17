import { Expense } from "@/app/models/expense.entity";
import { Intervention } from "@/app/models/intervention.entity";
import { User } from "@/app/models/user.entity";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import { Op } from "sequelize";
import type { CreateExpenseDto } from "../dtos/create-expense.dto";
import { type PayloadForUser } from "../../users/service/user.service";
import { type ListExpenseDto } from "../dtos/list-expense.dto";


const monthNames = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
];

const monthMap: Record<string, number> = {
  ene: 0,
  enero: 0,
  feb: 1,
  febrero: 1,
  mar: 2,
  marzo: 2,
  abr: 3,
  abril: 3,
  may: 4,
  mayo: 4,
  jun: 5,
  junio: 5,
  jul: 6,
  julio: 6,
  ago: 7,
  agosto: 7,
  sep: 8,
  sept: 8,
  septiembre: 8,
  oct: 9,
  octubre: 9,
  nov: 10,
  noviembre: 10,
  dic: 11,
  diciembre: 11,
};
export class ExpensesService {
  
  async findAll(
  pagination: PaginationDto,
  payload: PayloadForUser,
  months: string | null,
  statuses: string | null,
  people: string | null
): Promise<PaginationResultDto<ListExpenseDto>> {
  const whereBase: Record<string, unknown> =
    payload.type === "Administrador"
      ? {}
      : { userId: payload.ci };

  if (statuses && statuses.trim()) {
    const statusesArr = statuses.split(",").map((s) => s.trim()).filter(Boolean);
    if (statusesArr.length) {
      const parsedStatuses = statusesArr.map((s) => (s==="Pendiente de Pago") ? "no pagado" : "pagado");
      whereBase.state = { [Op.in]: parsedStatuses };
    }
  }
  if (people && people.trim()) {
    const peopleArr = people.split(",").map((p) => p.trim()).filter(Boolean);
    if (peopleArr.length) {
      whereBase.userId = { [Op.in]: peopleArr };
    }
  }
  
  let timeStampWhere: Record<string, unknown> | undefined = undefined;
      if (months && months.trim()) {
        const monthsArr = months
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean);
  
        const ranges: Array<{ start: Date; end: Date }> = [];
  
        const parseMonthLabel = (
          label: string
        ): { start: Date; end: Date } | null => {
          let normalized = label.replace(/\+/g, " ");
          try {
            normalized = decodeURIComponent(normalized);
          } catch {
            // ignore
          }
          normalized = normalized.replace(".", "").trim();
  
          const isoMatch = normalized.match(/^(\d{4})-(\d{2})$/);
          if (isoMatch) {
            const year = Number(isoMatch[1]);
            const month = Number(isoMatch[2]) - 1;
            if (month >= 0 && month <= 11) {
              const start = new Date(year, month, 1, 0, 0, 0, 0);
              const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
              return { start, end };
            }
          }
  
          const parts = normalized.split(/\s+/);
          if (parts.length >= 2) {
            const yearPart = parts[parts.length - 1];
            const monthPart = parts.slice(0, parts.length - 1).join(" ");
            const year = Number(yearPart);
            if (!Number.isNaN(year) && year > 1900 && year < 3000) {
              const key = monthPart.toLowerCase();
              const monthIdx = monthMap[key] ?? monthMap[key.slice(0, 3)];
              if (typeof monthIdx === "number") {
                const start = new Date(year, monthIdx, 1, 0, 0, 0, 0);
                const end = new Date(year, monthIdx + 1, 0, 23, 59, 59, 999);
                return { start, end };
              }
            }
          }
  
          return null;
        };
  
        for (const m of monthsArr) {
          const r =
            parseMonthLabel(m) ??
            ((): { start: Date; end: Date } | null => {
              const tryParse = (s: string) => {
                const parsed = Date.parse(`1 ${s}`);
                if (!isNaN(parsed)) {
                  const d = new Date(parsed);
                  return {
                    start: new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0),
                    end: new Date(
                      d.getFullYear(),
                      d.getMonth() + 1,
                      0,
                      23,
                      59,
                      59,
                      999
                    ),
                  };
                }
                return null;
              };
              return (
                tryParse(m) ??
                tryParse(
                  decodeURIComponent(m.replace(/\+/g, " ")).replace(".", "")
                )
              );
            })();
          if (r) ranges.push(r);
        }
  
        if (ranges.length === 1) {
          timeStampWhere = { [Op.between]: [ranges[0].start, ranges[0].end] };
        } else if (ranges.length > 1) {
          timeStampWhere = {
            [Op.or]: ranges.map((r) => ({ [Op.between]: [r.start, r.end] })),
          };
        }
      }

    const result = await Expense.findAndCountAll({
      where: {
        ...whereBase,
        ...(timeStampWhere && {
          [Op.or]: [
            { dateSanity: timeStampWhere },
            { "$intervention.timeStamp$": timeStampWhere },
          ],
        }),
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

  async findInitialValuesForFilter() {
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const expenses: Record<string, any>[] = await Expense.findAll({
      attributes: ["id", "userId", "state", "dateSanity"],
      include: [
        { model: User, as: "user", attributes: ["ci", "nombre"] },
        { model: Intervention, as: "intervention", attributes: ["timeStamp"], required: false },
      ],
      raw : true
    });

    const peopleMap = new Map<string, { userId: string; nombre: string }>();
    for (const exp of expenses) {
      const ci = exp["user.ci"] as string ?? exp.userId;
      const nombre = exp["user.nombre"] as string ?? exp.userId;
      if (ci) peopleMap.set(ci, { userId: ci, nombre });
    }
    const people = Array.from(peopleMap.values());

    const statuses = ["Pagado", "Pendiente de Pago"];

    const monthSet = new Map<string, number>();
    for (const exp of expenses) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, dot-notation
      const fecha: string | null = exp["intervention.timeStamp"] ?? exp["dateSanity"];
      if (!fecha) continue;

      const d = new Date(fecha);
      if (isNaN(d.getTime())) continue;

      const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      if (!monthSet.has(label)) monthSet.set(label, monthStart);
    }

    const months = Array.from(monthSet.entries())
      .sort((a, b) => b[1] - a[1])
      .map((e) => e[0]);

    return {
      people,
      statuses,
      months,
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
