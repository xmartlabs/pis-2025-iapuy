import { Banio } from "@/app/models/banio.entity";
import { Desparasitacion } from "@/app/models/desparasitacion.entity";
import { Perro } from "@/app/models/perro.entity";
import { RegistroSanidad } from "@/app/models/registro-sanidad.entity";
import { User } from "@/app/models/user.entity";
import { Vacuna } from "@/app/models/vacuna.entity";
import { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import { PaginationDto } from "@/lib/pagination/pagination.dto";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";
import { CreateRegistrosSanidadDTO } from "../dtos/create-registro-sanidad.dto";
import sequelize from "@/lib/database";

export class RegistrosSanidadService {
  async findAll(
    pagination: PaginationDto
  ): Promise<PaginationResultDto<RegistroSanidad>> {
    const result = await RegistroSanidad.findAndCountAll({
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
      limit: pagination.size,
      offset: pagination.getOffset(),
      order: pagination.getOrder(),
    });

    return getPaginationResultFromModel(pagination, result);
  }

  async create(createRegistroSanidadDto: CreateRegistrosSanidadDTO): Promise<RegistroSanidad> {
  return await sequelize.transaction(async (t) => {
    const regSanidad = await RegistroSanidad.create(
      { perroId: createRegistroSanidadDto.perroId },
      { transaction: t }
    );

    const fechaDate = new Date(createRegistroSanidadDto.fecha);

    if (createRegistroSanidadDto.tipoSanidad === 'banio') {
      await Banio.create({
        fecha: fechaDate,
        registroSanidadId: regSanidad.id
      }, { transaction: t });

    } else if (createRegistroSanidadDto.tipoSanidad === 'desparasitacion') {
      await Desparasitacion.create({
        fecha: fechaDate,
        medicamento: createRegistroSanidadDto.medicamento,
        registroSanidadId: regSanidad.id,
        tipoDesparasitacion : createRegistroSanidadDto.tipoDesparasitacion
      }, { transaction: t });

    } else {
      await Vacuna.create({

        fecha: fechaDate,
        vac: createRegistroSanidadDto.vac,
        registroSanidadId: regSanidad.id,
        carneVacunas: createRegistroSanidadDto.carneVacunas
      }, { transaction: t });
    }
    return regSanidad;
  });
}



}
