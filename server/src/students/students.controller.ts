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
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/guards/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { QueryStudentDto } from './dto/query-student.dto';
import { StudentVisibilityInterceptor } from '../common/interceptors/student-visibility.interceptor';

@Controller('api/students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @Roles(UserRole.teacher, UserRole.admin)
  async list(@Query() dto: QueryStudentDto) {
    return this.studentsService.listStudents(dto);
  }

  @Post()
  @Roles(UserRole.teacher, UserRole.admin)
  async create(@Body() dto: CreateStudentDto) {
    return this.studentsService.createStudent(dto);
  }

  @Get(':student_id')
  @UseInterceptors(StudentVisibilityInterceptor)
  async getDetail(
    @Param('student_id') studentId: string,
    @Req() req: { user: { role: UserRole; student_id?: number } },
  ) {
    return this.studentsService.getStudentById(Number(studentId), req.user);
  }

  @Patch(':student_id')
  @Roles(UserRole.teacher, UserRole.admin)
  async update(@Param('student_id') studentId: string, @Body() dto: UpdateStudentDto) {
    return this.studentsService.updateStudent(Number(studentId), dto);
  }
}
