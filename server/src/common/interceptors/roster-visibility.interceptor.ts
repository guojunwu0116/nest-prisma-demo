import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserRole } from '@prisma/client';

@Injectable()
export class RosterVisibilityInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as { role: UserRole } | undefined;

    return next.handle().pipe(
      map((data) => {
        if (!user || user.role !== UserRole.committee) {
          return data;
        }

        return (data ?? []).map((item: Record<string, unknown>) => ({
          student_id: item.student_id,
          name: item.name,
          leave_flag: item.leave_flag,
        }));
      }),
    );
  }
}
