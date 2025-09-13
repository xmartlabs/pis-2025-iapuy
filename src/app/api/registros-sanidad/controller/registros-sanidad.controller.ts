import { RegistrosSanidadService } from "../service/registro-sanidad.service";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import type { Vacuna } from "@/app/models/vacuna.entity";
import type { Banio } from "@/app/models/banio.entity";
import type { Desparasitacion } from "@/app/models/desparasitacion.entity";
import type { RegistroSanidad } from "@/app/models/registro-sanidad.entity";

type RegistroSanidadWithRelations = RegistroSanidad & {
  Vacunas?: Vacuna[];
  Banios?: Banio[];
  Desparasitaciones?: Desparasitacion[];
};

export class RegistrosSanidadController {
  constructor(
    private readonly registrosSanidadService: RegistrosSanidadService = new RegistrosSanidadService(),
  ) {}

  async getRegistrosSanidad(pagination: PaginationDto & { id: string }) {
    try {
      //const attributes = Object.keys(RegistroSanidad.getAttributes());
      const attributes: string[] = ["Fecha", "Actividad"];
      const { id, ...paginationParams } = pagination;
      const pag = paginationParams as PaginationDto;
      const paginationResult = await this.registrosSanidadService.findAll(
        pag,
        id,
      );
      const registroSanidad: RegistroSanidadWithRelations =
        paginationResult.data[0];
      const listadoRegistros: { Fecha: string; Actividad: string }[] = [];

      if (registroSanidad.Vacunas) {
        registroSanidad.Vacunas.forEach((vacuna: Vacuna) => {
          listadoRegistros.push({
            Fecha: vacuna.fecha.toLocaleDateString("es-ES"),
            Actividad: "Vacunación",
          });
        });
      }
      if (registroSanidad.Banios) {
        registroSanidad.Banios.forEach((banio: Banio) => {
          listadoRegistros.push({
            Fecha: banio.fecha.toLocaleDateString("es-ES"),
            Actividad: "Baño",
          });
        });
      }
      if (registroSanidad.Desparasitaciones) {
        registroSanidad.Desparasitaciones.forEach((desp: Desparasitacion) => {
          listadoRegistros.push({
            Fecha: desp.fecha.toLocaleDateString("es-ES"),
            Actividad: "Desparasitación",
          });
        });
      }

      return {
        attributes,
        listadoRegistros,
      };
    } catch (error) {
      return { attributes: [], registro: [], error };
    }
  }
}
