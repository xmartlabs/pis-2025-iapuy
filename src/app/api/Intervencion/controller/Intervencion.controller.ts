import { NextResponse } from "next/server";
import { IntervencionService } from "../service/Intervencion.service";

export class IntervencionController {
  constructor(
    private readonly intervencionService: IntervencionService = new IntervencionService()
  ) {}
  async getIntervenciones() {
    try {
      const users = await this.intervencionService.findAll();
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
