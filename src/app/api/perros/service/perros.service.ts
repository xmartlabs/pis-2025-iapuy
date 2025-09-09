import { Perro } from "@/app/models/perro.entity";
import { User } from "@/app/models/user.entity";

export class PerrosService {
  async findAll(): Promise<Perro[]> {
    return await Perro.findAll({
      include: [
        {
          model: User,
        },
      ],
    });
  }
}
