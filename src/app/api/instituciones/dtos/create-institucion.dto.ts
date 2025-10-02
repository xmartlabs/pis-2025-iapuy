import { type ReferenteInstitucionDTO } from "./referente-institucion.dto";

export class CreateInstitucionDTO {
  declare nombre: string;
  declare patologias: Array<string>;
  declare referentes: Array<ReferenteInstitucionDTO>;
}
