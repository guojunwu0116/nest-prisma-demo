import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { QueryLeaveDto } from './dto/query-leave.dto';
import { ReviewLeaveDto, ReviewAction } from './dto/review-leave.dto';
import { ErrorCode } from '../common/constants/error-codes';
import { LeaveStatus, UserRole } from '@prisma/client';

@Injectable()
export class LeavesService {
  constructor(private readonly prisma: PrismaService) {}

  async createLeave(studentId: number, dto: CreateLeaveDto) {
    return this.prisma.leave.create({
      data: {
        student_id: studentId,
        date: new Date(dto.date),
        session: dto.session,
        leave_type: dto.leave_type,
        reason: dto.reason,
        status: LeaveStatus.pending,
      },
    });
  }

  async listMyLeaves(studentId: number) {
    return this.prisma.leave.findMany({
      where: { student_id: studentId },
      orderBy: { created_at: 'desc' },
    });
  }

  async listLeaves(dto: QueryLeaveDto) {
    return this.prisma.leave.findMany({
      where: {
        status: dto.status,
        date: {
          gte: dto.date_from ? new Date(dto.date_from) : undefined,
          lte: dto.date_to ? new Date(dto.date_to) : undefined,
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async getLeaveById(
    leaveId: number,
    user: { role: UserRole; student_id?: number },
  ) {
    if (user.role === UserRole.committee) {
      throw new ForbiddenException({
        message: 'Forbidden',
        error_code: ErrorCode.FORBIDDEN,
      });
    }

    const leave = await this.prisma.leave.findUnique({
      where: { leave_id: leaveId },
    });
    if (!leave) {
      throw new BadRequestException({
        message: 'Leave not found',
        error_code: ErrorCode.LEAVE_NOT_FOUND,
      });
    }

    if (user.role === UserRole.student && user.student_id !== leave.student_id) {
      throw new ForbiddenException({
        message: 'Forbidden',
        error_code: ErrorCode.FORBIDDEN,
      });
    }

    return leave;
  }

  async reviewLeave(leaveId: number, dto: ReviewLeaveDto, reviewerId: number) {
    const status = dto.action === ReviewAction.approve ? LeaveStatus.approved : LeaveStatus.rejected;

    return this.prisma.leave.update({
      where: { leave_id: leaveId },
      data: {
        status,
        reviewer_user_id: reviewerId,
        review_comment: dto.review_comment,
      },
    });
  }
}
