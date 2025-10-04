import type { TipoIntervention } from "@/app/models/intervention.entity";

export class CreateInterventionDto {
  declare id: string;
  declare timeStamp: Date;
  declare cost: number;
  declare type: TipoIntervention;
  declare pairsQuantity: number;
  declare description: string;
  declare institution: string;
}
