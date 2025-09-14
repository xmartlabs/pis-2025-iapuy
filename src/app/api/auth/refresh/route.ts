import { NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET!;

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
    const payload = jwt.verify(refreshToken, JWT_SECRET) as JwtPayload;

    //Se genera un nuevo access token
    const newAccessToken = jwt.sign(
      {
        nombre: payload.nombre,
        tipo: payload.tipo,
      },
      JWT_SECRET,
      { expiresIn: "15m" }
    );
    return NextResponse.json({ accessToken: newAccessToken });
  } catch {
    return NextResponse.json(
      { error: "El refresh token es invalido o ha expirado." },
      { status: 403 }
    );
  }
}
