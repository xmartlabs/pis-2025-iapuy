import { initDatabase } from "@/lib/init-database";
import { NextResponse, type NextRequest } from "next/server";
import { MagicLinkController } from "./controller/magic-link.controller";

const magicLinkController = new MagicLinkController();
await initDatabase();

function getRequestOrigin(request: NextRequest): string {
  const rawProto = request.headers.get("x-forwarded-proto");
  const proto = rawProto ? rawProto.split(",")[0].trim() : null;

  let rawHost =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "";
  if (rawHost.includes(",")) rawHost = rawHost.split(",")[0].trim();

  const rawPort = request.headers.get("x-forwarded-port");
  const port = rawPort ? rawPort.split(",")[0].trim() : null;

  let host = rawHost;
  if (port && host && !host.includes(":")) {
    host = `${host}:${port}`;
  }

  const hostnameOnly = host ? host.split(":")[0] : null;
  const isLocal = hostnameOnly
    ? hostnameOnly.includes("localhost") || hostnameOnly.startsWith("127.")
    : false;

  if (host) {
    if (!isLocal) return `https://${host}`;

    const scheme = proto ?? "http";
    return `${scheme}://${host}`;
  }

  try {
    const parsed = new URL(request.url);
    const parsedIsLocal =
      parsed.hostname.includes("localhost") ||
      parsed.hostname.startsWith("127.");
    if (!parsedIsLocal) return `https://${parsed.host}`;
    return parsed.origin;
  } catch {
    return "";
  }
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

export async function PUT(request: NextRequest) {
  const { token, newPassword } = (await request.json()) as {
    token: string;
    newPassword: string;
  };

  if (!token || !newPassword)
    return NextResponse.json(
      { error: "Missing token or new password" },
      { status: 400 }
    );

  try {
    await magicLinkController.changePassword(token, newPassword);

    return NextResponse.json(null, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
