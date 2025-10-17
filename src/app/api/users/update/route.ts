import { NextResponse, NextRequest } from "next/server";
import { UserController } from "../controller/user.controller";
import { initDatabase } from "@/lib/init-database";
import { extractPagination } from "@/lib/pagination/extraction";
import { UniqueConstraintError } from "sequelize";

const userController = new UserController();

await initDatabase();

export async function POST(request: NextRequest) {
    console.error("print error");
    try {
    const body = await request.json();
    const { username, ...updateData } = body;

    const updateRequest = new NextRequest(request, {
      body: JSON.stringify(updateData)
    });
    
  return NextResponse.json(
      await userController.updateUser(updateRequest, { username })
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}