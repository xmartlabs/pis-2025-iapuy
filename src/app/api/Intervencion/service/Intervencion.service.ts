import { Intervencion } from "@/app/models/intervencion.entity";
import { Institucion } from "@/app/models/institucion.entity";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";
import { Perro } from "@/app/models/perro.entity";
import { Op } from "sequelize";

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

  async findByDogId(
    pagination: PaginationDto,
    dogId: string,
  ): Promise<PaginationResultDto<Intervencion>> {
    const result = await Intervencion.findAndCountAll({
      include: [
        {
          model: Perro,
          where: { id: { [Op.eq]: dogId } },
          attributes: [],
          required: true,
        },
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
}
