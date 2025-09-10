export class PaginationResultDto<T> {
  declare data: T[];
  declare count: number;
  declare totalPages: number;
  declare totalItems: number;
  declare page: number;
  declare size: number;
}