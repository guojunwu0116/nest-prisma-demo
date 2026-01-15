import { LeavesService } from './leaves.service';
import { ErrorCode } from '../common/constants/error-codes';
import { UserRole } from '@prisma/client';

const prismaMock = {
  leave: {
    findUnique: jest.fn(),
  },
};

describe('LeavesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows student to view own leave reason', async () => {
    const service = new LeavesService(prismaMock as any);
    prismaMock.leave.findUnique.mockResolvedValue({
      leave_id: 1,
      student_id: 10,
      reason: 'Sick',
    });

    const leave = await service.getLeaveById(1, {
      role: UserRole.student,
      student_id: 10,
    });

    expect(leave.reason).toBe('Sick');
  });

  it('allows teacher to view leave reason', async () => {
    const service = new LeavesService(prismaMock as any);
    prismaMock.leave.findUnique.mockResolvedValue({
      leave_id: 2,
      student_id: 11,
      reason: 'Personal',
    });

    const leave = await service.getLeaveById(2, {
      role: UserRole.teacher,
    });

    expect(leave.reason).toBe('Personal');
  });

  it('rejects committee access', async () => {
    const service = new LeavesService(prismaMock as any);

    await expect(
      service.getLeaveById(1, { role: UserRole.committee }),
    ).rejects.toMatchObject({
      response: { error_code: ErrorCode.FORBIDDEN },
    });
  });
});
