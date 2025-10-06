/* eslint-disable */
import { initDatabase } from "@/lib/init-database";
import { InterventionController } from "../controller/intervention.controller";
import { NextRequest, NextResponse } from "next/server";
import { extractPagination } from "@/lib/pagination/extraction";

const intervencionController = new InterventionController();
await initDatabase();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const intervention = await intervencionController.evaluateIntervention(
      request,
      id
    );
    return NextResponse.json(intervention, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
