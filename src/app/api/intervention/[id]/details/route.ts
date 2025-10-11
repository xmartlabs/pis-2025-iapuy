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
    const data = await interventionController.getInterventionDetails(id);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching intervention details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
