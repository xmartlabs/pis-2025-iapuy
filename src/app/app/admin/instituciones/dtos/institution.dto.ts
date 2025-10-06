import { type InstitutionContactDTO } from "@/app/api/instituciones/dtos/institution-contact.dto";

export class InstitutionDto {
  id: string;
  nombre: string;
  Patologias: Array<string>;
  InstitutionContacts: Array<InstitutionContactDTO>;
  constructor(
    id: string,
    nombre: string,
    patologias: Array<string>,
    institutionContacts: Array<InstitutionContactDTO>
  ) {
    this.id = id;
    this.nombre = nombre;
    this.Patologias = patologias;
    this.InstitutionContacts = institutionContacts;
  }
}
