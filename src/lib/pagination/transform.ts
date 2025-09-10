import { PaginationResultDto } from "./pagination-result.dto";
import { PaginationDto } from "./pagination.dto";

export const getPaginationResultFromModel = <T>(
  pagination: PaginationDto,
  result: { rows: T[]; count: number }
): PaginationResultDto<T> => {
  return {
    data: result.rows,
    count: result.rows.length,
    totalItems: result.count,
    totalPages: Math.ceil(result.count / pagination.size),
    page: pagination.page,
    size: pagination.size,
  };
};
