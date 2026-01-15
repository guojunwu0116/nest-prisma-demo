import { RosterVisibilityInterceptor } from './roster-visibility.interceptor';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, firstValueFrom } from 'rxjs';
import { UserRole } from '@prisma/client';

function createContext(role: UserRole) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        user: { role },
      }),
    }),
  } as ExecutionContext;
}

function createHandler(data: any): CallHandler {
  return {
    handle: () => of(data),
  };
}

describe('RosterVisibilityInterceptor', () => {
  it('returns only roster fields for committee', async () => {
    const interceptor = new RosterVisibilityInterceptor();
    const result = await firstValueFrom(
      interceptor.intercept(
        createContext(UserRole.committee),
        createHandler([
          {
            student_id: 1,
            name: 'Alice',
            leave_flag: true,
            seat_no: 5,
          },
        ]),
      ),
    );

    expect(result).toEqual([
      { student_id: 1, name: 'Alice', leave_flag: true },
    ]);
  });
});
