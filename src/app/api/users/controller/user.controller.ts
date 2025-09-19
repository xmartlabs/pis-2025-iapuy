import { NextRequest, NextResponse } from "next/server";
import { UserService } from "../service/user.service";
import { CreateUserDto } from "../dtos/create-user.dto";
import { UpdateUserDto } from "../dtos/update-user.dto";
import { PaginationDto } from "@/lib/pagination/pagination.dto";

export class UserController {
  constructor(private readonly userService: UserService = new UserService()) {}

  async getUsers(pagination: PaginationDto) {
    try {
      const users = await this.userService.findAll(pagination);
      return NextResponse.json(users);
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }

  async getUser(request: NextRequest, { ci }: { ci: string }) {
    const user = await this.userService.findOne(ci);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    return user;
  }

  async createUser(request: NextRequest) {
    try {
      const body: CreateUserDto = await request.json();

      if (!body.ci || !body.password) {
        return NextResponse.json(
          { error: "Username and password are required" },
          { status: 400 }
        );
      }

      const user = await this.userService.create(body);
      return NextResponse.json(user, { status: 201 });
    } catch (error: any) {
      if (error.name === "SequelizeUniqueConstraintError") {
        return NextResponse.json(
          { error: "Username already exists" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }

  async updateUser(request: NextRequest, { username }: { username: string }) {
    try {
      const body: UpdateUserDto = await request.json();
      const user = await this.userService.update(username, body);

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json(user);
    } catch (error) {
      console.error(error);
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
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
}
