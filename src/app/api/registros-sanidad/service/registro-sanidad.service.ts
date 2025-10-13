import { Banio } from "@/app/models/banio.entity";
import { Desparasitacion } from "@/app/models/desparasitacion.entity";
import { RegistroSanidad } from "@/app/models/registro-sanidad.entity";
import { Vacuna } from "@/app/models/vacuna.entity";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";
import type { CreateHealthRecordDTO } from "../dtos/create-registro-sanidad.dto";
import sequelize from "@/lib/database";
import { EventoSanidadDto } from "@/app/api/registros-sanidad/dtos/evento-sanidad.dto";
import type { PayloadForUser } from "../../perros/detalles/route";
import { Perro } from "@/app/models/perro.entity";
import type { FindOptions } from "sequelize";
import { User } from "@/app/models/user.entity";

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
    createHealthRecordDto: CreateHealthRecordDTO
  ): Promise<RegistroSanidad | null> {
    return await sequelize.transaction(async (t) => {
      let healthRec = await RegistroSanidad.findOne({
        where: { perroId: createHealthRecordDto.perroId },
      });

      if (healthRec === null)
        healthRec = await RegistroSanidad.create(
          { perroId: createHealthRecordDto.perroId },
          { transaction: t }
        );

      const date = new Date(createHealthRecordDto.fecha);

      if (createHealthRecordDto.tipoSanidad === "banio") {
        await Banio.create(
          {
            fecha: date,
            registroSanidadId: healthRec.id,
          },
          { transaction: t }
        );
      } else if (createHealthRecordDto.tipoSanidad === "desparasitacion") {
        await Desparasitacion.create(
          {
            fecha: date,
            medicamento: createHealthRecordDto.medicamento,
            registroSanidadId: healthRec.id,
            tipoDesparasitacion: createHealthRecordDto.tipoDesparasitacion,
          },
          { transaction: t }
        );
      } else {
        await Vacuna.create(
          {
            fecha: date,
            vac: createHealthRecordDto.vac,
            registroSanidadId: healthRec.id,
            carneVacunas: createHealthRecordDto.carneVacunas,
          },
          { transaction: t }
        );
      }
      return healthRec;
    });
  }
}
