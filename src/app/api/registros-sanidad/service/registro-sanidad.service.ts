import { Banio } from "@/app/models/banio.entity";
import { Desparasitacion } from "@/app/models/desparasitacion.entity";
import { RegistroSanidad } from "@/app/models/registro-sanidad.entity";
import { Vacuna } from "@/app/models/vacuna.entity";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";
import type { CreateRegistrosSanidadDTO } from "../dtos/create-registro-sanidad.dto";
import sequelize from "@/lib/database";
import { EventoSanidadDto } from "@/app/api/registros-sanidad/dtos/evento-sanidad.dto";
import type { PayloadForUser } from "../../perros/detalles/route";
import { Perro } from "@/app/models/perro.entity";
import { type FindOptions } from "sequelize";
import { User } from "@/app/models/user.entity";
import { ExpensesService } from "../../expenses/service/expenses.service";
import type { CreateExpenseDto } from "../../expenses/dtos/create-expense.dto";
import { Expense } from "@/app/models/expense.entity";

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

      const fechaDate = new Date(createRegistroSanidadDto.fecha);
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

  async delete(
    id: string,
    activity: string,
    payload: PayloadForUser
  ): Promise<boolean> {
    return await sequelize.transaction(async (t) => {
      if (payload.type === "Administrador") {
        let expense = null;

        if (activity === "Baño") {
          const bath = await Banio.findByPk(id);
          if (!bath) {
            throw new Error(`${activity} not found with id: ${id}`);
          }

          expense = await Expense.findOne({
            attributes: ["id", "state"],
            where: {
              sanidadId: id,
              type: activity,
            },
          });
          await Banio.destroy({
            where: { id: bath.id },
            transaction: t,
          });
        } else if (activity === "Vacuna") {
          const vaccination = await Vacuna.findByPk(id);
          if (!vaccination) {
            throw new Error(`${activity} not found with id: ${id}`);
          }
          expense = await Expense.findOne({
            attributes: ["id", "state"],
            where: {
              sanidadId: id,
              type: activity,
            },
          });
          await Vacuna.destroy({
            where: { id: vaccination.id },
            transaction: t,
          });
        } else if (activity === "Desparasitación") {
          const deworming = await Desparasitacion.findByPk(id);
          if (!deworming) {
            throw new Error(`${activity} not found with id: ${id}`);
          }
          const type = `Desparasitacion ${deworming.tipoDesparasitacion}`;
          expense = await Expense.findOne({
            attributes: ["id", "state"],
            where: {
              sanidadId: id,
              type,
            },
          });
          await Desparasitacion.destroy({
            where: { id: deworming.id },
            transaction: t,
          });
        }

        if (expense) {
          if (expense.state === "pagado") {
            throw new Error(
              `${activity} cannot be destroyed. There's an expense already paid asociated.`
            );
          }
          await Expense.destroy({
            where: { id: expense.id },
            transaction: t,
          });
        }
      } else {
        const options: FindOptions = {
          where: { id },
        };
        options.include = [
          {
            model: RegistroSanidad,
            as: "RegistroSanidad",
            required: true,
            include: [
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
            ],
          },
        ];
        let expense = null;
        if (activity === "Baño") {
          const bath = await Banio.findOne(options);
          if (!bath) {
            throw new Error(`${activity} not found with id: ${id}`);
          }
          expense = await Expense.findOne({
            attributes: ["id", "state"],
            where: {
              sanidadId: id,
              type: activity,
            },
          });
          await Banio.destroy({
            where: { id: bath.id },
            transaction: t,
          });
        } else if (activity === "Vacuna") {
          const vaccination = await Vacuna.findOne(options);
          if (!vaccination) {
            throw new Error(`${activity} not found with id: ${id}`);
          }
          expense = await Expense.findOne({
            attributes: ["id", "state"],
            where: {
              sanidadId: id,
              type: activity,
            },
          });
          await Vacuna.destroy({
            where: { id: vaccination.id },
            transaction: t,
          });
        } else if (activity === "Desparasitación") {
          const deworming = await Desparasitacion.findOne(options);
          if (!deworming) {
            throw new Error(`${activity} not found with id: ${id}`);
          }
          const type = `Desparasitacion ${deworming.tipoDesparasitacion}`;
          expense = await Expense.findOne({
            attributes: ["id", "state"],
            where: {
              sanidadId: id,
              type,
            },
          });
          await Desparasitacion.destroy({
            where: { id: deworming.id },
            transaction: t,
          });
        }

        if (expense) {
          if (expense.state === "pagado") {
            throw new Error(
              `${activity} cannot be destroyed. There's an expense already paid asociated.`
            );
          }
          await Expense.destroy({
            where: { id: expense.id },
            transaction: t,
          });
        }
      }
      return true;
    });
  }
}
