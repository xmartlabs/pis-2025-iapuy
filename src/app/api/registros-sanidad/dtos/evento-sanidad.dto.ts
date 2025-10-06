export class EventoSanidadDto {
  id: string;
  date: Date;
  activity: string;

  constructor(id: string, date: Date, activity: string) {
    this.id = id;
    this.date = date;
    this.activity = activity;
  }
}
