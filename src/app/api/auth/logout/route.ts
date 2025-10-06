import { NextResponse } from "next/server";

export function POST() {
  try {
    const res = NextResponse.json({ message: "Logout exitoso" });
    res.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: true,
      path: "/api/auth/refresh",
      expires: new Date(0),
    });
    return res;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
