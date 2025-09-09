import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, Min } from "class-validator";
import { Order } from "sequelize";

export class PaginationDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  size: number = 15;

  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsString()
  orderBy?: string;

  @IsOptional()
  @IsString()
  order?: string;

  getOffset() {
    return this.size * (this.page - 1);
  }

  getOrder(): Order {
    return [[this.orderBy ?? "createdAt", this.order ?? "DESC"]];
  }
}
