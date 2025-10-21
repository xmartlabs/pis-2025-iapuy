/* eslint-disable new-cap */
import { IsNumber, IsOptional } from "class-validator";

export default class UpdateGastosDTO {
  @IsOptional()
  @IsNumber()
  banios?: number;

  @IsOptional()
  @IsNumber()
  desparasitacionesInterna?: number;

  @IsOptional()
  @IsNumber()
  desparasitacionesExterna?: number;

  @IsOptional()
  @IsNumber()
  vacunas?: number;
}
