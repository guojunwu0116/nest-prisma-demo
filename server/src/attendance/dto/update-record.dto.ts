import { IsEnum, IsInt, IsString } from 'class-validator';
import { AttendanceBucket } from '@prisma/client';

export class UpdateRecordDto {
  @IsInt()
  student_id!: number;

  @IsEnum(AttendanceBucket)
  bucket!: AttendanceBucket;

  @IsString()
  reason!: string;
}
