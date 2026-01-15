import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { LeaveStatus } from '@prisma/client';

export class QueryLeaveDto {
  @IsOptional()
  @IsEnum(LeaveStatus)
  status?: LeaveStatus;

  @IsOptional()
  @IsDateString()
  date_from?: string;

  @IsOptional()
  @IsDateString()
  date_to?: string;
}
