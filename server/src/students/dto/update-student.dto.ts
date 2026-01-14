import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateStudentDto {
  @IsOptional()
  @IsInt()
  seat_no?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsDateString()
  birth_date?: string;

  @IsOptional()
  @IsString()
  dorm_no?: string;

  @IsOptional()
  @IsString()
  id_card_no?: string;

  @IsOptional()
  @IsString()
  father_name?: string;

  @IsOptional()
  @IsString()
  father_phone?: string;

  @IsOptional()
  @IsString()
  mother_name?: string;

  @IsOptional()
  @IsString()
  mother_phone?: string;

  @IsOptional()
  @IsString()
  home_address?: string;
}
