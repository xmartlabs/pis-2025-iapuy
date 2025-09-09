import { NextResponse } from "next/server";
import { PerrosService } from "../service/perros.service";

export class PerrosController {
  constructor(
    private readonly perrosService: PerrosService = new PerrosService()
  ) {}
  async getPerros() {
    try {
      const users = await this.perrosService.findAll();
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
