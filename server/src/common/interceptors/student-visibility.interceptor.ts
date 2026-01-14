import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ErrorCode } from '../constants/error-codes';
import { UserRole } from '@prisma/client';

const lowSensitivityFields = [
  'seat_no',
  'name',
  'dorm_no',
  'gender',
  'birth_date',
];

@Injectable()
export class StudentVisibilityInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as { role: UserRole } | undefined;

    return next.handle().pipe(
      map((data) => {
        if (!user) {
          return data;
        }

        if (user.role === UserRole.committee) {
          throw new ForbiddenException({
            message: 'Committee cannot access student profile',
            error_code: ErrorCode.FORBIDDEN,
          });
        }

        if (user.role === UserRole.student) {
          if (!data) {
            return data;
          }
          return lowSensitivityFields.reduce<Record<string, unknown>>((acc, key) => {
            acc[key] = data[key];
            return acc;
          }, {});
        }

        return data;
      }),
    );
  }
}
