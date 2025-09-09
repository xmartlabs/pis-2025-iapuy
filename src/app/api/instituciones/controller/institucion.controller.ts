import { NextResponse } from "next/server";
import { InstitucionesService } from "../service/perros.service";

export class InstitucionesController {
  constructor(
    private readonly institucionesService: InstitucionesService = new InstitucionesService()
  ) {}
  async getInstituciones() {
    try {
      const users = await this.institucionesService.findAll();
      return NextResponse.json(users);
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
}
