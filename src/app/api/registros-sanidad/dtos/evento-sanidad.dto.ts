export class EventoSanidadDto {
  id: string;
  date: Date;
  activity: string;
  hasPaidExpense: boolean;

  constructor(
    id: string,
    date: Date,
    activity: string,
    hasPaidExpense: boolean
  ) {
    this.id = id;
    this.date = date;
    this.activity = activity;
    this.hasPaidExpense = hasPaidExpense;
  }
}
