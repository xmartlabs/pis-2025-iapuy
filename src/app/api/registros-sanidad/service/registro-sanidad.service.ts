import { Banio } from "@/app/models/banio.entity";
import { Desparasitacion } from "@/app/models/desparasitacion.entity";
import { Perro } from "@/app/models/perro.entity";
import { RegistroSanidad } from "@/app/models/registro-sanidad.entity";
import { User } from "@/app/models/user.entity";
import { Vacuna } from "@/app/models/vacuna.entity";

export class RegistrosSanidadService {
  async findAll(): Promise<RegistroSanidad[]> {
    return await RegistroSanidad.findAll({
      include: [
        {
          model: Perro,
          include: [
            {
              model: User,
            },
          ],
        },
        {
          model: Banio,
        },
        {
          model: Vacuna,
        },
        {
          model: Desparasitacion,
        },
      ],
    });
  }
}
