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
} from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/guards/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { QueryLeaveDto } from './dto/query-leave.dto';
import { ReviewLeaveDto } from './dto/review-leave.dto';

@Controller('api/leaves')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Post()
  @Roles(UserRole.student)
  async create(@Body() dto: CreateLeaveDto, @Req() req: { user: { student_id?: number } }) {
    return this.leavesService.createLeave(req.user.student_id!, dto);
  }

  @Get('my')
  @Roles(UserRole.student)
  async myLeaves(@Req() req: { user: { student_id?: number } }) {
    return this.leavesService.listMyLeaves(req.user.student_id!);
  }

  @Get()
  @Roles(UserRole.teacher, UserRole.admin)
  async list(@Query() dto: QueryLeaveDto) {
    return this.leavesService.listLeaves(dto);
  }

  @Get(':leave_id')
  @Roles(UserRole.student, UserRole.teacher, UserRole.admin)
  async getDetail(
    @Param('leave_id') leaveId: string,
    @Req() req: { user: { role: UserRole; student_id?: number } },
  ) {
    return this.leavesService.getLeaveById(Number(leaveId), req.user);
  }

  @Patch(':leave_id/review')
  @Roles(UserRole.teacher, UserRole.admin)
  async review(
    @Param('leave_id') leaveId: string,
    @Body() dto: ReviewLeaveDto,
    @Req() req: { user: { sub: number } },
  ) {
    return this.leavesService.reviewLeave(Number(leaveId), dto, req.user.sub);
  }
}
