import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { PerrosController } from "../controller/perros.controller";
import { initDatabase } from "@/lib/init-database";
import jwt from "jsonwebtoken";

const perrosController = new PerrosController();
export interface PayloadForUser extends jwt.JwtPayload {
  ci: string;
  name: string;
  type: string;
}

export async function GET(request: NextRequest) {
  try {
    const id: string = request.nextUrl.searchParams.get("id") ?? "";
    
    if (!id) {
      return NextResponse.json(
        { perro: null, error: "ID is required" },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get("authorization") ?? "";
    const accessToken = authHeader.split(" ")[1];

    if (!accessToken) {
      throw new Error("No se encontro un token de acceso en la solicitud.");
    }

    const payload = jwt.decode(accessToken) as PayloadForUser;

    await initDatabase();

    const data = await perrosController.getPerro(id, payload);
    if (data.status === 200) {
      return NextResponse.json(
        { perro: data.perro, error: null },
        { status: 200 }
      );
    }
    return NextResponse.json(
      { perro: null, error: data.error },
      { status: data.status }
    );
  } catch {
    return NextResponse.json(
      { perro: null, error: "Internal error" },
      { status: 500 }
    );
  }
}
