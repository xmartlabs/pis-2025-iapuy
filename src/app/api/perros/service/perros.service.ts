import {Intervencion} from "@/app/models/intervencion.entity";
import {Perro} from "@/app/models/perro.entity";
import {RegistroSanidad} from "@/app/models/registro-sanidad.entity";
import {User} from "@/app/models/user.entity";
import {UsrPerro} from "@/app/models/usrperro.entity";
import {Vacuna} from "@/app/models/vacuna.entity";
import {initDatabase} from "@/lib/init-database";
import type {PaginationResultDto} from "@/lib/pagination/pagination-result.dto";
import type {PaginationDto} from "@/lib/pagination/pagination.dto";
import {getPaginationResultFromModel} from "@/lib/pagination/transform";
import {Op} from "sequelize";
import {DetallesPerroDto} from "@/app/api/perros/dtos/detalles-perro.dto";

export class PerrosService {
  async findAll(
    pagination: PaginationDto
  ): Promise<PaginationResultDto<Perro>> {
    const result = await Perro.findAndCountAll({
      where: pagination.query
        ? { nombre: { [Op.iLike]: `%${pagination.query}%` } }
        : undefined,
      include: [
        { model: User },
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

  async findOne(id: string) {
    await initDatabase();
    const perro = await Perro.findByPk(id, {
      include: [{ model: User, attributes: ["ci", "nombre"] }],
    });
    if (perro === null) {
      return null;
    }
    const duenio = await User.findByPk(perro.duenioId);
    if (!duenio) {
      return null;
    }
      return new DetallesPerroDto(perro.id, perro.nombre, perro.descripcion, perro.fortalezas, perro.duenioId, duenio.ci, duenio.nombre, perro.deletedAt);
  }

  async delete(id: string): Promise<boolean> {
    const total = await Perro.destroy({ where: { id } });
    return total > 0;
  }
}
