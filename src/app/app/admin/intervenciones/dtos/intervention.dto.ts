import type { InstitutionDto } from "@/app/app/admin/intervenciones/dtos/institution.dto";

export class InterventionDto {
  id: string;
  timeStamp: Date;
  cost: number;
  type: "educativa" | "recreativa" | "terapeutica";
  postEvaluacion?: string;
  photosUrls: string[];
  userId: string;
  institucions: InstitutionDto;
  cantidadTuplasNecesarias?: number;
  estado?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;

  constructor(
    id: string,
    timeStamp: Date,
    cost: number,
    type: "educativa" | "recreativa" | "terapeutica",
    postEvaluacion: string | undefined,
    photosUrls: string[],
    userId: string,
    institucions: InstitutionDto,
    cantidadTuplasNecesarias?: number,
    estado?: string,
    createdAt?: Date,
    updatedAt?: Date,
    deletedAt?: Date,
  ) {
    this.id = id;
    this.timeStamp = timeStamp;
    this.cost = cost;
    this.type = type;
    this.postEvaluacion = postEvaluacion;
    this.photosUrls = photosUrls;
    this.userId = userId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
    this.institucions = institucions;
    this.cantidadTuplasNecesarias = cantidadTuplasNecesarias;
    this.estado = estado;
  }
}
