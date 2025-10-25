import { readFile, writeFile, mkdir } from "node:fs/promises";
import path, { dirname } from "node:path";
import type UpdateFixedCostsDTO from "../dtos/fixed-costs.dto";

class FixedCostsService {
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
    return FixedCostsService.banios;
  }

  getCostoDesparasitacionInterna(): number {
    return FixedCostsService.desparasitacionesInterna;
  }

  getCostoDesparasitacionExterna(): number {
    return FixedCostsService.desparasitacionesExterna;
  }

  getCostoVacunas(): number {
    return FixedCostsService.vacunas;
  }

  getCostoKilometros(): number {
    return FixedCostsService.kilometros;
  }

  getHonorario(): number {
    return FixedCostsService.honorario;
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
      banios: FixedCostsService.banios,
      desparasitacionesExterna: FixedCostsService.desparasitacionesExterna,
      desparasitacionesInterna: FixedCostsService.desparasitacionesInterna,
      vacunas: FixedCostsService.vacunas,
      kilometros: FixedCostsService.kilometros,
      honorario: FixedCostsService.honorario,
    };
  }

  async setCostos(costos: UpdateFixedCostsDTO) {
    const newCostos = {
      banios: costos.banios ?? FixedCostsService.banios,
      desparasitacionesInterna:
        costos.desparasitacionesInterna ??
        FixedCostsService.desparasitacionesInterna,
      desparasitacionesExterna:
        costos.desparasitacionesExterna ??
        FixedCostsService.desparasitacionesExterna,
      vacunas: costos.vacunas ?? FixedCostsService.vacunas,
      kilometros: costos.kilometros ?? FixedCostsService.kilometros,
      honorario: costos.honorario ?? FixedCostsService.honorario,
    };

    FixedCostsService.banios = newCostos.banios;
    FixedCostsService.desparasitacionesInterna =
      newCostos.desparasitacionesInterna;
    FixedCostsService.desparasitacionesExterna =
      newCostos.desparasitacionesExterna;
    FixedCostsService.vacunas = newCostos.vacunas;
    FixedCostsService.kilometros = newCostos.kilometros;
    FixedCostsService.honorario = newCostos.honorario;

    await writeFile(
      FixedCostsService.filePath,
      JSON.stringify(newCostos, null, 2),
      "utf-8"
    );
  }
}

await FixedCostsService.init();
export const fixedCostsService = new FixedCostsService();
