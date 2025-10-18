import { initDatabase } from "@/lib/init-database";
import { NextResponse, type NextRequest } from "next/server";
import { MagicLinkController } from "./controller/magic-link.controller";

const magicLinkController = new MagicLinkController();
await initDatabase();

function getRequestOrigin(request: NextRequest): string {
  const proto = request.headers.get("x-forwarded-proto");
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");

  if (proto && host) return `${proto}://${host}`;

  if (host) {
    const isLocal = host.includes("localhost") || host.startsWith("127.");
    return `${isLocal ? "http" : "https"}://${host}`;
  }

  return "";
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { ci, nombre } = (await request.json()) as {
      ci: string;
      nombre: string;
    };

    const result = await magicLinkController.createMagicLink(ci, nombre);

    const origin = getRequestOrigin(request);
    if (origin) {
      const path = result.startsWith("/") ? result : `/${result}`;
      return NextResponse.json({ magicLink: `${origin}${path}` });
    }

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error.",
      },
      { status: 500 }
    );
  }
}
