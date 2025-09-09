import { Institucion } from "@/app/models/institucion.entity";
import { Patologia } from "@/app/models/patologia.entity";

export class InstitucionesService {
  async findAll(): Promise<Institucion[]> {
    return await Institucion.findAll({
      include: [
        {
          model: Patologia,
        },
      ],
    });
  }
}
