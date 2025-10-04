import { Intervention } from "@/app/models/intervention.entity";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";
import type { CreateInterventionDto } from "../dtos/create-intervention.dto";
import { Institucion } from "@/app/models/institucion.entity";
import { Op } from "sequelize";

export class InterventionService {
  async findAll(
    pagination: PaginationDto
  ): Promise<PaginationResultDto<Intervention>> {
    const result = await Intervention.findAndCountAll({
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

  async create(request: CreateInterventionDto): Promise<Intervention> {
    return await Intervention.create({
      ...request,
    });
  }
}
