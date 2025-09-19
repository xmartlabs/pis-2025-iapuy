import { Perro } from "@/app/models/perro.entity";
import { User } from "@/app/models/user.entity";
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

  async create(createPerroDto: CreatePerroDTO): Promise<Perro> {
      return await Perro.create({ ...createPerroDto });
    }
}
