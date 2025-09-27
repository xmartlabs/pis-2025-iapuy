import { Intervention } from "@/app/models/intervention.entity";
import { User } from "@/app/models/user.entity";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";
import type { CreateInterventionDto } from "../dtos/create-intervention.dto";

export class InterventionService {
  async findAll(
    pagination: PaginationDto
  ): Promise<PaginationResultDto<Intervention>> {
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

  async create(request: CreateInterventionDto): Promise<Intervention> {
    return await Intervention.create({
      ...request,
    });
  }
}
