import {
  getExamRule,
  getExamTimeState,
  scoreSession,
  selectSessionQuestions,
  type ExamCategory,
  type QuestionCandidate,
  type SessionAnswerRecord,
  type SessionQuestionPlan,
} from '../../../../packages/shared/src/index';

export interface ExamSessionAnswerInput {
  questionId: string;
  isCorrect: boolean;
  answeredAt?: Date;
}

export interface ExamSessionState {
  category: ExamCategory;
  startedAt: Date;
  questionPlan: SessionQuestionPlan[];
  answers: SessionAnswerRecord[];
}

export interface StartExamSessionInput {
  category: ExamCategory;
  candidates: QuestionCandidate[];
  startedAt?: Date;
}

export function startExamSession(input: StartExamSessionInput): ExamSessionState {
  const questionPlan = selectSessionQuestions(input.candidates, {
    category: input.category,
    mode: 'exam',
  });

  return {
    category: input.category,
    startedAt: input.startedAt ?? new Date(),
    questionPlan,
    answers: [],
  };
}

export function appendExamAnswer(session: ExamSessionState, input: ExamSessionAnswerInput): ExamSessionState {
  const alreadyAnswered = session.answers.some((answer) => answer.questionId === input.questionId);
  if (alreadyAnswered) {
    return session;
  }

  return {
    ...session,
    answers: [
      ...session.answers,
      {
        questionId: input.questionId,
        isCorrect: input.isCorrect,
        answeredAt: input.answeredAt ?? new Date(),
      },
    ],
  };
}

export function finalizeExamSession(session: ExamSessionState, now: Date = new Date()) {
  const timing = getExamTimeState(session.category, session.startedAt, now);
  const score = scoreSession(session.category, session.answers);
  const rule = getExamRule(session.category);

  return {
    session,
    rule,
    timing,
    score,
    expired: timing.expired,
    completed: session.answers.length >= rule.totalQuestions || timing.expired,
  };
}
