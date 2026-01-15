import { IsInt, IsOptional, IsString } from 'class-validator';

export class QueryStudentDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsInt()
  seat_no?: number;

  @IsOptional()
  @IsString()
  dorm_no?: string;
}
