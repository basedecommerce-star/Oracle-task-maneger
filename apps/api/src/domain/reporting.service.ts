import {
  aggregateQuestionReports,
  type QuestionReport,
  type QuestionReportAggregate,
} from '../../../../packages/shared/src/question-reporting';

export interface CreateQuestionReportInput {
  questionId: string;
  userId: string;
  type: 'wrong_answer' | 'wrong_text' | 'wrong_image' | 'outdated_question' | 'other';
  comment?: string;
  createdAt?: Date;
}

export interface CreateQuestionReportResult {
  report: QuestionReport;
  aggregate: QuestionReportAggregate;
}

export function createQuestionReport(
  reports: QuestionReport[],
  input: CreateQuestionReportInput,
): CreateQuestionReportResult {
  const report: QuestionReport = {
    questionId: input.questionId,
    userId: input.userId,
    type: input.type,
    comment: input.comment,
    createdAt: input.createdAt ?? new Date(),
  };

  const nextReports = [...reports, report];
  const aggregate = aggregateQuestionReports(input.questionId, nextReports);

  return {
    report,
    aggregate,
  };
}
