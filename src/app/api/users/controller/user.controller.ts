import { NextResponse, type NextRequest } from "next/server";
import { UserService } from "../service/user.service";
import type { CreateUserDto } from "../dtos/create-user.dto";
import type { UpdateUserDto } from "../dtos/update-user.dto";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import type { User } from "@/app/models/user.entity";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";

export class UserController {
  constructor(private readonly userService: UserService = new UserService()) {}

  async getUsers(pagination: PaginationDto) {
    const paginationResult: PaginationResultDto<User> =
      await this.userService.findAll(pagination);

    return paginationResult;
  }

  async getUser(request: NextRequest, { username }: { username: string }) {
    try {
      const user = await this.userService.findOne(username);

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json(user);
    } catch {
      return {
        error: "Internal Server Error",
        status: 500 
      }
    }
  }

  async createUser(request: NextRequest) {
    const usrData: CreateUserDto = await request.json() as CreateUserDto;
    if (!usrData.ci || !usrData.password) {
      return {
        error: "Username and password are required",
        status: 400
      }
    }

    const ci = await this.userService.create(usrData);
    return {
      message: `Usuario con ci ${String(ci)} creado con éxito`,
      status: 201
    }
  }

  async updateUser(request: NextRequest, { username }: { username: string }) {
    try {
      const body: UpdateUserDto = await request.json() as UpdateUserDto;
      const user = await this.userService.update(username, body);

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json(user);
    } catch {
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }

  async deleteUser(request: NextRequest, { username }: { username: string }) {
    try {
      const deleted = await this.userService.delete(username);

      if (!deleted) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({ message: "User deleted successfully" });
    } catch{
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
}
