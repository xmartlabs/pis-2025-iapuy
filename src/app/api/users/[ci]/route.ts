/* eslint-disable check-file/folder-naming-convention */
import { NextResponse, type NextRequest } from "next/server";
import { UserController } from "../controller/user.controller";
import { initDatabase } from "@/lib/init-database";
const userController = new UserController();

await initDatabase();

export async function GET(
  request: NextRequest,
  { params }: { params: { ci: string } }
) {
  try {
    const data = await userController.getUser(request, { ci: params.ci });
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error && error.message === "Usuario no encontrado") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return userController.createUser(request);
}
