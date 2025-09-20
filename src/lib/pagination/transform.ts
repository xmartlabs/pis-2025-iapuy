import type { PaginationResultDto } from "./pagination-result.dto";
import type { PaginationDto } from "./pagination.dto";

export const getPaginationResultFromModel = <T>(
  pagination: PaginationDto,
  result: { rows: T[]; count: number }
): PaginationResultDto<T> => ({
    data: result.rows,
    count: result.rows.length,
    totalItems: result.count,
    totalPages: Math.ceil(result.count / pagination.size),
    page: pagination.page,
    size: pagination.size,
  });
