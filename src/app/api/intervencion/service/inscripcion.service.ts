import { UsrPerro } from "@/app/models/usrperro.entity";
import { Acompania } from "@/app/models/acompania.entity";
import { User } from "@/app/models/user.entity";
import { Perro } from "@/app/models/perro.entity";
import type { InscripcionDto } from "../dtos/inscripcion.dto";

export class InscripcionService {
  async inscribirse(
    datos: InscripcionDto
  ){
    const user = await User.findOne({ where: { ci: datos.ci } });
    if (!user) throw new Error("Usuario no encontrado");
    const guia = await UsrPerro.findOne({ where: { userId: datos.ci } });
    const acomp = await Acompania.findOne({ where: { userId: datos.ci } });
    if(guia || acomp) throw new Error("La persona ya participa de la intervención");

    if(datos.tipo === "guia"){
        const perro = await Perro.findOne({ where: { id: datos.perro } });
        if (!perro) throw new Error("Perro no encontrado");
        const partPerro = await UsrPerro.findOne({ where: { perroId: datos.perro } });
        if(partPerro) throw new Error("El perro ya participa de la intervención");
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
