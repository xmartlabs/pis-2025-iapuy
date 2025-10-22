/* eslint-disable */
// Desactivate ESLINT only beacuse [id] folder does not match with KEBAB-CASE pattern and it is neccessary

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
    const data = await interventionController.getPathologies(id);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
