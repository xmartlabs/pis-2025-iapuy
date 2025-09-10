import { NextResponse } from "next/server";
import { PerrosService } from "../service/perros.service";
import { PaginationDto } from "@/lib/pagination/pagination.dto";

export class PerrosController {
  constructor(
    private readonly perrosService: PerrosService = new PerrosService()
  ) {}
  async getPerros(pagination: PaginationDto) {
    try {
      const users = await this.perrosService.findAll(pagination);
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
