import { initDatabase } from "@/lib/init-database";
import { NextResponse, type NextRequest } from "next/server";
import { ExpensesController } from "../controller/expenses.controller";

const expensesController = new ExpensesController();
await initDatabase();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const payload = await expensesController.getExpenseDetails(id);
    if (!payload)
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });

    // If the payload contains a sanidad event with a BLOB (Buffer) for
    // carneVacunas, include a base64 representation to simplify front-end
    // rendering (avoid guessing Buffer shapes there).
    try {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const evRaw = (payload as Record<string, unknown>).event;
      if (typeof evRaw === "object" && evRaw !== null) {
        const ev = evRaw as Record<string, unknown>;
        const dataRaw = ev.data;
        if (typeof dataRaw === "object" && dataRaw !== null) {
          const data = dataRaw as Record<string, unknown>;
          // eslint-disable-next-line dot-notation
          const maybe = data["carneVacunas"] ?? data["carne_vacunas"];
          if (maybe !== undefined && maybe !== null) {
            // Node Buffer case
            if (Buffer.isBuffer(maybe)) {
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, dot-notation
              (data as Record<string, unknown>)["carneVacunasBase64"] =
                maybe.toString("base64");
            } else if (typeof maybe === "object" && maybe !== null) {
              // Sequelize may serialize a Buffer as { type: 'Buffer', data: [...] }
              const asObj = maybe as { data?: unknown };
              if (Array.isArray(asObj.data)) {
                const arr = asObj.data;
                // ensure array of numbers
                const ok = arr.every((v) => typeof v === "number");
                if (ok) {
                  try {
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                    const buf = Buffer.from(arr as number[]);
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, dot-notation
                    (data as Record<string, unknown>)["carneVacunasBase64"] =
                      buf.toString("base64");
                  } catch {
                    // ignore
                  }
                }
              }
            }
          }
        }
      }
    } catch {
      // non-fatal, continue to return payload as-is
    }

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
