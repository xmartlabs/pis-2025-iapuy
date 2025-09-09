import { NextRequest, NextResponse } from "next/server";
import { UserService } from "../service/user.service";
import { CreateUserDto } from "../dtos/create-user.dto";
import { UpdateUserDto } from "../dtos/update-user.dto";
import { PaginationDto } from "@/lib/pagination/pagination.dto";
import { jwtVerify } from "jose";

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

  async getUser(request: NextRequest, { username }: { username: string }) {
    try {
      const user = await this.userService.findOne(username);

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

  async createUser(request: NextRequest) {
    try {
      /*const authHdr = request.headers.get("authorization");

      if(!authHdr || !authHdr.startsWith("Bearer ")){
        return NextResponse.json(
          { error: "No hay autorización" },
          { status: 401 }
        );
      }

      const tkn = authHdr.slice("Bearer ".length);
      try{
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload, protectedHeader } = await jwtVerify(tkn, secret,{});
      } catch (e: any){
          const msg =
            e.code === "ERR_JWT_EXPIRED" ? "Su sesión expiró" :
            e.code === "ERR_JWT_CLAIM_INVALID" ? "Claim inválida" : 
            "Token inválido";
          return NextResponse.json(
            {
              error: msg,
              status: 401
            });
      }

      if(payload.role !== "admin"){
        return NextResponse.json({ error: "No está autorizado" }, { status: 403 });
      }*/

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
      console.log(error);
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
