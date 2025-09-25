import { initDatabase } from "@/lib/init-database";
import jwt from "jsonwebtoken";
import { Hashing } from "@/lib/crypto/hash";
import { UserService } from "../../users/service/user.service";
const JWT_SECRET = process.env.JWT_SECRET!;

export enum UserType {
  Colaborador = "Colaborador",
  Administrador = "Administrador",
}

export interface LoginRequest {
  ci: string;
  password: string;
}

export interface PayloadForRefresh extends jwt.JwtPayload {
  ci: string;
  name: string;
  type: string;
}

export class AuthService {
  constructor(private readonly userService: UserService = new UserService()) {}

  async login(ci: string, password: string) {
    await initDatabase();

    //Verify user credentials
    const user = await this.userService.findOneForAuth(ci);
    if (
      user === undefined ||
      user === null ||
      !(await Hashing.verifyPassword(password, user.password))
    ) {
      return { error: "Credenciales invalidas", status: 401 };
    }
    const userCI = user.ci;
    const userName = user.nombre;
    const userType = user.esAdmin
      ? UserType.Administrador
      : UserType.Colaborador;

    //Create the access token
    const accessToken = jwt.sign(
      { ci: userCI, name: userName, type: userType },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    //Create the new refresh token
    const refreshToken = jwt.sign(
      { ci: userCI, name: userName, type: userType },
      JWT_SECRET,
      { expiresIn: "180d" }
    );

    //Return the access token and the refresh token
    return { accessToken, refreshToken, status: 200 };
  }

  refresh(refreshToken: string) {
    const payload = jwt.verify(refreshToken, JWT_SECRET) as PayloadForRefresh;

    //Generate a new access token
    const accessToken = jwt.sign(
      {
        ci: payload.ci,
        name: payload.name,
        type: payload.type,
      },
      JWT_SECRET,
      { expiresIn: "15m" }
    );
    //Return the new access token
    return { accessToken, status: 200 };
  }
}
