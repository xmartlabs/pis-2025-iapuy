import { NextResponse } from "next/server";

export function POST() {
  try {
    // Limpiar cookie
    const res = NextResponse.json({ message: "Logout exitoso" });
    res.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: true,
      path: "/api/auth/refresh",
      expires: new Date(0), // expira inmediatamente
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
