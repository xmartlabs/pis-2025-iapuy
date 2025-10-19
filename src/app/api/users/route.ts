import { NextResponse, NextRequest } from "next/server";
import { UserController } from "./controller/user.controller";
import { initDatabase } from "@/lib/init-database";
import { extractPagination } from "@/lib/pagination/extraction";
import { UniqueConstraintError } from "sequelize";

const userController = new UserController();

await initDatabase();

export async function GET(request: NextRequest) {
  try {
    const pagination = await extractPagination(request);
    const data = await userController.getUsers(pagination);
    return NextResponse.json(data);
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Hubo un error desconocido" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json(await userController.createUser(request));
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return NextResponse.json(
        { error: "El CI ya está en uso" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
    
  try {
    const body = await request.json();
    const { username, ...updateData } = body;

    const updateRequest = new NextRequest(request, {
      body: JSON.stringify(updateData)
    });

  return await userController.updateUser(updateRequest, { username })
  } catch (error) {
    return NextResponse.json(
      { error: error.message ||"Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const ci: string = request.nextUrl.searchParams.get("ci") ?? "";
    const res: boolean = await userController.deleteUser(ci);

    if (res) {
      return NextResponse.json(
        { success: true, message: "User deleted successfully" },
        { status: 200 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: "User not found.",
      },
      { status: 404 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
