import type { NextRequest } from "next/server";
import { PaginationDto } from "./pagination.dto";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

export async function extractPagination(
  request: NextRequest
): Promise<PaginationDto> {
  // Extract query parameters from URL
  const searchParams = request.nextUrl.searchParams;
  const params = Object.fromEntries(searchParams.entries());

  // Transform and validate
  const pagination = new PaginationDto();
  Object.assign(pagination, params);

  // Transform using class-transformer
  const paginationObj = plainToInstance(PaginationDto, pagination);

  // Validate
  const errors = await validate(paginationObj);
  if (errors.length > 0) {
    throw new Error();
  }

  return paginationObj;
}
