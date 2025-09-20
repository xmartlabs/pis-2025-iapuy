import { type NextRequest, NextResponse } from "next/server";
import { AuthController } from "../controller/auth.controller";
const authController = new AuthController();

export function POST(req: NextRequest) {
  try {
    const data = authController.refresh(req);
    if (data.status === 200) {
      const res = NextResponse.json({ accessToken: data.accessToken });
      return res;
    }

    return NextResponse.json({ error: data.error }, { status: data.status });
  } catch {
    return NextResponse.json(
      { error: "El refresh token es invalido o ha expirado." },
      { status: 403 }
    );
  }
}
