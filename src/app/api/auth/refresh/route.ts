import { type NextRequest, NextResponse } from "next/server";
import { AuthController } from "../controller/auth.controller";
const authController = new AuthController();

interface RefreshResponse {
  accessToken?: string;
  error?: string;
  status: number;
}
export function POST(req: NextRequest) {
  try {
    const data = authController.refresh(req) as RefreshResponse;
    if (data.status === 200) {
      const res = NextResponse.json({ accessToken: data.accessToken });
      return res;
    }

    return NextResponse.json({ error: data.error }, { status: data.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
