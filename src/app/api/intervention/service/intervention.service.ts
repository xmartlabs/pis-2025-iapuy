import { Intervention } from "@/app/models/intervention.entity";
import { Institucion } from "@/app/models/institucion.entity";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";
import { Op } from "sequelize";
import { UsrPerro } from "@/app/models/usrperro.entity";
import type { PayloadForUser } from "../../users/service/user.service";
import type { CreateInterventionDto } from "../dtos/create-intervention.dto";
import { InstitucionIntervencion } from "@/app/models/institucion-intervenciones.entity";
import sequelize from "@/lib/database";

export class InterventionService {
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
          as: "institutions",
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

  async create(request: CreateInterventionDto): Promise<Intervention> {
    const institution = await Institucion.findOne({
      where: { nombre: request.institution },
    });
    if (!institution) {
      throw new Error(
        `Institution with name "${request.institution}" not found`
      );
    }
    const transaction = await sequelize.transaction();

    try {
      const intervention = await Intervention.create(
        {
          timeStamp: request.timeStamp,
          costo: request.cost,
          tipo: request.type,
          pairsQuantity: request.pairsQuantity,
          description: request.description,
          status: request.state,
        },
        { transaction }
      );

      await InstitucionIntervencion.create(
        {
          institucionId: institution.id,
          intervencionId: intervention.id,
        },
        { transaction }
      );

      await transaction.commit();

      return intervention;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
