import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // Se excluye las rutas de login y refresh
  if (
    pathname.startsWith("/api/auth") ||
    (pathname.startsWith("/api/magic-link") && method === "PUT")
  ) {
    return NextResponse.next();
  }

  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) {
    return NextResponse.json(
      { error: "No se encontro un token de acceso en la solicitud." },
      { status: 401 }
    );
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  try {
    const res = await jwtVerify(token, secret);

    if (res.payload.type === "Colaborador") {
      if (
        (pathname.startsWith("/api/users/") && pathname.endsWith("/perros")) ||
        pathname.startsWith("/api/perros/detalles") ||
        pathname.startsWith("/api/registros-sanidad") ||
        pathname.startsWith("/api/expenses") ||
        pathname.startsWith("/api/users/profile") ||
        pathname.startsWith("/api/perros/interventions") ||
        pathname.startsWith("/api/perros/options") ||
        (pathname.startsWith("/api/intervention") && method === "GET") ||
        (pathname.startsWith("/api/intervention") && method === "PUT")
      ) {
        return NextResponse.next();
      }
      return NextResponse.json(
        { error: "No tiene permisos para acceder a esta ruta" },
        { status: 401 }
      );
    }

    return NextResponse.next();
  } catch {
    return NextResponse.json(
      { error: "El token de acceso es invalido o ha expirado." },
      { status: 401 }
    );
  }
}

// Aplica solo a estas rutas:
export const config = {
  matcher: ["/api/:path*"],
};
