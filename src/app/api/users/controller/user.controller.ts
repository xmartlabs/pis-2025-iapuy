import { type NextRequest } from "next/server";
import { UserService } from "../service/user.service";
import type { CreateUserDto } from "../dtos/create-user.dto";
import type { UpdateUserDto } from "../dtos/update-user.dto";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import type { User } from "@/app/models/user.entity";
//import type {Perro} from "@/app/models/perro.entity"
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";

export class UserController {
  constructor(private readonly userService: UserService = new UserService()) {}

  async getUsers(pagination: PaginationDto) {
    const paginationResult: PaginationResultDto<User> =
      await this.userService.findAll(pagination);

    return paginationResult;
  }

  async getUser(request: NextRequest, { ci }: { ci: string }) {
    const user = await this.userService.findOne(ci);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    return user;
  }

  async getUserWithToken(req: NextRequest) {
    const authHeader = req.headers.get("authorization") ?? "";
    const accessToken = authHeader.split(" ")[1];

    if (!accessToken) {
      throw new Error("No se encontro un token de acceso en la solicitud.");
    }

    const user = await this.userService.findOneWithToken(accessToken);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    return user;
  }

  async createUser(request: NextRequest) {
    const usrData: CreateUserDto = (await request.json()) as CreateUserDto;
    if (!usrData.ci) {
      return {
        error: "Username is required",
        status: 400,
      };
    }

    const ci = await this.userService.create(usrData);
    return {
      message: `Usuario con ci ${String(ci)} creado con éxito`,
      status: 201,
    };
  }

  async updateUser(request: NextRequest, { username }: { username: string }) {
    const body: UpdateUserDto = (await request.json()) as UpdateUserDto;
    const user = await this.userService.update(username, body);

    if (!user) {
      return { error: "User not found", status: 404 };
    }

    return user;
  }

  async deleteUser(ci: string): Promise<boolean> {
    return await this.userService.delete(ci);
  }
  async getUserDogs(ci: string) {
    const dogs = await this.userService.findDogIdsByUser(ci);

    return dogs;
  }
}
