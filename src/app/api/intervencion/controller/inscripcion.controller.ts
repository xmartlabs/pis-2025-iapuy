import type { NextRequest} from "next/server";
import { InscripcionService } from "../service/inscripcion.service";
import type { InscripcionDto } from "../dtos/inscripcion.dto"

export class InscripcionController {
  constructor(
    private readonly inscripcionService: InscripcionService = new InscripcionService()
  ) {}
  async postInscripcion(request: NextRequest) {
    try {
        const req : InscripcionDto = await request.json() as InscripcionDto;

        if(!req.tipo) throw new Error("Tipo de inscripción requerida (opciones válidas; 'guia' o 'acompaniante'");
        if(!req.ci) throw new Error("Cédula del colaborador requerida");
        if(!req.intervencion) throw new Error("Id de intervención requerida");
        if(req.tipo === "guia" && !req.perro) throw new Error("Para inscribirse como guía se requiere perro");

        return await this.inscripcionService.inscribirse(req);
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Internal Server Error");
    }
  }
}
