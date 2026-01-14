import { AttendanceBucket, SessionType } from '@prisma/client';

const sessionThresholds: Record<
  SessionType,
  { early: string; ontimeEnd: string; lateEnd: string; labels: Record<string, string> }
> = {
  morning: {
    early: '08:20',
    ontimeEnd: '08:30',
    lateEnd: '08:40',
    labels: {
      early: '08:20 以前到班人员',
      ontime: '08:20–08:30 到班人员',
      late: '08:30–08:40 到班人员',
      absent: '08:40 未到班人员',
    },
  },
  afternoon: {
    early: '13:50',
    ontimeEnd: '14:00',
    lateEnd: '14:00',
    labels: {
      early: '13:50 以前到班人员',
      ontime: '13:50–14:00 到班人员',
      late: '14:00 后到班人员',
      absent: '未到班人员',
    },
  },
  evening: {
    early: '18:50',
    ontimeEnd: '19:00',
    lateEnd: '19:00',
    labels: {
      early: '18:50 以前到班人员',
      ontime: '18:50–19:00 到班人员',
      late: '19:00 后到班人员',
      absent: '未到班人员',
    },
  },
};

export const bucketPoints: Record<AttendanceBucket, number> = {
  early: 1,
  ontime: 0,
  late: -1,
  absent: -4,
  leave: 0,
};

export function resolvePresentBucket(session: SessionType, selectedTime: string): AttendanceBucket {
  const thresholds = sessionThresholds[session];
  if (selectedTime < thresholds.early) {
    return AttendanceBucket.early;
  }
  if (selectedTime <= thresholds.ontimeEnd) {
    return AttendanceBucket.ontime;
  }
  if (selectedTime <= thresholds.lateEnd) {
    return AttendanceBucket.late;
  }
  return AttendanceBucket.late;
}

export function buildSummaryText(
  session: SessionType,
  buckets: Record<AttendanceBucket, string[]>,
): string {
  const thresholds = sessionThresholds[session];
  const lines = [
    `${thresholds.labels.early}：${buckets.early?.join('，') ?? ''} 👍`,
    `${thresholds.labels.ontime}：${buckets.ontime?.join('，') ?? ''}`,
    `${thresholds.labels.late}：${buckets.late?.join('，') ?? ''}`,
    `${thresholds.labels.absent}：${buckets.absent?.join('，') ?? ''}`,
    `请假人员：${buckets.leave?.join('，') ?? ''}`,
  ];
  return lines.join('\n');
}
