export type QuestionReportType =
  | 'wrong_answer'
  | 'wrong_text'
  | 'wrong_image'
  | 'outdated_question'
  | 'other';

export interface QuestionReport {
  questionId: string;
  userId: string;
  type: QuestionReportType;
  comment?: string;
  createdAt: Date;
}

export interface QuestionReportAggregate {
  questionId: string;
  totalReports: number;
  wrongAnswerReports: number;
  wrongTextReports: number;
  wrongImageReports: number;
  outdatedReports: number;
  otherReports: number;
  recheckRequired: boolean;
}

export function aggregateQuestionReports(questionId: string, reports: QuestionReport[]): QuestionReportAggregate {
  const filtered = reports.filter((report) => report.questionId === questionId);

  const aggregate: QuestionReportAggregate = {
    questionId,
    totalReports: filtered.length,
    wrongAnswerReports: 0,
    wrongTextReports: 0,
    wrongImageReports: 0,
    outdatedReports: 0,
    otherReports: 0,
    recheckRequired: false,
  };

  for (const report of filtered) {
    if (report.type === 'wrong_answer') aggregate.wrongAnswerReports += 1;
    if (report.type === 'wrong_text') aggregate.wrongTextReports += 1;
    if (report.type === 'wrong_image') aggregate.wrongImageReports += 1;
    if (report.type === 'outdated_question') aggregate.outdatedReports += 1;
    if (report.type === 'other') aggregate.otherReports += 1;
  }

  aggregate.recheckRequired = aggregate.totalReports >= 3 || aggregate.wrongAnswerReports >= 2;

  return aggregate;
}
