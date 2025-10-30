import { Expense } from "@/app/models/expense.entity";
import { Intervention } from "@/app/models/intervention.entity";
import { User } from "@/app/models/user.entity";
import { RegistroSanidad } from "@/app/models/registro-sanidad.entity";
import { Perro } from "@/app/models/perro.entity";
import { Vacuna } from "@/app/models/vacuna.entity";
import { Desparasitacion } from "@/app/models/desparasitacion.entity";
import { Banio } from "@/app/models/banio.entity";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import { Op, Sequelize, type Transaction } from "sequelize";
import type { CreateExpenseDto } from "../dtos/create-expense.dto";
import { type PayloadForUser } from "../../users/service/user.service";
import { type ListExpenseDto } from "../dtos/list-expense.dto";
import { fixedCostsService } from "../../fixed-costs/service/fixed-costs.service";
import sequelize from "@/lib/database";

const monthNames = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
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
  async getExpenseDetails(id: string) {
    const payload: Record<string, unknown> = {};

    const exp = await Expense.findByPk(id, {
      include: [
        { model: User, as: "User", attributes: ["ci", "nombre"] },
        {
          model: Intervention,
          as: "Intervencion",
          attributes: ["id", "timeStamp"],
          required: false,
        },
      ],
    });

    if (!exp) return null;

    payload.expense = exp;

    const type = exp.type as string | undefined;
    const sanidadId = exp.sanidadId as string | undefined;

    const isSanidadType =
      type === "Baño" ||
      type === "Vacunacion" ||
      type === "Desparasitacion Interna" ||
      type === "Desparasitacion Externa";

    if (isSanidadType && sanidadId) {
      let entity: Vacuna | Banio | Desparasitacion | null = null;
      let kind: "vacuna" | "banio" | "desparasitacion" | undefined = undefined;

      switch (type) {
        case "Vacunacion":
          entity = await Vacuna.findByPk(sanidadId).catch(() => null);
          kind = "vacuna";
          break;
        case "Baño":
          entity = await Banio.findByPk(sanidadId).catch(() => null);
          kind = "banio";
          break;
        case "Desparasitacion Interna":
        case "Desparasitacion Externa":
          entity = await Desparasitacion.findByPk(sanidadId).catch(() => null);
          kind = "desparasitacion";
          break;
      }

      if (entity) {
        let registroId: string | undefined = undefined;
        if (
          entity &&
          typeof entity === "object" &&
          "registroSanidadId" in entity
        ) {
          registroId = (entity as { registroSanidadId?: string })
            .registroSanidadId;
        }
        const registro = registroId
          ? await RegistroSanidad.findByPk(registroId).catch(() => null)
          : null;
        payload.registroSanidad = registro;
        payload.event = { kind, data: entity };
        return payload;
      }
    }

    return payload;
  }

  async findAll(
    pagination: PaginationDto,
    payload: PayloadForUser,
    months: string | null,
    statuses: string | null,
    people: string | null
  ): Promise<PaginationResultDto<ListExpenseDto>> {
    const whereBase: Record<string, unknown> =
      payload.type === "Administrador" ? {} : { userId: payload.ci };

    if (statuses && statuses.trim()) {
      const statusesArr = statuses
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (statusesArr.length) {
        const parsedStatuses = statusesArr.map((s) =>
          s === "Pendiente de pago" ? "no pagado" : "pagado"
        );
        whereBase.state = { [Op.in]: parsedStatuses };
      }
    }
    if (people && people.trim()) {
      const peopleArr = people
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
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
          const yearPart = parts[-1];
          const monthPart = parts.slice(0, -1).join(" ");
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
              if (!Number.isNaN(parsed)) {
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

    if (pagination.query && pagination.query.trim()) {
      const q = `%${pagination.query.trim()}%`;
      // @ts-expect-error this is because wherebase is not typed as WhereOptions
      whereBase[Op.and] = [
        Sequelize.where(Sequelize.cast(Sequelize.col("Expense.type"), "TEXT"), {
          [Op.iLike]: q,
        }),
      ];
    }

    const [rows, count] = await Promise.all([
      Expense.findAll({
        where: {
          ...whereBase,
          ...(timeStampWhere && {
            [Op.or]: [
              { dateSanity: timeStampWhere },
              { "$Intervencion.timeStamp$": timeStampWhere },
            ],
          }),
        },
        include: [
          { model: User, as: "User", attributes: ["ci", "nombre"] },
          {
            model: Intervention,
            as: "Intervencion",
            attributes: ["id", "timeStamp"],
            required: false,
          },
        ],
        limit: pagination.size,
        offset: pagination.getOffset(),
        order: pagination.getOrder(),
      }),
      Expense.count({
        where: {
          ...whereBase,
          ...(timeStampWhere && {
            [Op.or]: [
              { dateSanity: timeStampWhere },
              { "$Intervencion.timeStamp$": timeStampWhere },
            ],
          }),
        },
      }),
    ]);

    const sanidadIds = {
      vacunas: [] as string[],
      desparasitaciones: [] as string[],
      banios: [] as string[],
    };

    for (const exp of rows) {
      if (exp.sanidadId) {
        if (exp.type === "Vacunacion") {
          sanidadIds.vacunas.push(exp.sanidadId);
        } else if (
          exp.type === "Desparasitacion Interna" ||
          exp.type === "Desparasitacion Externa"
        ) {
          sanidadIds.desparasitaciones.push(exp.sanidadId);
        } else if (exp.type === "Baño") {
          sanidadIds.banios.push(exp.sanidadId);
        }
      }
    }

    const [vacunasWithDogs, desparasitacionesWithDogs, baniosWithDogs] =
      await Promise.all([
        sanidadIds.vacunas.length > 0
          ? Vacuna.findAll({
              where: { id: { [Op.in]: sanidadIds.vacunas } },
              include: {
                model: RegistroSanidad,
                as: "RegistroSanidad",
                include: [
                  {
                    model: Perro,
                    as: "Perro",
                    attributes: ["nombre"],
                  },
                ],
              },
            })
          : [],
        sanidadIds.desparasitaciones.length > 0
          ? Desparasitacion.findAll({
              where: { id: { [Op.in]: sanidadIds.desparasitaciones } },
              include: {
                model: RegistroSanidad,
                as: "RegistroSanidad",
                include: [
                  {
                    model: Perro,
                    as: "Perro",
                    attributes: ["nombre"],
                  },
                ],
              },
            })
          : [],
        sanidadIds.banios.length > 0
          ? Banio.findAll({
              where: { id: { [Op.in]: sanidadIds.banios } },
              include: {
                model: RegistroSanidad,
                as: "RegistroSanidad",
                include: [
                  {
                    model: Perro,
                    as: "Perro",
                    attributes: ["nombre"],
                  },
                ],
              },
            })
          : [],
      ]);

    const dogNameMaps = {
      vacunas: new Map<string, string>(),
      desparasitaciones: new Map<string, string>(),
      banios: new Map<string, string>(),
    };

    type ModelWithDogName = {
      id: string;
      RegistroSanidad?: {
        Perro?: {
          nombre: string;
        };
      };
    };

    for (const vacuna of vacunasWithDogs) {
      const typedVacuna = vacuna as unknown as ModelWithDogName;
      const dogName = typedVacuna?.RegistroSanidad?.Perro?.nombre;
      if (dogName) {
        dogNameMaps.vacunas.set(typedVacuna.id, dogName);
      }
    }

    for (const desparasitacion of desparasitacionesWithDogs) {
      const typedDesparasitacion =
        desparasitacion as unknown as ModelWithDogName;
      const dogName = typedDesparasitacion?.RegistroSanidad?.Perro?.nombre;
      if (dogName) {
        dogNameMaps.desparasitaciones.set(typedDesparasitacion.id, dogName);
      }
    }

    for (const banio of baniosWithDogs) {
      const typedBanio = banio as unknown as ModelWithDogName;
      const dogName = typedBanio?.RegistroSanidad?.Perro?.nombre;
      if (dogName) {
        dogNameMaps.banios.set(typedBanio.id, dogName);
      }
    }

    const data: ListExpenseDto[] = rows.map((exp) => {
      let fecha: Date | null = null;
      if (exp.interventionId) {
        const intervention = exp.Intervencion;
        fecha = intervention?.timeStamp ?? null;
      } else {
        fecha = exp.dateSanity;
      }

      let userExpense: { ci: string; nombre: string } | undefined = undefined;
      if (exp.userId) {
        const user = exp.User;
        if (user) {
          userExpense = { ci: user.ci, nombre: user.nombre };
        }
      }

      let dogName: string | undefined = undefined;
      if (exp.sanidadId) {
        if (exp.type === "Vacunacion") {
          dogName = dogNameMaps.vacunas.get(exp.sanidadId);
        } else if (
          exp.type === "Desparasitacion Interna" ||
          exp.type === "Desparasitacion Externa"
        ) {
          dogName = dogNameMaps.desparasitaciones.get(exp.sanidadId);
        } else if (exp.type === "Baño") {
          dogName = dogNameMaps.banios.get(exp.sanidadId);
        }
      }

      return {
        id: exp.id,
        userId: exp.userId,
        interventionId: exp.interventionId || undefined,
        sanityId: exp.sanidadId || undefined,
        concept: exp.concept,
        type: exp.type,
        state: exp.state === "pagado" ? "Pagado" : "Pendiente de pago",
        amount: exp.amount,
        fecha,
        dogName,
        user: userExpense,
      };
    });

    return {
      data,
      count,
      totalPages: Math.ceil(count / pagination.size),
      totalItems: count,
      page: pagination.page,
      size: pagination.size,
    };
  }

  async findInitialValuesForFilter() {
    const expenses = await Expense.findAll({
      attributes: ["id", "userId", "state", "dateSanity"],
      include: [
        {
          model: User,
          as: "User",
          attributes: ["ci", "nombre"],
          required: true,
        },
        {
          model: Intervention,
          as: "Intervencion",
          attributes: ["timeStamp"],
          required: false,
        },
      ],
    });

    const peopleMap = new Map<string, { userId: string; nombre: string }>();
    for (const exp of expenses) {
      const ci = exp.userId;
      const nombre = exp.User?.nombre ?? exp.userId;
      if (ci) peopleMap.set(ci, { userId: ci, nombre });
    }
    const people = Array.from(peopleMap.values());

    const statuses = ["Pagado", "Pendiente de pago"];

    const monthSet = new Map<string, number>();

    for (const exp of expenses) {
      const d: Date = exp.Intervencion?.timeStamp ?? exp.dateSanity;

      if (Number.isNaN(d.getTime())) continue;

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

  async createExpense(
    request: CreateExpenseDto,
    options?: { transaction?: Transaction }
  ): Promise<Expense> {
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
    const isSanidadType =
      request.type === "Baño" ||
      request.type === "Vacunacion" ||
      request.type === "Desparasitacion Interna" ||
      request.type === "Desparasitacion Externa";

    if (!isSanidadType && !intervention) {
      throw new Error(
        `Intervention with id "${request.interventionId}" not found`
      );
    }
    if (!user) {
      throw new Error(`User with id "${request.userId}" not found`);
    }

    if (intervention && request.km)
      request.amount *= fixedCostsService.getCostoKilometros();

    const expense = await Expense.create(
      {
        userId: request.userId,
        interventionId:
          request.interventionId && request.interventionId.trim() !== ""
            ? request.interventionId
            : null,
        sanidadId: request.sanidadId,
        dateSanity: request.dateSanity,
        type: request.type,
        concept: request.concept,
        state: request.state === "Pendiente de pago" ? "no pagado" : "pagado",
        amount: request.amount,
      },
      transaction ? { transaction } : {}
    );

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

  async updateSanidadForExpense(
    expenseId: string,
    payload: Record<string, unknown>
  ): Promise<Vacuna | Banio | Desparasitacion | null> {
    const expense = await Expense.findByPk(expenseId).catch(() => null);
    if (!expense) return null;

    const type = expense.type as string | undefined;
    const sanidadId = expense.sanidadId as string | undefined;

    const isSanidadType =
      type === "Baño" ||
      type === "Vacunacion" ||
      type === "Desparasitacion Interna" ||
      type === "Desparasitacion Externa";

    if (!isSanidadType) return null;

    const sanitizeUpdateObj = (obj: Record<string, unknown>) => {
      const forbidden = new Set([
        "id",
        "registroSanidadId",
        "createdAt",
        "updatedAt",
      ]);
      const out: Record<string, unknown> = {};
      for (const k of Object.keys(obj)) {
        if (forbidden.has(k)) continue;
        out[k] = obj[k];
      }
      return out;
    };

    if (sanidadId && type) {
      let entity: Vacuna | Banio | Desparasitacion | null = null;
      switch (type) {
        case "Vacunacion":
          entity = await Vacuna.findByPk(sanidadId).catch(() => null);
          break;
        case "Baño":
          entity = await Banio.findByPk(sanidadId).catch(() => null);
          break;
        case "Desparasitacion Interna":
        case "Desparasitacion Externa":
          entity = await Desparasitacion.findByPk(sanidadId).catch(() => null);
          break;
      }
      if (entity) {
        const upd = sanitizeUpdateObj(payload);
        await entity.update(upd).catch(() => null);
        return entity;
      }
    }

    return null;
  }

  getFixedCost(sanidadtype: string): number {
    switch (sanidadtype) {
      case "Baño":
        return fixedCostsService.getCostoBanio();
      case "Vacunacion":
        return fixedCostsService.getCostoVacunas();
      case "Desparasitacion Interna":
        return fixedCostsService.getCostoDesparasitacionInterna();
      case "Desparasitacion Externa":
        return fixedCostsService.getCostoDesparasitacionExterna();
      default:
        return 0;
    }
  }

  async deleteExpense(id: string, payload: PayloadForUser): Promise<number> {
    const expense = await Expense.findOne({
      where:
        payload.type === "Administrador"
          ? {
              id,
            }
          : {
              id,
              userId: payload.ci,
            },
    });

    if (!expense) return 0;

    const transaction = await sequelize.transaction();

    try {
      let promiseDestroySanity = Promise.resolve(0);

      if (expense.sanidadId) {
        switch (expense.type) {
          case "Baño":
            promiseDestroySanity = Banio.destroy({
              where: { id: expense.sanidadId },
              transaction,
            });
            break;

          case "Vacunacion":
            promiseDestroySanity = Vacuna.destroy({
              where: { id: expense.sanidadId },
              transaction,
            });
            break;

          case "Desparasitacion Interna":
          case "Desparasitacion Externa":
            promiseDestroySanity = Desparasitacion.destroy({
              where: { id: expense.sanidadId },
              transaction,
            });
            break;
        }
      }

      await Promise.all([
        expense.destroy({ transaction }),
        promiseDestroySanity,
      ]);

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    return 1;
  }
}
