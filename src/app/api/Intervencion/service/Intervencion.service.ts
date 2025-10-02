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
import { InstitucionIntervencion } from "@/app/models/institucion-intervenciones.entity";
import { InstitucionPatologias } from "@/app/models/intitucion-patalogia.entity";
import { Patologia } from "@/app/models/patologia.entity";
import { UsrPerro } from "@/app/models/usrperro.entity";
import { Perro } from "@/app/models/perro.entity";
import fs from "fs";
import path from "path";

export class IntervencionService {

  async findAllPathologiesbyId(id: string) {
        const relation = await InstitucionIntervencion.findOne({
        where: { intervencionId: id }
        });
        if(!relation){ return [] }
        const institutionId = relation.institucionId;
        const pathologiesRelation = await InstitucionPatologias.findAll({
          where: { institucionId : institutionId }
        });
        const pathologies = await Promise.all(
          pathologiesRelation.map((rel) =>
            Patologia.findByPk(rel.patologiaId, {
              attributes: ["id", "nombre"]
            })
          )
        );
        return pathologies
  }

  async findAllDogsbyId(id: string) {
      const pairsUserDog = await UsrPerro.findAll({
        where: { intervencionId: id }
      });
      if(!pairsUserDog){ return [] }
      const dogs = await Promise.all(
        pairsUserDog.map((pair) =>
          Perro.findByPk(pair.perroId, {
            attributes: ["id", "nombre"]
          })
        )
      );
      return dogs
  }

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
      
      const picturesUrls: string[] = [];
      if (body.pictures && body.pictures.length > 0) {
        const uploadDir = path.join(process.cwd(), "public","interventionsPictures", id);
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        for (const file of body.pictures) {
          if (file.size > 15 * 1024 * 1024) {
            throw new Error(`El archivo ${file.name} excede el tamaño máximo permitido el cual es de 15MB`);
          }
          if (!file.type.startsWith("image/")) {
            throw new Error(`El archivo ${file.name} no es una imagen válida`);
          }
          const fileName = `${Date.now()}-${file.name}`;
          const filePath = path.join(uploadDir, fileName);
          // eslint-disable-next-line no-await-in-loop
          const buffer = Buffer.from(await file.arrayBuffer());
          fs.writeFileSync(filePath, buffer);
          picturesUrls.push(`/interventionsPictures/${id}/${fileName}`);
        }
        intervention.fotosUrls = picturesUrls;
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
            patologia_id: patient.pathology_id,
            intervencion_id: id,
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
