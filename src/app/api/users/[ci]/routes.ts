import { NextRequest } from "next/server";
import { UserController } from "../controller/user.controller";

const userController = new UserController();

export function GET(request: NextRequest, context: { params: { ci: string } }) {
  return userController.getUser(request, { username: context.params.ci });
}


export async function POST(request: NextRequest) {
  return userController.createUser(request);
}
