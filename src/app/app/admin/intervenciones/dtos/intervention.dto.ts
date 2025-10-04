import type { InstitutionDto } from "@/app/app/admin/intervenciones/dtos/institution.dto";

export class InterventionDto {
  id: string;
  timeStamp: Date;
  cost: number;
  tipo: "educativa" | "recreativa" | "terapeutica";
  postEvaluacion?: string;
  photosUrls: string[];
  userId: string;
  Institucions: InstitutionDto[];
  pairsQuantity: number;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;

  constructor(
    institucions: InstitutionDto[],
    id: string,
    timeStamp: Date,
    cost: number,
    tipo: "educativa" | "recreativa" | "terapeutica",
    postEvaluacion: string | undefined,
    photosUrls: string[],
    userId: string,
    pairsQuantity: number,
    status: string,
    createdAt?: Date,
    updatedAt?: Date,
    deletedAt?: Date,
  ) {
    this.id = id;
    this.timeStamp = timeStamp;
    this.cost = cost;
    this.tipo = tipo;
    this.postEvaluacion = postEvaluacion;
    this.photosUrls = photosUrls;
    this.userId = userId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
    this.Institucions = institucions;
    this.pairsQuantity = pairsQuantity;
    this.status = status;
  }
}
