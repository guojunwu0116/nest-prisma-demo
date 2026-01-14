import { BadRequestException, Injectable } from '@nestjs/common';
import {
  AttendanceBucket,
  LeaveStatus,
  PointsType,
  SessionType,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RosterQueryDto } from './dto/roster-query.dto';
import { CreateRunDto } from './dto/create-run.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { ErrorCode } from '../common/constants/error-codes';
import { bucketPoints, buildSummaryText, resolvePresentBucket } from '../common/utils/attendance';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getRoster(dto: RosterQueryDto) {
    const date = new Date(dto.date);
    const students = await this.prisma.student.findMany({
      select: { student_id: true, name: true },
      orderBy: { seat_no: 'asc' },
    });

    const leaves = await this.prisma.leave.findMany({
      where: {
        date,
        session: dto.session,
        status: LeaveStatus.approved,
      },
      select: { student_id: true },
    });

    const leaveSet = new Set(leaves.map((leave) => leave.student_id));

    return students.map((student) => ({
      student_id: student.student_id,
      name: student.name,
      leave_flag: leaveSet.has(student.student_id),
    }));
  }

  async createRun(dto: CreateRunDto, operatorUserId: number) {
    const date = new Date(dto.date);
    const students = await this.prisma.student.findMany({
      select: { student_id: true, name: true },
      orderBy: { seat_no: 'asc' },
    });

    const approvedLeaves = await this.prisma.leave.findMany({
      where: {
        date,
        session: dto.session,
        status: LeaveStatus.approved,
      },
      select: { student_id: true },
    });

    const leaveSet = new Set(approvedLeaves.map((leave) => leave.student_id));
    const presentSet = new Set(dto.present_student_ids);
    const presentBucket = resolvePresentBucket(dto.session, dto.selected_time);

    const buckets: Record<AttendanceBucket, string[]> = {
      early: [],
      ontime: [],
      late: [],
      absent: [],
      leave: [],
    };

    return this.prisma.$transaction(async (tx) => {
      const run = await tx.attendanceRun.create({
        data: {
          date,
          session: dto.session,
          selected_time: dto.selected_time,
          operator_user_id: operatorUserId,
          summary_text: null,
        },
      });

      let presentCount = 0;
      let leaveCount = 0;
      let absentCount = 0;

      for (const student of students) {
        let bucket: AttendanceBucket;
        if (leaveSet.has(student.student_id)) {
          bucket = AttendanceBucket.leave;
          leaveCount += 1;
        } else if (presentSet.has(student.student_id)) {
          bucket = presentBucket;
          presentCount += 1;
        } else {
          bucket = AttendanceBucket.absent;
          absentCount += 1;
        }

        buckets[bucket].push(student.name);

        const record = await tx.attendanceRecord.create({
          data: {
            attendance_run_id: run.attendance_run_id,
            student_id: student.student_id,
            bucket,
            points_delta: bucketPoints[bucket],
          },
        });

        await tx.pointsLedger.create({
          data: {
            student_id: student.student_id,
            points_type: PointsType.attendance,
            source_ref: `attendance_record:${record.attendance_id}`,
            title: `Attendance ${dto.session}`,
            points_value: bucketPoints[bucket],
            operator_user_id: operatorUserId,
            date,
          },
        });
      }

      const updatedSummary = buildSummaryText(dto.session, buckets);
      await tx.attendanceRun.update({
        where: { attendance_run_id: run.attendance_run_id },
        data: { summary_text: updatedSummary },
      });

      return {
        attendance_run_id: run.attendance_run_id,
        present_count: presentCount,
        leave_count: leaveCount,
        remaining_count: absentCount,
        submitted_at: run.created_at,
      };
    });
  }

  async listRuns(date?: string) {
    return this.prisma.attendanceRun.findMany({
      where: {
        date: date ? new Date(date) : undefined,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async getRunDetail(attendanceRunId: number) {
    const run = await this.prisma.attendanceRun.findUnique({
      where: { attendance_run_id: attendanceRunId },
      include: {
        attendance_records: {
          include: { student: { select: { name: true } } },
        },
      },
    });

    if (!run) {
      throw new BadRequestException({
        message: 'Attendance run not found',
        error_code: ErrorCode.ATTENDANCE_NOT_FOUND,
      });
    }

    const buckets: Record<AttendanceBucket, string[]> = {
      early: [],
      ontime: [],
      late: [],
      absent: [],
      leave: [],
    };

    for (const record of run.attendance_records) {
      buckets[record.bucket].push(record.student.name);
    }

    return {
      attendance_run_id: run.attendance_run_id,
      date: run.date,
      session: run.session,
      selected_time: run.selected_time,
      summary_text: run.summary_text,
      buckets,
    };
  }

  async updateRecord(attendanceRunId: number, dto: UpdateRecordDto, operatorId: number) {
    const record = await this.prisma.attendanceRecord.findUnique({
      where: {
        attendance_run_id_student_id: {
          attendance_run_id: attendanceRunId,
          student_id: dto.student_id,
        },
      },
    });

    if (!record) {
      throw new BadRequestException({
        message: 'Attendance record not found',
        error_code: ErrorCode.ATTENDANCE_NOT_FOUND,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedRecord = await tx.attendanceRecord.update({
        where: { attendance_id: record.attendance_id },
        data: {
          bucket: dto.bucket,
          points_delta: bucketPoints[dto.bucket],
        },
      });

      await tx.pointsLedger.updateMany({
        where: { source_ref: `attendance_record:${record.attendance_id}` },
        data: { points_value: bucketPoints[dto.bucket] },
      });

      await tx.auditLog.create({
        data: {
          attendance_run_id: attendanceRunId,
          student_id: dto.student_id,
          old_bucket: record.bucket,
          new_bucket: dto.bucket,
          reason: dto.reason,
          operator_user_id: operatorId,
        },
      });

      return updatedRecord;
    });
  }

  async listMyAttendance(studentId: number, dateFrom?: string, dateTo?: string) {
    return this.prisma.attendanceRecord.findMany({
      where: {
        student_id: studentId,
        attendance_run: {
          date: {
            gte: dateFrom ? new Date(dateFrom) : undefined,
            lte: dateTo ? new Date(dateTo) : undefined,
          },
        },
      },
      include: {
        attendance_run: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }
}
