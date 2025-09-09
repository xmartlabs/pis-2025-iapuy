import { Banio } from "@/app/models/banio.entity";
import { Desparasitacion } from "@/app/models/desparasitacion.entity";
import { Perro } from "@/app/models/perro.entity";
import { RegistroSanidad } from "@/app/models/registro-sanidad.entity";
import { User } from "@/app/models/user.entity";
import { Vacuna } from "@/app/models/vacuna.entity";
import { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import { PaginationDto } from "@/lib/pagination/pagination.dto";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";

export class RegistrosSanidadService {
  async findAll(
    pagination: PaginationDto
  ): Promise<PaginationResultDto<RegistroSanidad>> {
    const result = await RegistroSanidad.findAndCountAll({
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
      offset: pagination.getOffset(),
      order: pagination.getOrder(),
    });

    return getPaginationResultFromModel(pagination, result);
  }
}
