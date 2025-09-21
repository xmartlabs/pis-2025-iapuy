import { Intervencion } from "@/app/models/intervencion.entity";
import { Perro } from "@/app/models/perro.entity";
import { RegistroSanidad } from "@/app/models/registro-sanidad.entity";
import { User } from "@/app/models/user.entity";
import { UsrPerro } from "@/app/models/usrperro.entity";
import { Vacuna } from "@/app/models/vacuna.entity";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";
import { Op } from "sequelize";
import type { CreatePerroDTO } from "../dtos/create-perro.dto";

export class PerrosService {
  async findAll(
    pagination: PaginationDto
  ): Promise<PaginationResultDto<Perro>> {
    const result = await Perro.findAndCountAll({
      where: pagination.query
        ? { nombre: { [Op.iLike]: `%${pagination.query}%` } }
        : undefined,
      include: [
        { model: User, attributes: ["ci", "nombre"] },
        {
          model: UsrPerro,
          attributes: ["id"],
          include: [
            {
              attributes: ["id"],
              model: Intervencion,
              where: {},
              required: true,
            },
          ],
        },
        {
          model: RegistroSanidad,
          attributes: ["id"],
          include: [
            {
              model: Vacuna,
              limit: 1,
              order: [["fecha", "DESC"]],
              attributes: ["fecha"],
            },
          ],
        },
      ],
      limit: pagination.size,
      offset: pagination.getOffset(),
      order: pagination.getOrder(),
      subQuery: false,
    });

    const rowsPlain = result.rows.map((perro) => {
      const p = perro.get({ plain: true }) as Perro;

      const usrPerros = p.UsrPerros || [];
      const intervencionCount = usrPerros.length;

      delete p.UsrPerros;

      return {
        ...p,
        intervencionCount,
      };
    }) as unknown as Perro[];

    const processed = {
      count: result.count,
      rows: rowsPlain,
    };

    return getPaginationResultFromModel(pagination, processed);
  }

  async create(createPerroDto: CreatePerroDTO): Promise<Perro> {
      return await Perro.create({ ...createPerroDto });
    }
}
