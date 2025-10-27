import { Banio } from "@/app/models/banio.entity";
import { Desparasitacion } from "@/app/models/desparasitacion.entity";
import { RegistroSanidad } from "@/app/models/registro-sanidad.entity";
import { Vacuna } from "@/app/models/vacuna.entity";
import { Expense } from "@/app/models/expense.entity";

// Helper: parse a date-only string (yyyy-mm-dd) into a Date set at 12:00 local time
// This avoids timezone shifts that move the date to the previous day when
// stored/retrieved as an instant (UTC).
function parseDateToNoon(input?: string | Date): Date | undefined {
  if (!input) return undefined;
  if (input instanceof Date) return input;
  const s = String(input).trim();
  const isoDateOnly = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateOnly) {
    const y = Number(isoDateOnly[1]);
    const m = Number(isoDateOnly[2]) - 1;
    const d = Number(isoDateOnly[3]);
    if (!Number.isNaN(y) && !Number.isNaN(m) && !Number.isNaN(d)) {
      return new Date(y, m, d, 12, 0, 0, 0);
    }
  }
  // Fallback: try native parse
  const parsed = new Date(s);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed;
}
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";
import type { CreateRegistrosSanidadDTO } from "../dtos/create-registro-sanidad.dto";
import sequelize from "@/lib/database";
import { EventoSanidadDto } from "@/app/api/registros-sanidad/dtos/evento-sanidad.dto";
import type { PayloadForUser } from "../../perros/detalles/route";
import { Perro } from "@/app/models/perro.entity";
import type { FindOptions, Transaction } from "sequelize";
import { User } from "@/app/models/user.entity";
import { ExpensesService } from "../../expenses/service/expenses.service";
import type { CreateExpenseDto } from "../../expenses/dtos/create-expense.dto";

export class RegistrosSanidadService {
  async findAll(
    pagination: PaginationDto,
    id: string,
    payload: PayloadForUser
  ): Promise<PaginationResultDto<EventoSanidadDto>> {
    const options: FindOptions = {
      where: { perroId: id },
    };

    if (payload.type !== "Administrador") {
      options.include = [
        {
          model: Perro,
          as: "Perro",
          required: true,
          include: [
            {
              model: User,
              as: "User",
              where: { ci: payload.ci },
              required: true,
            },
          ],
        },
      ];
    }

    const registroPerro = await RegistroSanidad.findOne(options);
    if (!registroPerro) {
      return getPaginationResultFromModel(pagination, { rows: [], count: 0 });
    }
    let banios: Banio[] = [];
    let vacunas: Vacuna[] = [];
    let desparasitaciones: Desparasitacion[] = [];
    [banios, vacunas, desparasitaciones] = await Promise.all([
      Banio.findAll({ where: { registroSanidadId: registroPerro.id } }),
      Vacuna.findAll({ where: { registroSanidadId: registroPerro.id } }),
      Desparasitacion.findAll({
        where: { registroSanidadId: registroPerro.id },
      }),
    ]);

    const eventos: EventoSanidadDto[] = [
      ...banios.map((b) => new EventoSanidadDto(b.id, b.fecha, "Baño")),
      ...vacunas.map((v) => new EventoSanidadDto(v.id, v.fecha, "Vacuna")),
      ...desparasitaciones.map(
        (d) => new EventoSanidadDto(d.id, d.fecha, "Desparasitación")
      ),
    ];

    const start = (pagination.page - 1) * pagination.size;
    const end = start + pagination.size;
    const paginatedRows = eventos.slice(start, end);

    const result: { rows: EventoSanidadDto[]; count: number } = {
      rows: paginatedRows,
      count: eventos.length,
    };
    return getPaginationResultFromModel(pagination, result);
  }

  async create(
    createRegistroSanidadDto: CreateRegistrosSanidadDTO
  ): Promise<RegistroSanidad | null> {
    return await sequelize.transaction(async (t) => {
      let regSanidad = await RegistroSanidad.findOne({
        where: { perroId: createRegistroSanidadDto.perroId },
      });

      if (regSanidad === null)
        regSanidad = await RegistroSanidad.create(
          { perroId: createRegistroSanidadDto.perroId },
          { transaction: t }
        );

      const fechaDate =
        parseDateToNoon(createRegistroSanidadDto.fecha) ??
        new Date(String(createRegistroSanidadDto.fecha));
      let sanidadEventId: string = "";

      if (createRegistroSanidadDto.tipoSanidad === "banio") {
        const banio = await Banio.create(
          {
            fecha: fechaDate,
            registroSanidadId: regSanidad.id,
          },
          { transaction: t }
        );
        sanidadEventId = banio.id;
      } else if (createRegistroSanidadDto.tipoSanidad === "desparasitacion") {
        const desparasitacion = await Desparasitacion.create(
          {
            fecha: fechaDate,
            medicamento: createRegistroSanidadDto.medicamento,
            registroSanidadId: regSanidad.id,
            tipoDesparasitacion: createRegistroSanidadDto.tipoDesparasitacion,
          },
          { transaction: t }
        );
        sanidadEventId = desparasitacion.id;
      } else {
        const vacuna = await Vacuna.create(
          {
            fecha: fechaDate,
            vac: createRegistroSanidadDto.vac,
            registroSanidadId: regSanidad.id,
            carneVacunas: createRegistroSanidadDto.carneVacunas,
          },
          { transaction: t }
        );
        sanidadEventId = vacuna.id;
      }
      const expensesService = new ExpensesService();
      const perro = await Perro.findByPk(createRegistroSanidadDto.perroId, {
        transaction: t,
      });

      if (perro && perro.duenioId) {
        // Map tipoSanidad to expense type
        let expenseType:
          | "Baño"
          | "Vacunacion"
          | "Desparasitacion Interna"
          | "Desparasitacion Externa" = "Baño";
        if (createRegistroSanidadDto.tipoSanidad === "banio") {
          expenseType = "Baño";
        } else if (createRegistroSanidadDto.tipoSanidad === "desparasitacion") {
          expenseType =
            createRegistroSanidadDto.tipoDesparasitacion === "Interna"
              ? "Desparasitacion Interna"
              : "Desparasitacion Externa";
        } else {
          expenseType = "Vacunacion";
        }

        const createExpenseDto: CreateExpenseDto = {
          userId: perro.duenioId,
          interventionId: "",
          sanidadId: sanidadEventId,
          dateSanity: fechaDate,
          type: expenseType,
          concept: "",
          state: "Pendiente de pago",
          amount: expensesService.getFixedCost(expenseType),
          km: false,
        };
        await expensesService.createExpense(createExpenseDto, {
          transaction: t,
        });
      }
      return regSanidad;
    });
  }
  async findOne(id: string): Promise<RegistroSanidad | null> {
    return await RegistroSanidad.findByPk(id);
  }

  async updateEventoSanidad(
    tipoSanidad: "banio" | "desparasitacion" | "vacuna",
    eventoId: string,
    data: {
      fecha?: string | Date;
      medicamento?: string;
      tipoDesparasitacion?: string;
      vac?: string;
      carneVacunas?: Buffer | ArrayBuffer | null;
    },
    options?: { transaction?: Transaction }
  ): Promise<Banio | Desparasitacion | Vacuna | null> {
    const updatePayload: {
      fecha?: Date;
      medicamento?: string;
      tipoDesparasitacion?: string;
      vac?: string;
      carneVacunas?: Buffer;
    } = {};
    if (data.fecha)
      updatePayload.fecha =
        parseDateToNoon(data.fecha) ?? new Date(String(data.fecha));
    const doUpdate = async (t?: Transaction) => {
      if (tipoSanidad === "banio") {
        const banio = await Banio.findByPk(eventoId);
        if (!banio) return null;
        await banio.update(updatePayload, { transaction: t });

        if (updatePayload.fecha) {
          await Expense.update(
            { dateSanity: updatePayload.fecha },
            { where: { sanidadId: eventoId }, transaction: t }
          );
        }

        return banio;
      }

      if (tipoSanidad === "desparasitacion") {
        if (data.medicamento !== undefined)
          updatePayload.medicamento = data.medicamento;
        if (data.tipoDesparasitacion !== undefined)
          updatePayload.tipoDesparasitacion = data.tipoDesparasitacion;

        const despar = await Desparasitacion.findByPk(eventoId);
        if (!despar) return null;
        await despar.update(updatePayload, { transaction: t });

        if (updatePayload.fecha) {
          await Expense.update(
            { dateSanity: updatePayload.fecha },
            { where: { sanidadId: eventoId }, transaction: t }
          );
        }

        return despar;
      }

      if (data.vac !== undefined) updatePayload.vac = data.vac;
      if (data.carneVacunas !== undefined && data.carneVacunas !== null) {
        if (data.carneVacunas instanceof ArrayBuffer) {
          updatePayload.carneVacunas = Buffer.from(data.carneVacunas);
        } else if (Buffer.isBuffer(data.carneVacunas)) {
          updatePayload.carneVacunas = data.carneVacunas;
        }
      }

      const vacuna = await Vacuna.findByPk(eventoId);
      if (!vacuna) return null;
      await vacuna.update(updatePayload, { transaction: t });

      if (updatePayload.fecha) {
        await Expense.update(
          { dateSanity: updatePayload.fecha },
          { where: { sanidadId: eventoId }, transaction: t }
        );
      }

      return vacuna;
    };

    // If caller provided a transaction, use it; otherwise create a transaction for atomicity
    if (options?.transaction) {
      return await doUpdate(options.transaction);
    }

    return await sequelize.transaction(async (t) => await doUpdate(t));
  }
}
