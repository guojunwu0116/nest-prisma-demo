import { AttendanceBucket, SessionType } from '@prisma/client';
import { bucketPoints, resolvePresentBucket } from './attendance';

describe('attendance utils', () => {
  it('calculates bucket and points for morning', () => {
    expect(resolvePresentBucket(SessionType.morning, '08:10')).toBe(AttendanceBucket.early);
    expect(resolvePresentBucket(SessionType.morning, '08:25')).toBe(AttendanceBucket.ontime);
    expect(resolvePresentBucket(SessionType.morning, '08:35')).toBe(AttendanceBucket.late);
    expect(bucketPoints[AttendanceBucket.absent]).toBe(-4);
    expect(bucketPoints[AttendanceBucket.late]).toBe(-1);
    expect(bucketPoints[AttendanceBucket.early]).toBe(1);
    expect(bucketPoints[AttendanceBucket.ontime]).toBe(0);
    expect(bucketPoints[AttendanceBucket.leave]).toBe(0);
  });

  it('calculates bucket for afternoon', () => {
    expect(resolvePresentBucket(SessionType.afternoon, '13:40')).toBe(AttendanceBucket.early);
    expect(resolvePresentBucket(SessionType.afternoon, '13:55')).toBe(AttendanceBucket.ontime);
    expect(resolvePresentBucket(SessionType.afternoon, '14:10')).toBe(AttendanceBucket.late);
  });

  it('calculates bucket for evening', () => {
    expect(resolvePresentBucket(SessionType.evening, '18:40')).toBe(AttendanceBucket.early);
    expect(resolvePresentBucket(SessionType.evening, '18:55')).toBe(AttendanceBucket.ontime);
    expect(resolvePresentBucket(SessionType.evening, '19:10')).toBe(AttendanceBucket.late);
  });
});
