import { IsEnum, IsOptional, IsString } from 'class-validator';
import { InvitePurpose } from '@prisma/client';

export class CreateInviteDto {
  @IsEnum(InvitePurpose)
  purpose!: InvitePurpose;

  @IsOptional()
  @IsString()
  expires_at?: string;
}
