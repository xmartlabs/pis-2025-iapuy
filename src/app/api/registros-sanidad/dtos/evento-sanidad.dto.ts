export class EventoSanidadDto {
    id: string;
    fecha: Date;
    actividad: string;

    constructor(id: string, fecha: Date, actividad: string) {
        this.id = id;
        this.fecha = fecha;
        this.actividad = actividad;
    }
}