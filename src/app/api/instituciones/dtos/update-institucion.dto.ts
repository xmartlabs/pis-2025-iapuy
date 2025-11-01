import { type InstitutionContactDTO } from "./institution-contact.dto";

export class UpdateInstitutionDTO {
  declare name: string;
  declare pathologies: Array<string>;
  declare institutionContacts: Array<InstitutionContactDTO>;
}
