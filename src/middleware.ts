import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    if (pathname.startsWith("/api/auth")) {
      return NextResponse.next();
    }

    const token = req.headers.get("authorization")?.split(" ")[1];
    console.log(req.headers)
  
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    try {
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
  }
  
  // Aplica solo a estas rutas:
  export const config = {
    matcher: ["/api/:path*"],
  };