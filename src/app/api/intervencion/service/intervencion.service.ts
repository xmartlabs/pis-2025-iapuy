import { Intervention } from "@/app/models/intervention.entity";
import { Institucion } from "@/app/models/institucion.entity";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";
import { Op } from "sequelize";
import { UsrPerro } from "@/app/models/usrperro.entity";
import type { PayloadForUser } from "../../users/service/user.service";

export class IntervencionService {
  async findAll(
    pagination: PaginationDto,
    payload: PayloadForUser
  ): Promise<PaginationResultDto<Intervention>> {
    const result = await Intervention.findAndCountAll({
      where:
        payload.type === "Administrador"
          ? undefined
          : {
              userId: payload.ci,
            },
      include: [
        {
          model: Institucion,
          as: "Institucions",
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
    payload: PayloadForUser
  ): Promise<PaginationResultDto<Intervention>> {
    const interventionWhere = pagination.query
      ? { descripcion: { [Op.iLike]: `%${pagination.query}%` } }
      : {};

    const result = await Intervention.findAndCountAll({
      where: interventionWhere,
      include: [
        {
          model: UsrPerro,
          as: "UsrPerroIntervention",
          where:
            payload.type === "Administrador"
              ? {
                  perroId: dogId,
                }
              : {
                  perroId: dogId,
                  userId: payload.ci,
                },
          attributes: [],
          required: true,
        },
        {
          model: Institucion,
          as: "Institucions",
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
