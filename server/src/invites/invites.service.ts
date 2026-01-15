import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { ErrorCode } from '../common/constants/error-codes';
import { nanoid } from 'nanoid';

@Injectable()
export class InvitesService {
  constructor(private readonly prisma: PrismaService) {}

  async createInvite(dto: CreateInviteDto, createdByUserId: number) {
    const code = nanoid(10).toUpperCase();
    const expiresAt = dto.expires_at ? new Date(dto.expires_at) : null;

    return this.prisma.inviteCode.create({
      data: {
        code,
        purpose: dto.purpose,
        expires_at: expiresAt,
        created_by_user_id: createdByUserId,
        max_uses: 1,
        used_count: 0,
      },
    });
  }

  async listInvites(status?: 'unused' | 'used' | 'expired') {
    const now = new Date();
    const where =
      status === 'unused'
        ? { used_count: 0, OR: [{ expires_at: null }, { expires_at: { gt: now } }] }
        : status === 'used'
          ? { used_count: { gt: 0 } }
          : status === 'expired'
            ? { expires_at: { lt: now } }
            : {};

    return this.prisma.inviteCode.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
  }

  async consumeInvite(code: string) {
    const invite = await this.prisma.inviteCode.findUnique({ where: { code } });
    if (!invite || invite.used_count >= invite.max_uses) {
      throw new BadRequestException({
        message: 'Invite invalid or used',
        error_code: ErrorCode.INVITE_INVALID_OR_USED,
      });
    }

    if (invite.expires_at && invite.expires_at < new Date()) {
      throw new BadRequestException({
        message: 'Invite expired',
        error_code: ErrorCode.INVITE_EXPIRED,
      });
    }

    return this.prisma.inviteCode.update({
      where: { invite_id: invite.invite_id },
      data: {
        used_count: invite.used_count + 1,
        used_at: new Date(),
      },
    });
  }
}
