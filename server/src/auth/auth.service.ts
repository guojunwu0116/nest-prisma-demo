import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { WebLoginDto } from './dto/web-login.dto';
import bcrypt from 'bcrypt';
import { ErrorCode } from '../common/constants/error-codes';
import { WxBindDto } from './dto/wx-bind.dto';
import { InvitesService } from '../invites/invites.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly invitesService: InvitesService,
  ) {}

  async webLogin(dto: WebLoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { username: dto.username, enabled: true },
    });
    if (!user || !user.password_hash) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
        error_code: ErrorCode.UNAUTHORIZED,
      });
    }

    if (![UserRole.teacher, UserRole.admin].includes(user.role)) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
        error_code: ErrorCode.UNAUTHORIZED,
      });
    }

    const match = await bcrypt.compare(dto.password, user.password_hash);
    if (!match) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
        error_code: ErrorCode.UNAUTHORIZED,
      });
    }

    const token = this.signToken(user.user_id, user.role, user.student_id ?? undefined);

    return {
      token,
      user: {
        user_id: user.user_id,
        role: user.role,
        display_name: user.username ?? 'user',
      },
    };
  }

  async wxLogin(wxCode: string) {
    return { wx_openid: wxCode };
  }

  async bindWx(dto: WxBindDto) {
    const wxOpenid = dto.wx_code;
    const invite = await this.invitesService.consumeInvite(dto.invite_code);

    const student = await this.prisma.student.findFirst({
      where: {
        seat_no: dto.seat_no,
        name: dto.name,
      },
    });

    if (!student) {
      throw new BadRequestException({
        message: 'Student not found',
        error_code: ErrorCode.STUDENT_NOT_FOUND,
      });
    }

    const existingBinding = await this.prisma.wxBinding.findUnique({
      where: { wx_openid: wxOpenid },
    });
    if (existingBinding) {
      throw new BadRequestException({
        message: 'WX binding exists',
        error_code: ErrorCode.WX_BINDING_EXISTS,
      });
    }

    const role =
      invite.purpose === 'bind_committee' ? UserRole.committee : UserRole.student;

    const user = await this.prisma.user.upsert({
      where: { student_id: student.student_id },
      update: { role },
      create: {
        role,
        enabled: true,
        student_id: student.student_id,
      },
    });

    await this.prisma.wxBinding.create({
      data: {
        wx_openid: wxOpenid,
        student_id: student.student_id,
        bound_role: role,
      },
    });

    const token = this.signToken(user.user_id, user.role, student.student_id);

    return {
      token,
      role: user.role,
      student_id: student.student_id,
    };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { user_id: userId } });
    if (!user) {
      throw new UnauthorizedException({
        message: 'Unauthorized',
        error_code: ErrorCode.UNAUTHORIZED,
      });
    }

    return {
      user_id: user.user_id,
      role: user.role,
      student_id: user.student_id ?? undefined,
    };
  }

  private signToken(userId: number, role: UserRole, studentId?: number) {
    return this.jwtService.sign({ sub: userId, role, student_id: studentId });
  }
}
