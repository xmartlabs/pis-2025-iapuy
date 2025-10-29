export interface ListExpenseDto {
  id: string;
  userId: string;
  interventionId?: string;
  sanityId?: string;
  concept: string;
  type: string;
  state: "Pagado" | "Pendiente de pago";
  amount: number;
  fecha: Date | null;
  dogName?: string;
  user?: {
    ci: string;
    nombre: string;
  };
}
