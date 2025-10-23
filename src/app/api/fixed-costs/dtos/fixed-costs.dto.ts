/* eslint-disable new-cap */
import { IsNumber, IsOptional } from "class-validator";

export default class UpdateFixedCostsDTO {
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

  @IsOptional()
  @IsNumber()
  kilometros?: number;

  @IsOptional()
  @IsNumber()
  honorario?: number;
}
