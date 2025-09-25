export class PerroDTO {
  id: string;
  nombre: string;
  descripcion: string;
  fortalezas: string[];
  duenioId: string;
  createdAt: string;
  updatedAt: string;
  User: UserDto;
  intervencionCount: number;
  // UsrPerro: { intervencionCount: string };
  RegistroSanidad: { id: string; Vacunas: [{ fecha: string }] };

  constructor(
    id: string,
    nombre: string,
    descripcion: string,
    fortalezas: string[],
    duenioId: string,
    createdAt: string,
    updatedAt: string,
    User: UserDto,
    intervencionCount: number,
    RegistroSanidad: { id: string; Vacunas: [{ fecha: string }] }
  ) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.fortalezas = fortalezas;
    this.duenioId = duenioId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.User = User;
    this.intervencionCount = intervencionCount;
    this.RegistroSanidad = RegistroSanidad;
  }
}
