import { readFile, writeFile, mkdir } from "fs/promises";
import path, { dirname } from "path";
import UpdateGastosDTO from "../dtos/update-gastos.dto";

class GastosFijosService {
  private static banios: number;
  private static desparasitaciones: number;
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
      this.desparasitaciones = costos.desparasitaciones ?? 250;
      this.vacunas = costos.vacunas ?? 250;

      console.log("[GastosFijosService] Loaded costos from file:", costos);
    } catch {
      console.warn(
        "[GastosFijosService] costos.json not found. Creating with defaults."
      );

      const defaultCostos = {
        banios: 250,
        desparasitaciones: 250,
        vacunas: 250,
      };

      await mkdir(dirname(this.filePath), { recursive: true });

      await writeFile(
        this.filePath,
        JSON.stringify(defaultCostos, null, 2),
        "utf-8"
      );

      this.banios = 250;
      this.desparasitaciones = 250;
      this.vacunas = 250;
    }

    this.initialized = true;
  }

  getCostoBanio(): number {
    return GastosFijosService.banios;
  }

  getCostoDesparasitacion(): number {
    return GastosFijosService.desparasitaciones;
  }

  getCostoVacunas(): number {
    return GastosFijosService.vacunas;
  }

  getCostos(): {
    banios: number;
    desparasitaciones: number;
    vacunas: number;
  } {
    return {
      banios: GastosFijosService.banios,
      desparasitaciones: GastosFijosService.desparasitaciones,
      vacunas: GastosFijosService.vacunas,
    };
  }

  async setCostos(costos: UpdateGastosDTO) {
    const persist = {
      banios: costos.banios ?? GastosFijosService.banios,
      desparasitaciones:
        costos.desparasitaciones ?? GastosFijosService.desparasitaciones,
      vacunas: costos.vacunas ?? GastosFijosService.vacunas,
    };
    await writeFile(
      GastosFijosService.filePath,
      JSON.stringify(persist, null, 2),
      "utf-8"
    );

    if (costos.banios) GastosFijosService.banios = costos.banios;
    if (costos.desparasitaciones)
      GastosFijosService.desparasitaciones = costos.desparasitaciones;
    if (costos.vacunas) GastosFijosService.vacunas = costos.vacunas;
  }
}

await GastosFijosService.init();
export const gastosService = new GastosFijosService();
