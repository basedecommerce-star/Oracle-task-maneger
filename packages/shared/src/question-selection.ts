import { getExamRule, type ExamCategory } from './exam-config';

export interface QuestionCandidate {
  id: string;
  category: string;
  topicId?: string;
  ticketNumber?: number;
  verificationStatus: 'verified' | 'published' | string;
  isPublished: boolean;
  priorityScore?: number;
}

export interface SessionQuestionPlan {
  questionId: string;
  orderIndex: number;
}

export interface QuestionSelectionOptions {
  category: ExamCategory;
  mode: 'training' | 'exam';
  limit?: number;
  topicId?: string;
  ticketNumber?: number;
}

function sortCandidates(candidates: QuestionCandidate[]): QuestionCandidate[] {
  return [...candidates].sort((left, right) => {
    const leftScore = left.priorityScore ?? 0;
    const rightScore = right.priorityScore ?? 0;

    if (leftScore !== rightScore) {
      return rightScore - leftScore;
    }

    return left.id.localeCompare(right.id);
  });
}

export function selectSessionQuestions(candidates: QuestionCandidate[], options: QuestionSelectionOptions): SessionQuestionPlan[] {
  const examRule = getExamRule(options.category);
  const limit = options.mode === 'exam' ? examRule.totalQuestions : options.limit ?? examRule.totalQuestions;

  const filtered = candidates.filter((candidate) => {
    if (candidate.category !== options.category) return false;
    if (!candidate.isPublished && candidate.verificationStatus !== 'verified') return false;
    if (options.topicId && candidate.topicId !== options.topicId) return false;
    if (options.ticketNumber !== undefined && candidate.ticketNumber !== options.ticketNumber) return false;
    return true;
  });

  const selected = sortCandidates(filtered).slice(0, limit);

  return selected.map((candidate, index) => ({
    questionId: candidate.id,
    orderIndex: index + 1,
  }));
}
