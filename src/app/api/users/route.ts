import { NextRequest } from "next/server";
import { UserController } from "./controller/user.controller";
import { initDatabase } from "@/lib/init-database";
import { extractPagination } from "@/lib/pagination/extraction";

const userController = new UserController();

await initDatabase();

export async function GET(request: NextRequest) {
  try {
    const pagination = await extractPagination(request);

    return userController.getUsers(pagination);
  } catch (error) {
    console.error(error);
    return new Response(undefined, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  return userController.createUser(request);
}
