export class EventoSanidadDto {
    id: string;
    fecha: string;
    actividad: string;

    constructor(id: string, fecha: string, actividad: string) {
        this.id = id;
        this.fecha = fecha;
        this.actividad = actividad;
    }
}