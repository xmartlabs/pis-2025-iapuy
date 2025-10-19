export interface PersonFilterDto {
  userId: string;
  nombre: string;
}

export interface FiltersExpenseDto {
  people: PersonFilterDto[];
  statuses: string[];
  months: string[];
}
