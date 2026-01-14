import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryPointsDto } from './dto/query-points.dto';

@Injectable()
export class PointsService {
  constructor(private readonly prisma: PrismaService) {}

  async listMyPoints(studentId: number, dto: QueryPointsDto) {
    return this.prisma.pointsLedger.findMany({
      where: {
        student_id: studentId,
        date: {
          gte: dto.date_from ? new Date(dto.date_from) : undefined,
          lte: dto.date_to ? new Date(dto.date_to) : undefined,
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async listPointsByStudent(studentId: number, dto: QueryPointsDto) {
    return this.prisma.pointsLedger.findMany({
      where: {
        student_id: studentId,
        date: {
          gte: dto.date_from ? new Date(dto.date_from) : undefined,
          lte: dto.date_to ? new Date(dto.date_to) : undefined,
        },
      },
      orderBy: { date: 'desc' },
    });
  }
}
