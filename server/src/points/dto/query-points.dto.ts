import { IsDateString, IsOptional } from 'class-validator';

export class QueryPointsDto {
  @IsOptional()
  @IsDateString()
  date_from?: string;

  @IsOptional()
  @IsDateString()
  date_to?: string;
}
