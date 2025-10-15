import { UsrPerro } from "@/app/models/usrperro.entity";
import { Acompania } from "@/app/models/acompania.entity";
import { User } from "@/app/models/user.entity";
import { Perro } from "@/app/models/perro.entity";
import type { InscripcionDto } from "../dtos/inscription.dto";
import { Intervention } from "@/app/models/intervention.entity";
import sequelize from "@/lib/database";

export class InscripcionService {
  async inscribirse(
    datos: InscripcionDto
  ){
    const intervention = await Intervention.findOne({
        where: { id: datos.intervention },
        include: [
            {
                model: UsrPerro,
                as: 'usrPerro',
                required: false,
            },
            {
                model: Acompania,
                as: 'acompania',
                required: false,
            },
        ],
    });
    if(!intervention) throw new Error('Intervención no encontrada');
    const transaction = await sequelize.transaction();

    try{
        await Promise.all(
            datos.duplas?.map(async (dupla) => {
                const usr = await User.findOne({
                    where: { ci: dupla.ci },
                });
                if(!usr) throw new Error("Usuario no encontrado");
                const perro = await Perro.findOne({
                    where: { id: dupla.perro },
                });
                if(!perro) throw new Error("Perro no encontrado");
                const uG = intervention.usrPerro?.some(
                    (u: UsrPerro) => u.userId === dupla.ci
                ) ?? false;
                const uA = intervention.acompania?.some(
                    (u: Acompania) => u.userId === dupla.ci
                ) ?? false;
                if(uA || uG) throw new Error("El usuario ya participa de la intervención");
                const pG = intervention.usrPerro?.some(
                    (u: UsrPerro) => u.perroId === dupla.perro
                ) ?? false;
                if(pG) throw new Error("El perro ya participa de la intervención");

                await UsrPerro.create(
                    { intervencionId: datos.intervention, perroId: dupla.perro, userId: dupla.ci },
                    { transaction }
                );
            })
        );
        await Promise.all(
            datos.acompaniantes?.map(async (usrCi) => {
                const usr = await User.findOne({
                    where: { ci: usrCi },
                });
                if(!usr) throw new Error("Usuario no encontrado");
                const uA = intervention.acompania?.some(
                    (u: Acompania) => u.userId === usrCi
                ) ?? false;
                const uG = intervention.usrPerro?.some(
                    (u: UsrPerro) => u.userId === usrCi
                ) ?? false;
                if(uA || uG) throw new Error("El usuario ya participa de la intervención");

                await Acompania.create(
                    { userId: usrCi, interventionId: datos.intervention },
                    { transaction }
                );
            })
        );

        await transaction.commit();

        return {
            message: "Inscripciones realizadas con éxito.",
            status: 200
        }
    }
    catch(error){
        await transaction.rollback();
        throw error;
    }
  }
}