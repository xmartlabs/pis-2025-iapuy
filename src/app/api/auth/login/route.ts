import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { UserService } from "../../users/service/user.service";
import { initDatabase } from "@/lib/init-database";
const JWT_SECRET = process.env.JWT_SECRET!;

export enum TipoUsuario {
  Colaborador = "Colaborador",
  Administrador = "Administrador",
}

const userService = new UserService();

export async function POST(req: Request) {
  const { ci, password } = await req.json();

  await initDatabase();

  //Se verifican las credenciales del usuario
  const user = await userService.findOne(ci);
  if (user == undefined || user.password != password) {
    return NextResponse.json(
      { error: "Credenciales invalidas" },
      { status: 401 }
    );
  }
  const nombreUsuario = user.nombre;
  const apellidoUsuario = user.apellido;
  const tipoUsuario = user.esAdmin
    ? TipoUsuario.Administrador
    : TipoUsuario.Colaborador;

  //Se crea el access token
  const accessToken = jwt.sign(
    { nombre: nombreUsuario, apellido: apellidoUsuario, tipo: tipoUsuario },
    JWT_SECRET,
    { expiresIn: "15m" }
  );

  //Se crea el refresh token
  const refreshToken = jwt.sign(
    { nombre: nombreUsuario, apellido: apellidoUsuario, tipo: tipoUsuario },
    JWT_SECRET,
    { expiresIn: "180d" }
  );

  //Se envia el access token y se incluye la cookie con el access token en la respuesta
  const res = NextResponse.json({ accessToken });
  res.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    path: "/api/auth/refresh",
    maxAge: 60 * 60 * 24 * 180,
  });
  return res;
}
