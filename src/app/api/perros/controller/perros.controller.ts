import { NextResponse , NextRequest } from "next/server";
import { PerrosService } from "../service/perros.service";
import { PaginationDto } from "@/lib/pagination/pagination.dto";
import { CreatePerroDTO } from "../dtos/create-perro.dto";


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

  async createPerro(request: NextRequest) {
      try {
        console.log(request)
        console.log("hola crear perro")
        const body : CreatePerroDTO= await request.json();
        console.log(body)
        console.log("pasoelbody")
        const dog = await this.perrosService.create(body);
        return NextResponse.json(dog, { status: 201 });
      } catch (error: any) {
        return NextResponse.json(
          { error: "Internal Server Error" },
          { status: 500 }
        );
      }
    }
}
