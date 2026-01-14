import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { LeaveType, SessionType } from '@prisma/client';

export class CreateLeaveDto {
  @IsDateString()
  date!: string;

  @IsEnum(SessionType)
  session!: SessionType;

  @IsEnum(LeaveType)
  leave_type!: LeaveType;

  @IsOptional()
  @IsString()
  reason?: string;
}
