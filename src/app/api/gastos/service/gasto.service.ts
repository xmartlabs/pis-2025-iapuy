import { Gasto } from "@/app/models/gastos.entity";
import { Intervencion } from "@/app/models/intervention.entity";
import { User } from "@/app/models/user.entity";
import { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import { PaginationDto } from "@/lib/pagination/pagination.dto";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";
import { Op } from "sequelize";

export class GastoService {
  async findAll(
    pagination: PaginationDto
  ): Promise<PaginationResultDto<Gasto>> {
    const result = await Gasto.findAndCountAll({
      where: pagination.query
        ? { concepto: { [Op.iLike]: `%${pagination.query}%` } }
        : undefined,
      include: [
        {
          model: User,
        },
        {
          model: Intervencion,
        },
      ],
      limit: pagination.size,
      offset: pagination.getOffset(),
      order: pagination.getOrder(),
    });

    return getPaginationResultFromModel(pagination, result);
  }
}
