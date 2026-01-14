import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { QueryStudentDto } from './dto/query-student.dto';
import { ErrorCode } from '../common/constants/error-codes';
import { UserRole } from '@prisma/client';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async listStudents(dto: QueryStudentDto) {
    return this.prisma.student.findMany({
      where: {
        seat_no: dto.seat_no,
        dorm_no: dto.dorm_no,
        OR: dto.keyword
          ? [
              { name: { contains: dto.keyword } },
              { id_card_no: { contains: dto.keyword } },
            ]
          : undefined,
      },
      orderBy: { seat_no: 'asc' },
    });
  }

  async createStudent(dto: CreateStudentDto) {
    return this.prisma.student.create({
      data: {
        ...dto,
        birth_date: new Date(dto.birth_date),
      },
    });
  }

  async getStudentById(studentId: number, user: { role: UserRole; student_id?: number }) {
    if (user.role === UserRole.student && user.student_id !== studentId) {
      throw new ForbiddenException({
        message: 'Forbidden',
        error_code: ErrorCode.FORBIDDEN,
      });
    }

    if (user.role === UserRole.committee) {
      throw new ForbiddenException({
        message: 'Forbidden',
        error_code: ErrorCode.FORBIDDEN,
      });
    }

    const student = await this.prisma.student.findUnique({
      where: { student_id: studentId },
    });
    if (!student) {
      throw new BadRequestException({
        message: 'Student not found',
        error_code: ErrorCode.STUDENT_NOT_FOUND,
      });
    }

    return student;
  }

  async updateStudent(studentId: number, dto: UpdateStudentDto) {
    return this.prisma.student.update({
      where: { student_id: studentId },
      data: {
        ...dto,
        birth_date: dto.birth_date ? new Date(dto.birth_date) : undefined,
      },
    });
  }
}
