import { UsrPerro } from "@/app/models/usrperro.entity";
import { Acompania } from "@/app/models/acompania.entity";
import { User } from "@/app/models/user.entity";
import { Perro } from "@/app/models/perro.entity";
import type { InscripcionDto } from "../dtos/inscription.dto";

export class InscripcionService {
  async inscribirse(
    datos: InscripcionDto
  ){
    const user = await User.findOne({
    where: { ci: datos.ci },
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

    if (!user) throw new Error('Usuario no encontrado');

    const yaGuia = Array.isArray(user.usrPerro) ? user.usrPerro.length > 0 : !!user.usrPerro;
    const yaAcomp = Array.isArray(user.acompania) ? user.acompania.length > 0 : !!user.acompania;

    if (yaGuia || yaAcomp) {
        throw new Error('La persona ya participa de la intervención');
    }
    
    if(datos.tipo === "guia"){
        const perro = await Perro.findOne({
            where: { id: datos.perro,  },
            include: [
                {
                    model: UsrPerro,
                    as: 'usrPerro',
                    required: false,
                    where: { intervencionId: datos.intervencion },
                },
            ],
        });
        if (!perro) throw new Error("Perro no encontrado");
        if(perro.usrPerro && perro.usrPerro.length > 0) throw new Error("El perro ya participa de la intervención");
        try{
            const usrPerro = new UsrPerro({
                userId: datos.ci,
                perroId: datos.perro,
                intervencionId: datos.intervencion
            });

            await usrPerro.save();
        }
        catch (error){
            throw new Error(error instanceof Error ? error.message : "Error creando la dupla usr-perro");
        }
        return {
            message: "Inscripción de guía con perro completada correctamente",
            status: 200
        }
    }
    if(datos.tipo === "acompaniante"){
        try{
            const acompania = new Acompania({
                userId: datos.ci,
                intervencionId: datos.intervencion
            });

            await acompania.save();
        }
        catch (error){
            throw new Error(error instanceof Error ? error.message : "Error creando la inscripción como acompañante");
        }
        return {
            message: "Inscripción de acompañante completada correctamente",
            status: 200
        }
    }
    return {
        error: "Tipo de inscripción inválida",
        status: 400,
    }
  }
}
