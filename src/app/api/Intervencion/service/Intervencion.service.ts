/* eslint-disable check-file/folder-naming-convention */
/* eslint-disable check-file/filename-naming-convention */
import { Intervencion } from "@/app/models/intervencion.entity";
import { User } from "@/app/models/user.entity";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";

export class IntervencionService {
  async findAll(
    pagination: PaginationDto
  ): Promise<PaginationResultDto<Intervencion>> {
    const result = await Intervencion.findAndCountAll({
      include: [
        {
          model: User,
          as: "Users",
        },
      ],
      limit: pagination.size,
      offset: pagination.getOffset(),
      order: pagination.getOrder(),
    });

    return getPaginationResultFromModel(pagination, result);
  }
}
