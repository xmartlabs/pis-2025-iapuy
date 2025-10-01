/* eslint-disable */
// Desactivate ESLINT only beacuse [id] folder does not match with KEBAB-CASE pattern and it is neccessary

import { initDatabase } from "@/lib/init-database";
import {NextResponse} from "next/server";
import { IntervencionController } from "../../controller/Intervencion.controller";

const interventionController = new IntervencionController();
await initDatabase();

export async function GET( req: Request ,context: { params: { id: string } }){
  try {
    const { id } = context.params;
    const data = await interventionController.getPathologies(id);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}