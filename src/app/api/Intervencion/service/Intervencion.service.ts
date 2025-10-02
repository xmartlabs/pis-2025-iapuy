import { Intervencion } from "@/app/models/intervencion.entity";
import { Institucion } from "@/app/models/institucion.entity";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";
import { Op } from "sequelize";
import {UsrPerro} from "@/app/models/usrperro.entity";

export class IntervencionService {
  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginationResultDto<Intervencion>> {
    const result = await Intervencion.findAndCountAll({
      include: [
        {
          model: Institucion,
          attributes: ["id", "nombre"],
          where: pagination.query
            ? { nombre: { [Op.iLike]: `%${pagination.query}%` } }
            : undefined,
        },
      ],
      limit: pagination.size,
      offset: pagination.getOffset(),
      order: pagination.getOrder(),
    });
    return getPaginationResultFromModel(pagination, result);
  }

    async findInterventionByDogId(
        pagination: PaginationDto,
        dogId: string,
    ): Promise<PaginationResultDto<Intervencion>> {

        const interventionWhere = pagination.query
            ? { descripcion: { [Op.iLike]: `%${pagination.query}%` } }
            : {};

        const result = await Intervencion.findAndCountAll({
            where: interventionWhere,
            include: [
                {
                    model: UsrPerro,
                    where: { perroId: { [Op.eq]: dogId } },
                    required: true,
                },
                {
                    model: Institucion,
                    attributes: ["id", "nombre"],
                    where: interventionWhere,
                },
            ],
            limit: pagination.size,
            offset: pagination.getOffset(),
            order: pagination.getOrder(),
        });
        return getPaginationResultFromModel(pagination, result);
    }
}
