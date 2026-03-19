import { getExamRule, type ExamCategory } from './exam-config';

export interface ExamTimeState {
  category: ExamCategory;
  startedAt: Date;
  now: Date;
  durationSeconds: number;
  elapsedSeconds: number;
  remainingSeconds: number;
  expired: boolean;
}

export function getExamTimeState(category: ExamCategory, startedAt: Date, now: Date = new Date()): ExamTimeState {
  const rule = getExamRule(category);
  const durationSeconds = rule.durationMinutes * 60;
  const elapsedSeconds = Math.max(Math.floor((now.getTime() - startedAt.getTime()) / 1000), 0);
  const remainingSeconds = Math.max(durationSeconds - elapsedSeconds, 0);

  return {
    category,
    startedAt,
    now,
    durationSeconds,
    elapsedSeconds,
    remainingSeconds,
    expired: remainingSeconds === 0,
  };
}
