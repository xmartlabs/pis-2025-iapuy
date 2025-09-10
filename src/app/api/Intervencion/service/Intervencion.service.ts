import { Intervencion } from "@/app/models/intervencion.entity";
import { User } from "@/app/models/user.entity";
import { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import { PaginationDto } from "@/lib/pagination/pagination.dto";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";

export class IntervencionService {
  async findAll(
    pagination: PaginationDto
  ): Promise<PaginationResultDto<Intervencion>> {
    const result = await Intervencion.findAndCountAll({
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
}
