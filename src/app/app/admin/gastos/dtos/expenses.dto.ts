export class ExpenseDto {
  id: string;
  userId: string;
  interventionId?: string;
  sanityRecordId?: string;
  sanityId?: string;
  concept: string;
  type: string;
  state: "Pagado" | "Pendiente de Pago";
  amount: number;
  fecha: Date;
  dogName?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  user?: { ci: string; nombre: string };

  constructor(
    id: string,
    userId: string,
    concept: string,
    type: string,
    fecha: Date,
    state: "Pagado" | "Pendiente de Pago",
    amount: number,
    createdAt?: Date,
    updatedAt?: Date,
    deletedAt?: Date,
    interventionId?: string,
    sanityRecordId?: string,
    sanityId?: string,
    dogName?: string,
    user?: { ci: string; nombre: string }
  ) {
    this.id = id;
    this.userId = userId;
    this.interventionId = interventionId;
    this.sanityRecordId = sanityRecordId;
    this.sanityId = sanityId;
    this.fecha = fecha;
    this.concept = concept;
    this.type = type;
    this.state = state;
    this.amount = amount;
    this.dogName = dogName;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
    this.user = user;
  }
}
