import { StudentVisibilityInterceptor } from './student-visibility.interceptor';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, firstValueFrom } from 'rxjs';
import { UserRole } from '@prisma/client';
import { ErrorCode } from '../constants/error-codes';

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

describe('StudentVisibilityInterceptor', () => {
  it('filters high-sensitivity fields for student', async () => {
    const interceptor = new StudentVisibilityInterceptor();
    const result = await firstValueFrom(
      interceptor.intercept(
        createContext(UserRole.student),
        createHandler({
          seat_no: 1,
          name: 'Alice',
          dorm_no: 'D1',
          gender: 'female',
          birth_date: '2008-01-01',
          id_card_no: 'SECRET',
        }),
      ),
    );

    expect(result).toEqual({
      seat_no: 1,
      name: 'Alice',
      dorm_no: 'D1',
      gender: 'female',
      birth_date: '2008-01-01',
    });
  });

  it('rejects committee access', async () => {
    const interceptor = new StudentVisibilityInterceptor();

    await expect(
      firstValueFrom(
        interceptor.intercept(
          createContext(UserRole.committee),
          createHandler({ seat_no: 1, name: 'Alice' }),
        ),
      ),
    ).rejects.toMatchObject({
      response: { error_code: ErrorCode.FORBIDDEN },
    });
  });
});
