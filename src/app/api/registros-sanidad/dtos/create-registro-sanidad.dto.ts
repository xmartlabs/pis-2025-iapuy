export class CreateHealthRecordDTO {
    declare tipoSanidad : string;
    declare perroId : string; 
    declare fecha : string;
    declare vac : string; // marca vacuna
    declare carneVacunas : Buffer;
    declare medicamento : string; // marca desparasitacion
    declare tipoDesparasitacion: 'Externa' | 'Interna'
}
