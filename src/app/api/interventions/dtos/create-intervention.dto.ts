import type { TipoIntervention } from "@/app/models/intervention.entity";

export class CreateInterventionDto {
  declare id: string;
  declare timestamp: Date;
  declare cost: number;
  declare type: TipoIntervention;
  declare pairQuantity: number;
  declare description: string;
}
