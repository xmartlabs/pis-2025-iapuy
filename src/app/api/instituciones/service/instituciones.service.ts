import { Institucion } from "@/app/models/institucion.entity";
import { Patologia } from "@/app/models/patologia.entity";
import { type PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import { type PaginationDto } from "@/lib/pagination/pagination.dto";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";
import { Op } from "sequelize";
import { type CreateInstitucionDTO } from "../dtos/create-institucion.dto";
import { ContactoInstitucion } from "@/app/models/contacto-institucion.entity";
const { v4: uuidv4 } = require("uuid");

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

  async create(institutionDTO: CreateInstitucionDTO): Promise<Institucion> {
    const existe =
      (await Institucion.findOne({
        where: { nombre: institutionDTO.nombre },
      })) !== null;
    if (existe) {
      throw new Error("Ya existe una institucion con el nombre elegido.");
    }
    const int1 = uuidv4();
    const institucion: Institucion = await Institucion.create({
      id: int1,
      nombre: institutionDTO.nombre,
    });
    await Promise.all(
      institutionDTO.referentes.map((referente) =>
        ContactoInstitucion.create({
          nombre: referente.nombre,
          contacto: referente.contacto,
          institucionId: institucion.id,
        })
      )
    );
    return institucion;
  }
}
