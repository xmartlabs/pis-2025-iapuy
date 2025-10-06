// eslint-disable-next-line check-file/folder-naming-convention
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { UserController } from "@/app/api/users/controller/user.controller";
import { initDatabase } from "@/lib/init-database";
const userController = new UserController();
await initDatabase();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ci: string }> }
) {
  try {
    const { ci } = await params;
    const data = await userController.getUserDogs(ci);

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
