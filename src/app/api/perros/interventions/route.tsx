import { initDatabase } from "@/lib/init-database";
import { IntervencionController } from "@/app/api/intervencion/controller/intervencion.controller";
import type {NextRequest} from "next/server";
import { NextResponse} from "next/server";
import { extractPagination } from "@/lib/pagination/extraction";
import type {PaginationDto} from "@/lib/pagination/pagination.dto";

const intervencionController = new IntervencionController();
await initDatabase();

export async function GET(request: NextRequest) {
    try {
        const pagination: PaginationDto = await extractPagination(request);
        const id: string = request.nextUrl.searchParams.get("id") ?? "";
        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }
        const res = await intervencionController.getInterventionByDogId(pagination, id);
        return NextResponse.json(res);
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json(
            { error: "Hubo un error desconocido" },
            { status: 500 },
        );
    }
}
