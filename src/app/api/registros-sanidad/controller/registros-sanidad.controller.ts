import { NextRequest, NextResponse } from "next/server";
import { RegistrosSanidadService } from "../service/registro-sanidad.service";
import { PaginationDto } from "@/lib/pagination/pagination.dto";
import { CreateRegistrosSanidadDTO } from "../dtos/create-registro-sanidad.dto"




export class RegistrosSanidadController {
  constructor(
    private readonly registrosSanidadService: RegistrosSanidadService = new RegistrosSanidadService()
  ) {}

  async getRegistrosSanidad(pagination: PaginationDto) {
    try {
      const users = await this.registrosSanidadService.findAll(pagination);
      return NextResponse.json(users);
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }

  async createEventoSanidad(request: NextRequest) {
        let body : CreateRegistrosSanidadDTO

        const formData = await request.formData();

        if(formData.get("tipoSanidad") as string == 'vacuna') {

            const file = formData.get("carneVacunas") as File
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            body= {
            tipoSanidad : formData.get("tipoSanidad") as string,
            perroId : formData.get("perroId") as string,
            fecha : formData.get("fecha") as string,
            vac : formData.get("vac") as string,
            medicamento : formData.get("medicamento") as string,
            tipoDesparasitacion : formData.get("tipoDesparasitacion") as 'Externa' | 'Interna',
            carneVacunas : buffer as Buffer
            }

        }else{
            const buffer = Buffer.alloc(0)

            body = {
            tipoSanidad : formData.get("tipoSanidad") as string,
            perroId : formData.get("perroId") as string,
            fecha : formData.get("fecha") as string,
            vac : formData.get("vac") as string,
            medicamento : formData.get("medicamento") as string,
            tipoDesparasitacion : formData.get("tipoDesparasitacion") as 'Externa' | 'Interna',
            carneVacunas : buffer as Buffer
            
          }
        }
        
       return await this.registrosSanidadService.create(body);
       
      }
}
