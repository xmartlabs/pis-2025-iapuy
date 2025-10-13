
import { GastoService } from "../service/gasto.service";
import { type PaginationDto } from "@/lib/pagination/pagination.dto";
import { type PayloadForUser } from "../../users/service/user.service";

export class GastosController {
  constructor(
    private readonly gastosService: GastoService = new GastoService()
  ) {}
  async getExpenses(
      pagination: PaginationDto,
      payload: PayloadForUser,
      months: string | null,
      statuses: string | null,
      people: string | null
    ) {
      return await this.gastosService.findAll(
        pagination,
        payload,
        months,
        statuses,
        people
      );
    }
}
