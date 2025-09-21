import { type NextRequest, NextResponse } from "next/server";
import { AuthController } from "../controller/auth.controller";

const authController = new AuthController();

export async function POST(req: NextRequest) {
  try {
    const data = await authController.login(req);
    if (data.status === 200) {
      const res = NextResponse.json({ accessToken: data.accessToken });
      res.cookies.set("refreshToken", String(data.refreshToken), {
        httpOnly: true,
        secure: true,
        path: "/api/auth/refresh",
        maxAge: 60 * 60 * 24 * 180,
      });
      return res;
    }

    return NextResponse.json({ error: data.error }, { status: data.status });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
