import { Gasto } from "@/app/models/gastos.entity";
import { Intervention } from "@/app/models/intervention.entity";
import { User } from "@/app/models/user.entity";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
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
          as: "User",
        },
        {
          model: Intervention,
        },
      ],
      limit: pagination.size,
      offset: pagination.getOffset(),
      order: pagination.getOrder(),
    });

    return getPaginationResultFromModel(pagination, result);
  }

  async update(id: string, data: Partial<Gasto>): Promise<Gasto | null> {
    const gasto = await Gasto.findByPk(id);
    if (!gasto) return null;
    const toUpdate: Partial<Gasto> = { ...data };
    if (toUpdate.monto && typeof toUpdate.monto === "string") {
      const parsed = Number(toUpdate.monto as unknown as string);
      if (!Number.isNaN(parsed)) {
        (toUpdate as unknown as Record<string, unknown>).monto = parsed;
      }
    }

    const updated = await gasto.update(toUpdate as unknown as Partial<Gasto>);
    return updated;
  }
}
