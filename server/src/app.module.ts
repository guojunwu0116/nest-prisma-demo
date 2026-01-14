import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { LoggerModule } from './logger/pino-logger.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { InvitesModule } from './invites/invites.module';
import { StudentsModule } from './students/students.module';
import { LeavesModule } from './leaves/leaves.module';
import { AttendanceModule } from './attendance/attendance.module';
import { PointsModule } from './points/points.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    LoggerModule,
    PrismaModule,
    AuthModule,
    InvitesModule,
    StudentsModule,
    LeavesModule,
    AttendanceModule,
    PointsModule,
  ],
})
export class AppModule {}
