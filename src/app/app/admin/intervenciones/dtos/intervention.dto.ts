export class InterventionDto {
  id: string;
  timeStamp: Date;
  cost: number;
  type: "educativa" | "recreativa" | "terapeutica";
  post_evaluacion?: string;
  photosUrls: string[];
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;

  organizacionId?: string;
  organizacionNombre?: string;
  cantidadTuplasNecesarias?: number;
  estado?: string;

  constructor(data: Partial<InterventionDto>) {
    this.id = data.id ?? '';
    this.timeStamp = data.timeStamp ?? new Date();
    this.cost = data.cost ?? 0;
    this.type = data.type ?? "educativa";
    this.post_evaluacion = data.post_evaluacion;
    this.photosUrls = data.photosUrls ?? [];
    this.userId = data.userId ?? '';
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt;

    this.organizacionId = data.organizacionId;
    this.organizacionNombre = data.organizacionNombre;
    this.cantidadTuplasNecesarias = data.cantidadTuplasNecesarias;
    this.estado = data.estado;
  }
}