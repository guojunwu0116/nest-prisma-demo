import { AttendanceService } from './attendance.service';
import { AttendanceBucket, LeaveStatus, SessionType } from '@prisma/client';

const prismaMock = {
  student: {
    findMany: jest.fn(),
  },
  leave: {
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('AttendanceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('prioritizes leave over present list', async () => {
    prismaMock.student.findMany.mockResolvedValue([
      { student_id: 1, name: 'Alice' },
    ]);
    prismaMock.leave.findMany.mockResolvedValue([
      { student_id: 1, status: LeaveStatus.approved },
    ]);

    const attendanceRecordCreate = jest.fn().mockResolvedValue({ attendance_id: 11 });
    const pointsLedgerCreate = jest.fn().mockResolvedValue({});
    const attendanceRunCreate = jest.fn().mockResolvedValue({
      attendance_run_id: 1,
      created_at: new Date(),
    });
    const attendanceRunUpdate = jest.fn().mockResolvedValue({});

    prismaMock.$transaction.mockImplementation(async (cb: any) =>
      cb({
        attendanceRun: { create: attendanceRunCreate, update: attendanceRunUpdate },
        attendanceRecord: { create: attendanceRecordCreate },
        pointsLedger: { create: pointsLedgerCreate },
      }),
    );

    const service = new AttendanceService(prismaMock as any);

    await service.createRun(
      {
        date: new Date().toISOString(),
        session: SessionType.morning,
        selected_time: '08:20',
        present_student_ids: [1],
      },
      99,
    );

    expect(attendanceRecordCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          bucket: AttendanceBucket.leave,
          points_delta: 0,
        }),
      }),
    );
  });
});
