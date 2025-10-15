export interface ListExpenseDto {
  id: string;
  userId: string;
  concept: string;
  type: string;
  state: "Pagado" | "Pendiente de Pago";
  amount: number;
  fecha: Date | null;
  user?: {
    ci: string;
    nombre: string;
  };
}
