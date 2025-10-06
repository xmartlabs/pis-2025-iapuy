import { initDatabase } from "@/lib/init-database";
import jwt from "jsonwebtoken";
import { Hashing } from "@/lib/crypto/hash";
import { UserService } from "../../users/service/user.service";
const JWT_SECRET = process.env.JWT_SECRET!;

export enum UserType {
  Collaborator = "Colaborador",
  Administrator = "Administrador",
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
    // await initDatabase();

    const user = await this.userService.findOneForAuth(ci);
    if (!user) {
      return { error: "Este usuario no existe", status: 401 };
    }
    if (!(await Hashing.verifyPassword(password, user.password))) {
      return { error: "Credenciales inválidas", status: 402 };
    }
    const userCI = user.ci;
    const userName = user.nombre;
    const userType = user.esAdmin
      ? UserType.Administrator
      : UserType.Collaborator;

    const accessToken = jwt.sign(
      { ci: userCI, name: userName, type: userType },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { ci: userCI, name: userName, type: userType },
      JWT_SECRET,
      { expiresIn: "180d" }
    );

    return { accessToken, refreshToken, status: 200 };
  }

  refresh(refreshToken: string) {
    const payload = jwt.verify(refreshToken, JWT_SECRET) as PayloadForRefresh;

    const accessToken = jwt.sign(
      {
        ci: payload.ci,
        name: payload.name,
        type: payload.type,
      },
      JWT_SECRET,
      { expiresIn: "15m" }
    );
    return { accessToken, status: 200 };
  }
}
