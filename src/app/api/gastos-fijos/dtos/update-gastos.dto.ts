/* eslint-disable new-cap */
import { IsNumber, IsOptional } from "class-validator";

export default class UpdateGastosDTO {
  @IsOptional()
  @IsNumber()
  banios?: number;

  @IsOptional()
  @IsNumber()
  desparasitaciones?: number;

  @IsOptional()
  @IsNumber()
  vacunas?: number;
}
