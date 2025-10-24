import { initDatabase } from "@/lib/init-database";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { PerrosController } from "./controller/perros.controller";
import { extractPagination } from "@/lib/pagination/extraction";
import type { PayloadForUser } from "../perros/detalles/route";
import jwt from "jsonwebtoken";
const perrosController = new PerrosController();
await initDatabase();

export async function GET(request: NextRequest) { 
  try {
    const authHeader = request.headers.get("authorization") ?? "";
    const accessToken = authHeader.split(" ")[1];

    if (!accessToken) {
      throw new Error("No se encontro un token de acceso en la solicitud.");
    }
    const payload = jwt.decode(accessToken) as PayloadForUser;
    const pagination = await extractPagination(request);

    return NextResponse.json(await perrosController.getPerros(pagination,payload));
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Hubo un error desconocido" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id: string = request.nextUrl.searchParams.get("id") ?? "";
    const res: boolean = await perrosController.deletePerro(id);
    if (res) {
      return NextResponse.json(
        { success: true, message: "Dog deleted successfully" },
        { status: 200 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error: Dog could not be deleted",
      },
      { status: 500 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const dog = await perrosController.createPerro(request);
    return NextResponse.json(dog, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
