import { readFile, writeFile, mkdir } from "node:fs/promises";
import path, { dirname } from "node:path";
import UpdateGastosDTO from "../dtos/update-gastos.dto";

class GastosFijosService {
  private static banios: number;
  private static desparasitacionesInterna: number;
  private static desparasitacionesExterna: number;
  private static vacunas: number;
  private static initialized = false;

  private static readonly filePath = path.join(
    process.cwd(),
    "data",
    "costos.json"
  );

  static async init() {
    if (this.initialized) return;

    try {
      const data = await readFile(this.filePath, "utf-8");
      const costos = JSON.parse(data);

      this.banios = costos.banios ?? 250;
      this.desparasitacionesInterna = costos.desparasitacionesInterna ?? 250;
      this.desparasitacionesExterna = costos.desparasitacionesExterna ?? 250;

      this.vacunas = costos.vacunas ?? 250;

      console.log("[GastosFijosService] Loaded costos from file:", costos);
    } catch {
      console.warn(
        "[GastosFijosService] costos.json not found. Creating with defaults."
      );

      const defaultCostos = {
        banios: 250,
        desparasitacionesInterna: 250,
        desparasitacionesExterna: 250,
        vacunas: 250,
      };

      await mkdir(dirname(this.filePath), { recursive: true });

      await writeFile(
        this.filePath,
        JSON.stringify(defaultCostos, null, 2),
        "utf-8"
      );

      this.banios = 250;
      this.desparasitacionesInterna = 250;
      this.desparasitacionesExterna = 250;
      this.vacunas = 250;
    }

    this.initialized = true;
  }

  getCostoBanio(): number {
    return GastosFijosService.banios;
  }

  getCostoDesparasitacionInterna(): number {
    return GastosFijosService.desparasitacionesInterna;
  }

  getCostoDesparasitacionExterna(): number {
    return GastosFijosService.desparasitacionesExterna;
  }

  getCostoVacunas(): number {
    return GastosFijosService.vacunas;
  }

  getCostos(): {
    banios: number;
    desparasitacionesExterna: number;
    desparasitacionesInterna: number;
    vacunas: number;
  } {
    return {
      banios: GastosFijosService.banios,
      desparasitacionesExterna: GastosFijosService.desparasitacionesExterna,
      desparasitacionesInterna: GastosFijosService.desparasitacionesInterna,
      vacunas: GastosFijosService.vacunas,
    };
  }

  async setCostos(costos: UpdateGastosDTO) {
    const persist = {
      banios: costos.banios ?? GastosFijosService.banios,
      desparasitacionesInterna:
        costos.desparasitacionesInterna ??
        GastosFijosService.desparasitacionesInterna,
      desparasitacionesExterna:
        costos.desparasitacionesExterna ??
        GastosFijosService.desparasitacionesExterna,
      vacunas: costos.vacunas ?? GastosFijosService.vacunas,
    };
    await writeFile(
      GastosFijosService.filePath,
      JSON.stringify(persist, null, 2),
      "utf-8"
    );

    if (costos.banios) GastosFijosService.banios = costos.banios;
    if (costos.desparasitacionesInterna)
      GastosFijosService.desparasitacionesInterna =
        costos.desparasitacionesInterna;
    if (costos.desparasitacionesExterna)
      GastosFijosService.desparasitacionesExterna =
        costos.desparasitacionesExterna;
    if (costos.vacunas) GastosFijosService.vacunas = costos.vacunas;
  }
}

await GastosFijosService.init();
export const gastosService = new GastosFijosService();
