import {
  scoreSession,
  selectSessionQuestions,
  type ExamCategory,
  type QuestionCandidate,
  type SessionAnswerRecord,
  type SessionQuestionPlan,
} from '../../../../packages/shared/src/index';

export interface TrainingSessionState {
  category: ExamCategory;
  questionPlan: SessionQuestionPlan[];
  answers: SessionAnswerRecord[];
}

export interface StartTrainingSessionInput {
  category: ExamCategory;
  candidates: QuestionCandidate[];
  limit?: number;
  topicId?: string;
  ticketNumber?: number;
}

export function startTrainingSession(input: StartTrainingSessionInput): TrainingSessionState {
  const questionPlan = selectSessionQuestions(input.candidates, {
    category: input.category,
    mode: 'training',
    limit: input.limit,
    topicId: input.topicId,
    ticketNumber: input.ticketNumber,
  });

  return {
    category: input.category,
    questionPlan,
    answers: [],
  };
}

export function appendTrainingAnswer(
  session: TrainingSessionState,
  questionId: string,
  isCorrect: boolean,
  answeredAt: Date = new Date(),
): TrainingSessionState {
  const existingIndex = session.answers.findIndex((answer) => answer.questionId === questionId);

  if (existingIndex >= 0) {
    const nextAnswers = [...session.answers];
    nextAnswers[existingIndex] = {
      questionId,
      isCorrect,
      answeredAt,
    };

    return {
      ...session,
      answers: nextAnswers,
    };
  }

  return {
    ...session,
    answers: [
      ...session.answers,
      {
        questionId,
        isCorrect,
        answeredAt,
      },
    ],
  };
}

export function finalizeTrainingSession(session: TrainingSessionState) {
  const score = scoreSession(session.category, session.answers);

  return {
    session,
    score,
    completed: session.answers.length >= session.questionPlan.length,
  };
}
