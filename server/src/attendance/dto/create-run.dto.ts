import { ArrayNotEmpty, IsArray, IsDateString, IsEnum, IsString } from 'class-validator';
import { SessionType } from '@prisma/client';

export class CreateRunDto {
  @IsDateString()
  date!: string;

  @IsEnum(SessionType)
  session!: SessionType;

  @IsString()
  selected_time!: string;

  @IsArray()
  @ArrayNotEmpty()
  present_student_ids!: number[];
}
