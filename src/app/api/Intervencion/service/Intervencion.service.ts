import { Intervencion } from "@/app/models/intervencion.entity";
import { Institucion } from "@/app/models/institucion.entity";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";
import {InstitucionIntervencion} from "@/app/models/institucion-intervenciones.entity";
import {Acompania} from "@/app/models/acompania.entity";
import type {InstitutionDto} from "@/app/app/admin/intervenciones/dtos/institution.dto";

export class IntervencionService {
  async findAll(
    pagination: PaginationDto
  ): Promise<PaginationResultDto<Intervencion>> {
    const result = await Intervencion.findAndCountAll({
        include: [
            {
                model: Institucion,
                attributes: ["id", "nombre"],
            },
        ],
      limit: pagination.size,
      offset: pagination.getOffset(),
      order: pagination.getOrder(),
    });
    return getPaginationResultFromModel(pagination, result);
  }
}




