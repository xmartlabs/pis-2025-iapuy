import { initDatabase } from "@/lib/init-database";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { PerrosController } from "./controller/perros.controller";
import { extractPagination } from "@/lib/pagination/extraction";
import { jwtVerify } from "jose";
const perrosController = new PerrosController();
await initDatabase();

export async function GET(request: NextRequest) {

  //controlo que los colaboradores no accedan al GET
  const token = request.headers.get("authorization")?.split(" ")[1];
  if (!token) {
    return NextResponse.json(
      { error: "No se encontro un token de acceso en la solicitud." },
      { status: 401 }
    );
  }
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  try {
    const { payload } = await jwtVerify(token, secret);
     if (payload.tipo === "Colaborador") {

      return NextResponse.json(
        { error: "No tiene permisos para acceder a esta ruta" },
        { status: 500 }
      );
      
     }
  }catch{
    return NextResponse.json(
      { error: "El token de acceso es invalido o ha expirado." },
      { status: 401 }
    );
  }
  
  try {
    const pagination = await extractPagination(request);

    return NextResponse.json(await perrosController.getPerros(pagination));
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Hubo un error desconocido" },
      { status: 500 },
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
        { status: 200 },
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error: Dog could not be deleted",
      },
      { status: 500 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ?
            error.message :
            "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const dog = await perrosController.createPerro(request);
    return NextResponse.json(dog, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
