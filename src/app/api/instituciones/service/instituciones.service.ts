import { Institucion } from "@/app/models/institucion.entity";
import { Patologia } from "@/app/models/patologia.entity";
import { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import { PaginationDto } from "@/lib/pagination/pagination.dto";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";
import { Op } from "sequelize";

export class InstitucionesService {
  async findAll(
    pagination: PaginationDto
  ): Promise<PaginationResultDto<Institucion>> {
    const result = await Institucion.findAndCountAll({
      where: pagination.query
        ? { nombre: { [Op.iLike]: `%${pagination.query}%` } }
        : undefined,
      include: [
        {
          model: Patologia,
        },
      ],
      limit: pagination.size,
      offset: pagination.getOffset(),
      order: pagination.getOrder(),
    });

    return getPaginationResultFromModel(pagination, result);
  }

  async findAllSimple(): Promise<Array<{ id: string; name: string }>> {
    const result = await Institucion.findAll({
      attributes: ["id", "nombre"],
    });

    return result.map((institucion) => ({
      id: institucion.id,
      name: institucion.nombre,
    }));
  }
}
