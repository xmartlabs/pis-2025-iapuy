export class DetallesPerroDto {
  id: string;
  nombre: string;
  descripcion: string;
  fortalezas: string;
  duenioId?: string;
  duenioNombre?: string;
  deletedAt: Date | null;

  constructor(
    id: string,
    nombre: string,
    descripcion: string,
    fortalezas: string,
    duenioId: string | undefined,
    duenioNombre: string | undefined,
    deletedAt: Date | null
  ) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.fortalezas = fortalezas;
    this.duenioId = duenioId;
    this.duenioNombre = duenioNombre;
    this.deletedAt = deletedAt;
  }
}
