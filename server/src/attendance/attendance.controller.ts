import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/guards/roles.decorator';
import { UserRole } from '@prisma/client';
import { RosterQueryDto } from './dto/roster-query.dto';
import { CreateRunDto } from './dto/create-run.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { RosterVisibilityInterceptor } from '../common/interceptors/roster-visibility.interceptor';

@Controller('api/attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('roster')
  @Roles(UserRole.committee, UserRole.teacher, UserRole.admin)
  @UseInterceptors(RosterVisibilityInterceptor)
  async roster(@Query() dto: RosterQueryDto) {
    return this.attendanceService.getRoster(dto);
  }

  @Post('runs')
  @Roles(UserRole.committee, UserRole.teacher, UserRole.admin)
  async createRun(@Body() dto: CreateRunDto, @Req() req: { user: { sub: number } }) {
    return this.attendanceService.createRun(dto, req.user.sub);
  }

  @Get('runs')
  @Roles(UserRole.teacher, UserRole.admin)
  async listRuns(@Query('date') date?: string) {
    return this.attendanceService.listRuns(date);
  }

  @Get('runs/:attendance_run_id')
  @Roles(UserRole.teacher, UserRole.admin)
  async getRun(@Param('attendance_run_id') runId: string) {
    return this.attendanceService.getRunDetail(Number(runId));
  }

  @Patch('runs/:attendance_run_id')
  @Roles(UserRole.teacher, UserRole.admin)
  async updateRun(
    @Param('attendance_run_id') runId: string,
    @Body() dto: UpdateRecordDto,
    @Req() req: { user: { sub: number } },
  ) {
    return this.attendanceService.updateRecord(Number(runId), dto, req.user.sub);
  }

  @Get('my')
  @Roles(UserRole.student)
  async myAttendance(
    @Req() req: { user: { student_id?: number } },
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
  ) {
    return this.attendanceService.listMyAttendance(req.user.student_id!, dateFrom, dateTo);
  }
}
