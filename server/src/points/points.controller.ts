import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { PointsService } from './points.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/guards/roles.decorator';
import { UserRole } from '@prisma/client';
import { QueryPointsDto } from './dto/query-points.dto';

@Controller('api/points')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Get('my')
  @Roles(UserRole.student)
  async myPoints(
    @Req() req: { user: { student_id?: number } },
    @Query() dto: QueryPointsDto,
  ) {
    return this.pointsService.listMyPoints(req.user.student_id!, dto);
  }

  @Get()
  @Roles(UserRole.teacher, UserRole.admin)
  async listByStudent(@Query('student_id') studentId: string, @Query() dto: QueryPointsDto) {
    return this.pointsService.listPointsByStudent(Number(studentId), dto);
  }
}
