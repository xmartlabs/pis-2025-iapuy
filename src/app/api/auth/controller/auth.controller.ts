import { AuthService, type LoginRequest } from "../service/auth.service";
import { type NextRequest } from "next/server";

export class AuthController {
  constructor(private readonly authService: AuthService = new AuthService()) {}

  async login(req: NextRequest) {
    const { ci, password }: LoginRequest = (await req.json()) as LoginRequest;
    return this.authService.login(ci, password);
  }

  refresh(req: NextRequest) {
    //Se obtiene el refresh token de la cookie guardada si la hay
    const cookieHeader = req.headers.get("cookie") ?? "";
    const refreshToken = cookieHeader
      .split(";")
      .find((c) => c.trim().startsWith("refreshToken="))
      ?.split("=")[1];

    if (!refreshToken) {
      return {
        error: "No se encontro un token de refresco en la solicitud.",
        status: 401,
        accessToken: "",
      };
    }
    return this.authService.refresh(refreshToken);
  }
}
