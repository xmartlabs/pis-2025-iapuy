export class ExpenseDto {
  id: string;
  userId: string;
  interventionId?: string;
  sanityId?: string;
  concept: string;
  type: string;
  state: "Pagado" | "Pendiente de Pago";
  amount: number;
  fecha: Date;
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
    sanityId?: string,
    user?: { ci: string; nombre: string }
  ) {
    this.id = id;
    this.userId = userId;
    this.interventionId = interventionId;
    this.sanityId = sanityId;
    this.fecha = fecha;
    this.concept = concept;
    this.type = type;
    this.state = state;
    this.amount = amount;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
    this.user = user;
  }
}
