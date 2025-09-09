import { Gasto } from "@/app/models/gastos.entity";
import { Intervencion } from "@/app/models/intervencion.entity";
import { User } from "@/app/models/user.entity";

export class GastoService {
  async findAll(): Promise<Gasto[]> {
    return await Gasto.findAll({
      include: [
        {
          model: User,
        },
        {
          model: Intervencion,
        },
      ],
    });
  }
}
