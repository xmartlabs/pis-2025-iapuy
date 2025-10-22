import { readFile, writeFile, mkdir } from "node:fs/promises";
import path, { dirname } from "node:path";
import type UpdateGastosDTO from "../dtos/update-gastos.dto";

class GastosFijosService {
  private static banios: number;
  private static desparasitacionesInterna: number;
  private static desparasitacionesExterna: number;
  private static vacunas: number;
  private static kilometros: number;
  private static honorario: number;
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
      const costos = JSON.parse(data) as {
        banios: number;
        desparasitacionesExterna: number;
        desparasitacionesInterna: number;
        vacunas: number;
        kilometros: number;
        honorario: number;
      };

      this.banios = costos.banios ?? 250;
      this.desparasitacionesInterna = costos.desparasitacionesInterna ?? 250;
      this.desparasitacionesExterna = costos.desparasitacionesExterna ?? 250;
      this.vacunas = costos.vacunas ?? 250;
      this.kilometros = costos.kilometros ?? 50;
      this.honorario = costos.honorario ?? 400;
    } catch {
      const defaultCostos = {
        banios: 250,
        desparasitacionesInterna: 250,
        desparasitacionesExterna: 250,
        vacunas: 250,
        kilometros: 0,
        honorario: 0,
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
      this.kilometros = 50;
      this.honorario = 400;
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

  getCostoKilometros(): number {
    return GastosFijosService.kilometros;
  }

  getHonorario(): number {
    return GastosFijosService.honorario;
  }

  getCostos(): {
    banios: number;
    desparasitacionesExterna: number;
    desparasitacionesInterna: number;
    vacunas: number;
    kilometros: number;
    honorario: number;
  } {
    return {
      banios: GastosFijosService.banios,
      desparasitacionesExterna: GastosFijosService.desparasitacionesExterna,
      desparasitacionesInterna: GastosFijosService.desparasitacionesInterna,
      vacunas: GastosFijosService.vacunas,
      kilometros: GastosFijosService.kilometros,
      honorario: GastosFijosService.honorario,
    };
  }

  async setCostos(costos: UpdateGastosDTO) {
    const newCostos = {
      banios: costos.banios ?? GastosFijosService.banios,
      desparasitacionesInterna:
        costos.desparasitacionesInterna ??
        GastosFijosService.desparasitacionesInterna,
      desparasitacionesExterna:
        costos.desparasitacionesExterna ??
        GastosFijosService.desparasitacionesExterna,
      vacunas: costos.vacunas ?? GastosFijosService.vacunas,
      kilometros: costos.kilometros ?? GastosFijosService.kilometros,
      honorario: costos.honorario ?? GastosFijosService.honorario,
    };

    GastosFijosService.banios = newCostos.banios;
    GastosFijosService.desparasitacionesInterna =
      newCostos.desparasitacionesInterna;
    GastosFijosService.desparasitacionesExterna =
      newCostos.desparasitacionesExterna;
    GastosFijosService.vacunas = newCostos.vacunas;
    GastosFijosService.kilometros = newCostos.kilometros;
    GastosFijosService.honorario = newCostos.honorario;

    await writeFile(
      GastosFijosService.filePath,
      JSON.stringify(newCostos, null, 2),
      "utf-8"
    );
  }
}

await GastosFijosService.init();
export const gastosService = new GastosFijosService();
