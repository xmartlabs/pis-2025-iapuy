import { NextRequest } from "next/server";
import { UserController } from "./controller/user.controller";
import { initDatabase } from "@/lib/init-database";

const userController = new UserController();

await initDatabase();

export async function GET(request: NextRequest) {
  return userController.getUsers();
}

export async function POST(request: NextRequest) {
  return userController.createUser(request);
}
