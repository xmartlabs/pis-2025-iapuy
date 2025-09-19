import jwt from "jsonwebtoken";
import { UserService } from "../../users/service/user.service";
import { initDatabase } from "@/lib/init-database";
import { Hashing } from "@/lib/crypto/hash";

const JWT_SECRET = process.env.JWT_SECRET!;

export enum TipoUsuario {
  Colaborador = "Colaborador",
  Administrador = "Administrador",
}

export interface LoginRequest {
  ci: string;
  password: string;
}

export interface PayloadForRefresh extends jwt.JwtPayload {
  ci: string;
  nombre: string;
  tipo: string;
}
export class AuthController {
  constructor(private readonly userService: UserService = new UserService()) {}

  async login({ ci, password }: LoginRequest) {
    try {
      await initDatabase();

      //Se verifican las credenciales del usuario
      const user = await this.userService.findOne(ci);
      if (
        user === undefined ||
        user === null ||
        !(await Hashing.verifyPassword(password, user.password))
      ) {
        return { error: "Credenciales invalidas", status: 401 };
      }
      const ciUsuario = user.ci;
      const nombreUsuario = user.nombre;
      const tipoUsuario = user.esAdmin
        ? TipoUsuario.Administrador
        : TipoUsuario.Colaborador;

      //Se crea el access token
      const accessToken = jwt.sign(
        { ci: ciUsuario, nombre: nombreUsuario, tipo: tipoUsuario },
        JWT_SECRET,
        { expiresIn: "15m" }
      );

      //Se crea el refresh token
      const refreshToken = jwt.sign(
        { ci: ciUsuario, nombre: nombreUsuario, tipo: tipoUsuario },
        JWT_SECRET,
        { expiresIn: "180d" }
      );

      //Se envia el access token y el refresh token
      return { accessToken, refreshToken, status: 200 };
    } catch {
      return { error: "Bad Request", status: 400 };
    }
  }

  async refresh(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, JWT_SECRET) as PayloadForRefresh;

      //Se genera un nuevo access token
      const newAccessToken = jwt.sign(
        {
          ci: payload.ci,
          nombre: payload.nombre,
          tipo: payload.tipo,
        },
        JWT_SECRET,
        { expiresIn: "15m" }
      );
      //Se envia el nuevo access token
      return { accessToken: newAccessToken, status: 200 };
    } catch {
      return {
        error: "El refresh token es invalido o ha expirado.",
        status: 403,
      };
    }
  }
}
