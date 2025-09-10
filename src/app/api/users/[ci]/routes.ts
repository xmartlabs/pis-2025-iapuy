import { NextRequest } from "next/server";
import { UserController } from "../controller/user.controller";

const userController = new UserController();

export async function GET(request: NextRequest) {
  return userController.getUsers();
}

export async function POST(request: NextRequest) {
  return userController.createUser(request);
}
