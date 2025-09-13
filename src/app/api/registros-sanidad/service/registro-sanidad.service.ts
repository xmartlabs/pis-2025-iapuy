import { Banio } from "@/app/models/banio.entity";
import { Desparasitacion } from "@/app/models/desparasitacion.entity";
import { Perro } from "@/app/models/perro.entity";
import { RegistroSanidad } from "@/app/models/registro-sanidad.entity";
import { User } from "@/app/models/user.entity";
import { Vacuna } from "@/app/models/vacuna.entity";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";

export class RegistrosSanidadService {
  async findAll(
    pagination: PaginationDto,
    id: string,
  ): Promise<PaginationResultDto<RegistroSanidad>> {
    try {
      const result = await RegistroSanidad.findAndCountAll({
        where: {
          perroId: id,
        },
        include: [
          {
            model: Perro,
            include: [
              {
                model: User,
              },
            ],
          },
          {
            model: Banio,
          },
          {
            model: Vacuna,
          },
          {
            model: Desparasitacion,
          },
        ],
        limit: pagination.size,
      });
      return getPaginationResultFromModel(pagination, result);
    } catch (error) {
      const result = { rows: [], count: 0 };
      return getPaginationResultFromModel(pagination, result);
    }
  }
}
