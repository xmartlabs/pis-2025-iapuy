import {RegistrosSanidadService} from "../service/registro-sanidad.service";
import type {PaginationDto} from "@/lib/pagination/pagination.dto";
import {RegistroSanidad} from "@/app/models/registro-sanidad.entity"


export class RegistrosSanidadController {
    constructor(
        private readonly registrosSanidadService: RegistrosSanidadService = new RegistrosSanidadService()
    ) {
    }

    async getRegistrosSanidad(pagination: PaginationDto) {
        try {
            const attributes = Object.keys(RegistroSanidad.getAttributes());
            const paginationResult = await this.registrosSanidadService.findAll(pagination);

            return (
                {
                    data: paginationResult.data,
                    attributes,
                }
            );
        } catch {
            return ({attributes: [], data: []});
        }
    }
}
