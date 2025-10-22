import type UpdateGastosDTO from "../dtos/update-gastos.dto";
import { gastosService } from "../service/gastos-fijos.service";

export class GastosFijosController {
  getCostos(): {
    banios: number;
    desparasitacionesExterna: number;
    desparasitacionesInterna: number;
    vacunas: number;
    kilometros: number;
    honorario: number;
  } {
    return gastosService.getCostos();
  }

  async loadCostos(costos: UpdateGastosDTO) {
    await gastosService.setCostos(costos);
  }
}
