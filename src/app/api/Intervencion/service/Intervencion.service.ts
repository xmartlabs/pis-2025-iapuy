import { Intervencion } from "@/app/models/intervencion.entity";
import { User } from "@/app/models/user.entity";

export class IntervencionService {
  async findAll(): Promise<Intervencion[]> {
    return await Intervencion.findAll({
      include: [
        {
          model: User,
        },
      ],
    });
  }
}
