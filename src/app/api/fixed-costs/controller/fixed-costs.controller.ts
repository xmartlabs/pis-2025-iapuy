import type UpdateFixedCostsDTO from "../dtos/fixed-costs.dto";
import { fixedCostsService } from "../service/fixed-costs.service";

export class FixedCostsController {
  getCostos(): {
    banios: number;
    desparasitacionesExterna: number;
    desparasitacionesInterna: number;
    vacunas: number;
    kilometros: number;
    honorario: number;
  } {
    return fixedCostsService.getCostos();
  }

  async loadCostos(costos: UpdateFixedCostsDTO) {
    await fixedCostsService.setCostos(costos);
  }
}
