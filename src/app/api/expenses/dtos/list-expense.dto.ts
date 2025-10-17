export interface ListExpenseDto {
  id: string;
  userId: string;
  concept: string;
  type: string;
  state: "Pagado" | "Pendiente de pago";
  amount: number;
  fecha: Date | null;
  user?: {
    ci: string;
    nombre: string;
  };
}
