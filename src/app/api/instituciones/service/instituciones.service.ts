import { Institucion } from "@/app/models/institucion.entity";
import { Patologia } from "@/app/models/patologia.entity";
import { type PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import { type PaginationDto } from "@/lib/pagination/pagination.dto";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";
import { Op } from "sequelize";
import { type CreateInstitutionDTO } from "../dtos/create-institucion.dto";
import { InstitutionContact } from "@/app/models/institution-contact.entity";
import { InstitucionPatologias } from "@/app/models/intitucion-patalogia";

export class InstitutionsService {
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
          as: "Patologias",
        },
      ],
      limit: pagination.size,
      offset: pagination.getOffset(),
      order: pagination.getOrder(),
    });

    return getPaginationResultFromModel(pagination, result);
  }

  async create(institutionDTO: CreateInstitutionDTO): Promise<Institucion> {
    const existe =
      (await Institucion.findOne({
        where: { nombre: institutionDTO.name },
      })) !== null;
    if (existe) {
      throw new Error("Ya existe una institucion con el nombre elegido.");
    }
    const institution: Institucion = await Institucion.create({
      nombre: institutionDTO.name,
    });
    await Promise.all(
      institutionDTO.institutionContacts.map((contact) =>
        InstitutionContact.create({
          name: contact.name,
          contact: contact.contact,
          institutionId: institution.id,
        })
      )
    );
    await Promise.all(
      institutionDTO.pathologies.map(async (name) => {
        const [pathology] = await Patologia.findOrCreate({
          where: { nombre: name },
          defaults: { nombre: name },
        });
        await InstitucionPatologias.findOrCreate({
          where: { institucionId: institution.id, patologiaId: pathology.id },
          defaults: {
            institucionId: institution.id,
            patologiaId: pathology.id,
          },
        });
      })
    );
    return institution;
  }
}
