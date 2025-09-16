import { initDatabase } from "@/lib/init-database";
import { NextRequest } from "next/server";
import { PerrosController } from "./controller/perros.controller";
import { extractPagination } from "@/lib/pagination/extraction";

const perrosController = new PerrosController();
await initDatabase();

export async function GET(request: NextRequest) {
  try {
    const pagination = await extractPagination(request);

    return perrosController.getPerros(pagination);
  } catch (error) {
    console.error(error);
    return new Response(undefined, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  return perrosController.createPerro(request);
}
