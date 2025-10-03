import { Institucion } from "@/app/models/institucion.entity";
import { Patologia } from "@/app/models/patologia.entity";
import { type PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import { type PaginationDto } from "@/lib/pagination/pagination.dto";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";
import { Op } from "sequelize";
import { type CreateInstitutionDTO } from "../dtos/create-institucion.dto";
import { InstitutionContact } from "@/app/models/institution-contact.entity";

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
      institutionDTO.institutionContacts.map((referente) =>
        InstitutionContact.create({
          name: referente.name,
          contact: referente.contact,
          institutionId: institution.id,
        })
      )
    );
    return institution;
  }
}
