/* eslint-disable check-file/folder-naming-convention */
import { initDatabase } from "@/lib/init-database";
import { type NextRequest, NextResponse } from "next/server";
import { InstitucionesController } from "../../controller/institucion.controller";

const institutionsController = new InstitucionesController();
await initDatabase();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await institutionsController.interventionsPDF(request, id);

    if (result instanceof Uint8Array || Buffer.isBuffer(result)) {
      const body = (Buffer.isBuffer(result)
        ? result
        : Buffer.from(result)) as unknown as BodyInit;
      return new NextResponse(body, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename=intervenciones_${id}.pdf`,
        },
      });
    }

    return NextResponse.json(result, { status: 500 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal Server Error.",
      },
      { status: 500 }
    );
  }
}
