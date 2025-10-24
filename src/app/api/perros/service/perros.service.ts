import { Intervention } from "@/app/models/intervention.entity";
import { Perro } from "@/app/models/perro.entity";
import { RegistroSanidad } from "@/app/models/registro-sanidad.entity";
import { User } from "@/app/models/user.entity";
import { UsrPerro } from "@/app/models/usrperro.entity";
import { Vacuna } from "@/app/models/vacuna.entity";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";
import { Op } from "sequelize";
import { DetallesPerroDto } from "@/app/api/perros/dtos/detalles-perro.dto";
import type { CreatePerroDTO } from "../dtos/create-perro.dto";
import type { PayloadForUser } from "../detalles/route";

export class PerrosService {
  async findAll(
    pagination: PaginationDto,
    payload: PayloadForUser
  ): Promise<PaginationResultDto<Perro>> {
    const baseWhereQuery = pagination.query
      ? { nombre: { [Op.iLike]: `%${pagination.query}%` } }
      : {};

    const includeUsrPerros = {
      model: UsrPerro,
      as: "UsrPerros",
      attributes: ["id"],
      required: payload.type === "Colaborador", // INNER JOIN si es colaborador
      where: payload.type === "Colaborador" ? { userId: payload.ci } : undefined,
      include: [
        {
          attributes: ["id"],
          model: Intervention,
          as: "Intervencion",
          required: true,
        },
      ],
    };

    const count = await Perro.count({
      where: baseWhereQuery,
      include: [includeUsrPerros],
    });

    const result = await Perro.findAll({
      where: baseWhereQuery,
      include: [
        {
          model: User,
          as: "User",
          attributes: ["ci", "nombre"],
        },
        includeUsrPerros,
        {
          model: RegistroSanidad,
          as: "RegistroSanidad",
          attributes: ["id"],
          include: [
            {
              model: Vacuna,
              as: "Vacunas",
              order: [["fecha", "DESC"]],
              attributes: ["fecha"],
            },
          ],
        },
      ],
      limit: pagination.size > 0 ? pagination.size : undefined,
      offset: pagination.size > 0 ? pagination.getOffset() : undefined,
      order: pagination.getOrder(),
      subQuery: false,
    });

    const rowsPlain = result.map((perro) => {
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
      count,
      rows: rowsPlain,
    };

    return getPaginationResultFromModel(pagination, processed);
  }

  async create(createPerroDto: CreatePerroDTO): Promise<Perro> {
    return await Perro.create({ ...createPerroDto });
  }

  async findOne(id: string, payload: PayloadForUser) {
    const perro = await Perro.findByPk(id, {
      include: [
        {
          model: User,
          as: "User",
          attributes: ["ci", "nombre"],
          where:
            payload.type === "Administrador"
              ? undefined
              : {
                  ci: payload.ci,
                },
          required: payload.type !== "Administrador",
        },
      ],
    });

    if (perro === null) {
      return { error: "Perro no encontrado", status: 404 };
    }

    if (!perro.User) {
      return {
        error: "Error en datos del perro: Dueño no encontrado",
        status: 404,
      };
    }

    const dtPerro = new DetallesPerroDto(
      perro.id,
      perro.nombre,
      perro.descripcion,
      perro.fortalezas,
      perro.duenioId,
      perro.User.nombre,
      perro.deletedAt
    );
    return { perro: dtPerro, status: 200 };
  }

  async delete(id: string): Promise<boolean> {
    const total = await Perro.destroy({ where: { id } });
    return total > 0;
  }

  async listOptions(
    userType: string,
    ci: string
  ): Promise<{ id: string; nombre: string }[]> {
    return await Perro.findAll({
      where:
        userType === "Colaborador"
          ? {
              duenioId: ci,
            }
          : undefined,
      attributes: ["id", "nombre"],
    });
  }
}
