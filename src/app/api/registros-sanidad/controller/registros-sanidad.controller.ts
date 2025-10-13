import type { NextRequest } from "next/server";
import { RegistrosSanidadService } from "../service/registro-sanidad.service";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import type { CreateHealthRecordDTO } from "../dtos/create-registro-sanidad.dto";
import type { PayloadForUser } from "../../perros/detalles/route";

export class RegistrosSanidadController {
  constructor(
    private readonly registrosSanidadService: RegistrosSanidadService = new RegistrosSanidadService()
  ) {}

  async getRegistrosSanidad(
    pagination: PaginationDto,
    id: string,
    payload: PayloadForUser
  ) {
    return await this.registrosSanidadService.findAll(pagination, id, payload);
  }

  async createEventoSanidad(request: NextRequest) {
    // this is for Eslint, we will never send this
    const buff = Buffer.alloc(0);
    let body: CreateHealthRecordDTO = {
      tipoSanidad: "",
      perroId: "",
      fecha: "",
      vac: "",
      carneVacunas: buff,
      medicamento: "",
      tipoDesparasitacion: "Externa",
    };
    const formData = await request.formData();

    if ((formData.get("tipoSanidad") as string) === "vacuna") {
      const file = formData.get("carneVacunas") as File;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      body = {
        tipoSanidad: formData.get("tipoSanidad") as string,
        perroId: formData.get("perroId") as string,
        fecha: formData.get("fecha") as string,
        vac: formData.get("vac") as string,
        medicamento: formData.get("medicamento") as string,
        tipoDesparasitacion: formData.get("tipoDesparasitacion") as
          | "Externa"
          | "Interna",
        carneVacunas: buffer as Buffer,
      };
    } else {
      const buffer = Buffer.alloc(0);
      body = {
        tipoSanidad: formData.get("tipoSanidad") as string,
        perroId: formData.get("perroId") as string,
        fecha: formData.get("fecha") as string,
        vac: formData.get("vac") as string,
        medicamento: formData.get("medicamento") as string,
        tipoDesparasitacion: formData.get("tipoDesparasitacion") as
          | "Externa"
          | "Interna",
        carneVacunas: buffer as Buffer,
      };
    }

    const ret = await this.registrosSanidadService.create(body);
    return ret;
  }
}
