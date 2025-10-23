/* eslint-disable check-file/folder-naming-convention */
import { initDatabase } from "@/lib/init-database";
import { NextResponse } from "next/server";
import { InterventionController } from "../../controller/intervention.controller";

const interventionController = new InterventionController();
await initDatabase();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await interventionController.getEvaluateInformation(id);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}