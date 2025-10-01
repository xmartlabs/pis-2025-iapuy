/* eslint-disable*/

import { Intervencion } from "@/app/models/intervencion.entity";
import { User } from "@/app/models/user.entity";
import { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import { PaginationDto } from "@/lib/pagination/pagination.dto";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";
import { EvaluateInterventionDTO } from "../dtos/evaluate-intervention.dto";
import sequelize from "@/lib/database";
import { Paciente } from "@/app/models/pacientes.entity";
import { PerroExperiencia } from "@/app/models/perros-experiencia.entity";

export class IntervencionService {
  async findAll(
    pagination: PaginationDto
  ): Promise<PaginationResultDto<Intervencion>> {
    const result = await Intervencion.findAndCountAll({
      include: [
        {
          model: User,
        },
      ],
      limit: pagination.size,
      offset: pagination.getOffset(),
      order: pagination.getOrder(),
    });

    return getPaginationResultFromModel(pagination, result);
  }

  /* eslint-enable*/

  async  evaluate(id: string, body: EvaluateInterventionDTO) {
    const transaction = await sequelize.transaction();
    try {

      const intervention = await Intervencion.findByPk(id, { transaction });
      if (!intervention) throw new Error("Intervention not found");
      if (body.pictures && body.pictures.length > 0){
        intervention.fotosUrls = body.pictures;
      }
      if (body.driveLink){
        intervention.driveLink = body.driveLink;
      }
      await intervention.save({ transaction });

      await Promise.all(body.patients.map((patient) =>
        Paciente.create(
          {
            nombre: patient.name,
            edad: patient.age,
            patologiaId: patient.pathology_id,
            intervencionId: id,
            experiencia: patient.experience
          },{ transaction }
        )
      ));

      await Promise.all(body.experiences.map((dogExperience) =>
        PerroExperiencia.create(
          {
            perroId : dogExperience.perro_id,
            intervencionId : id,
            experiencia : dogExperience.experiencia
          },{ transaction }
        )
      ));
      
      await transaction.commit();
      return intervention;

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }


}
