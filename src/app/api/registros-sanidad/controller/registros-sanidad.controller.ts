import type { NextRequest } from "next/server";
import { RegistrosSanidadService } from "../service/registro-sanidad.service";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import type { CreateRegistrosSanidadDTO } from "../dtos/create-registro-sanidad.dto";
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
    // esto es por el Eslint nunca se va a mandar esto
    const buff = Buffer.alloc(0);
    let body: CreateRegistrosSanidadDTO = {
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
      // get the file if present; if not, fall back to empty buffer
      const maybeFile = formData.get("carneVacunas");
      let buffer = Buffer.alloc(0);
      try {
        if (maybeFile instanceof File) {
          const arrayBuffer = await maybeFile.arrayBuffer();
          buffer = Buffer.from(arrayBuffer);
        }
      } catch {
        // on any failure reading the file, keep empty buffer to avoid throwing
        buffer = Buffer.alloc(0);
      }

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

  async findOne(id: string) {
    return await this.registrosSanidadService.findOne(id);
  }

  async updateEventoSanidad(request: NextRequest) {
    // Support JSON or multipart/form-data for updates.
    const contentType = request.headers.get("content-type") || "";

    let tipoSanidad: "banio" | "desparasitacion" | "vacuna" | undefined =
      undefined;
    let eventoId: string | undefined = undefined;
    const data: {
      fecha?: string | Date;
      medicamento?: string;
      tipoDesparasitacion?: string;
      vac?: string;
      carneVacunas?: Buffer | ArrayBuffer | null;
    } = {};

    let perroIdStr: string | undefined = undefined;
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const ts = formData.get("tipoSanidad");
      if (typeof ts === "string")
        tipoSanidad = ts as "banio" | "desparasitacion" | "vacuna";
      const eid = formData.get("eventoId");
      if (typeof eid === "string") eventoId = eid;
      const fecha = formData.get("fecha");
      if (fecha) data.fecha = fecha as string;
      const perroId = formData.get("perroId");
      if (typeof perroId === "string") perroIdStr = perroId;
      const medicamento = formData.get("medicamento");
      if (medicamento) data.medicamento = medicamento as string;
      const tipoDes = formData.get("tipoDesparasitacion");
      if (tipoDes) data.tipoDesparasitacion = tipoDes as string;
      const vac = formData.get("vac");
      if (vac) data.vac = vac as string;

      const maybeFile = formData.get("carneVacunas");
      if (maybeFile instanceof File) {
        try {
          const ab = await maybeFile.arrayBuffer();
          data.carneVacunas = Buffer.from(ab);
        } catch {
          data.carneVacunas = null;
        }
      }
    } else {
      // assume JSON
      const body = (await request.json()) as Record<string, unknown>;
      if (typeof body.tipoSanidad === "string")
        tipoSanidad = body.tipoSanidad as
          | "banio"
          | "desparasitacion"
          | "vacuna";
      if (typeof body.eventoId === "string") eventoId = body.eventoId;
      if (typeof body.fecha === "string") data.fecha = body.fecha;
      if (typeof body.medicamento === "string")
        data.medicamento = body.medicamento;
      if (typeof body.tipoDesparasitacion === "string")
        data.tipoDesparasitacion = body.tipoDesparasitacion;
      if (typeof body.vac === "string") data.vac = body.vac;
      if (typeof body.perroId === "string") perroIdStr = body.perroId;

      // carneVacunas may be provided as base64 string
      if (typeof body.carneVacunas === "string") {
        try {
          data.carneVacunas = Buffer.from(body.carneVacunas, "base64");
        } catch {
          // ignore invalid base64 and leave undefined
        }
      }
    }

    if (!tipoSanidad) throw new Error("tipoSanidad is required");
    if (!eventoId) throw new Error("eventoId is required");

    // Delegate to service
    const updated = await this.registrosSanidadService.updateEventoSanidad(
      tipoSanidad,
      eventoId,
      data,
      { perroId: perroIdStr }
    );
    if (!updated) throw new Error("Evento de sanidad no encontrado");
    return updated;
  }
}
