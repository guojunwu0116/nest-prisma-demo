import { IsDateString, IsEnum } from 'class-validator';
import { SessionType } from '@prisma/client';

export class RosterQueryDto {
  @IsDateString()
  date!: string;

  @IsEnum(SessionType)
  session!: SessionType;
}
