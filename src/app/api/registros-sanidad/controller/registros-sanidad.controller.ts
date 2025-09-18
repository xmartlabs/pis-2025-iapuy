import { NextRequest, NextResponse } from "next/server";
import { RegistrosSanidadService } from "../service/registro-sanidad.service";
import { PaginationDto } from "@/lib/pagination/pagination.dto";
import { CreateRegistrosSanidadDTO } from "../dtos/create-registro-sanidad.dto"
import { RegistroSanidad } from '@/app/models/registro-sanidad.entity'



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
      try {
        const body: CreateRegistrosSanidadDTO = await request.json();
        const regSanidad = await this.registrosSanidadService.create(body);
        return NextResponse.json(regSanidad, { status: 201 });
      } catch (error: any) {
        return NextResponse.json(
          { error: "Internal Server Error" },
          { status: 500 }
        );
      }
    }


}
