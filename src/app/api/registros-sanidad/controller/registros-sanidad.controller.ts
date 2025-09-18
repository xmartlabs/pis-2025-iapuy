import {RegistrosSanidadService} from "../service/registro-sanidad.service";
import type {PaginationDto} from "@/lib/pagination/pagination.dto";

export class RegistrosSanidadController {
  constructor(
    private readonly registrosSanidadService: RegistrosSanidadService = new RegistrosSanidadService(),
  ) {}

  async getRegistrosSanidad(pagination: PaginationDto, id: string ) {
    try {
        return await this.registrosSanidadService.findAll(
          pagination,
          id,
      );
    } catch (error) {
      return { listadoRegistros: [], error };
    }
  }
}
