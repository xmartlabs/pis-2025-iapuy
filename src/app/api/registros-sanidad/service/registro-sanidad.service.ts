import { Banio } from "@/app/models/banio.entity";
import { Desparasitacion } from "@/app/models/desparasitacion.entity";
import { RegistroSanidad } from "@/app/models/registro-sanidad.entity";
import { Vacuna } from "@/app/models/vacuna.entity";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";
import { EventoSanidadDto } from "@/app/api/registros-sanidad/dtos/evento-sanidad.dto";

export class RegistrosSanidadService {
  async findAll(
    pagination: PaginationDto,
    id: string,
  ): Promise<PaginationResultDto<EventoSanidadDto>> {
    try {
      const registroPerro = await RegistroSanidad.findOne({
        where: { perroId: id },
      });
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
        ...banios.map(
          (b) =>
            new EventoSanidadDto(
              b.id,
              b.fecha.toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }),
              "Baño",
            ),
        ),
        ...vacunas.map(
          (v) =>
            new EventoSanidadDto(
              v.id,
              v.fecha.toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }),
              "Vacuna",
            ),
        ),
        ...desparasitaciones.map(
          (d) =>
            new EventoSanidadDto(
              d.id,
              d.fecha.toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }),
              "Desparasitación",
            ),
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
    } catch {
      const result = { rows: [], count: 0 };
      return getPaginationResultFromModel(pagination, result);
    }
  }
}
