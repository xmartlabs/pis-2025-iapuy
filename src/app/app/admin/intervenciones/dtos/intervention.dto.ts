import type { InstitutionDto } from "@/app/app/admin/intervenciones/dtos/institution.dto";

export class InterventionDto {
  id: string;
  timeStamp: Date;
  cost: number;
  tipo: "Educativa" | "Recreativa" | "Terapeutica";
  postEvaluacion?: string;
  photosUrls: string[];
  userId: string;
  institutions: InstitutionDto;
  pairsQuantity: number;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;

  constructor(
    institutions: InstitutionDto,
    id: string,
    timeStamp: Date,
    cost: number,
    tipo: "Educativa" | "Recreativa" | "Terapeutica",
    postEvaluacion: string | undefined,
    photosUrls: string[],
    userId: string,
    pairsQuantity: number,
    status: string,
    createdAt?: Date,
    updatedAt?: Date,
    deletedAt?: Date
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
    this.institutions = institutions;
    this.pairsQuantity = pairsQuantity;
    this.status = status;
  }
}
