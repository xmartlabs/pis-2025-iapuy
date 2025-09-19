import { NextResponse } from "next/server";
import { AuthController } from "../controller/auth.controller";
const authController = new AuthController();

export async function POST(req: Request) {
  //Se obtiene el refresh token de la cookie guardada si la hay
  const cookieHeader = req.headers.get("cookie") ?? "";
  const refreshToken = cookieHeader
    .split(";")
    .find((c) => c.trim().startsWith("refreshToken="))
    ?.split("=")[1];

  if (!refreshToken) {
    return NextResponse.json(
      { error: "No se encontro un token de refresco en la solicitud." },
      { status: 401 }
    );
  }

  try {
    const data = await authController.refresh(refreshToken);

    if (data.status === 200) {
      return NextResponse.json({ accessToken: data.accessToken });
    }

    return NextResponse.json({ error: data.error }, { status: data.status });
  } catch {
    return NextResponse.json(
      { error: "El refresh token es invalido o ha expirado." },
      { status: 403 }
    );
  }
}
