export interface ParsedAnswerOption {
  orderIndex: number;
  text: string;
  isCorrect?: boolean;
}

export interface ParsedQuestionSnapshot {
  questionText?: string;
  answers: ParsedAnswerOption[];
  correctAnswerRef?: string;
  imageUrl?: string;
}

export interface ReconciliationConflict {
  field: 'questionText' | 'answers' | 'correctAnswerRef' | 'imageUrl';
  primaryValue: unknown;
  secondaryValue: unknown;
  reason: string;
}

export interface ReconciliationResult {
  conflictDetected: boolean;
  conflicts: ReconciliationConflict[];
  confidenceScore: number;
}

function normalizeText(value?: string): string {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

function normalizeAnswers(answers: ParsedAnswerOption[]): ParsedAnswerOption[] {
  return [...answers]
    .map((answer) => ({
      orderIndex: answer.orderIndex,
      text: normalizeText(answer.text),
      isCorrect: answer.isCorrect,
    }))
    .sort((left, right) => left.orderIndex - right.orderIndex);
}

export function reconcileParsedQuestion(primary: ParsedQuestionSnapshot, secondary: ParsedQuestionSnapshot): ReconciliationResult {
  const conflicts: ReconciliationConflict[] = [];

  const primaryQuestionText = normalizeText(primary.questionText);
  const secondaryQuestionText = normalizeText(secondary.questionText);
  if (primaryQuestionText !== secondaryQuestionText) {
    conflicts.push({
      field: 'questionText',
      primaryValue: primary.questionText,
      secondaryValue: secondary.questionText,
      reason: 'Question text differs between parser outputs.',
    });
  }

  const primaryAnswers = normalizeAnswers(primary.answers);
  const secondaryAnswers = normalizeAnswers(secondary.answers);
  if (JSON.stringify(primaryAnswers) !== JSON.stringify(secondaryAnswers)) {
    conflicts.push({
      field: 'answers',
      primaryValue: primaryAnswers,
      secondaryValue: secondaryAnswers,
      reason: 'Answer options differ between parser outputs.',
    });
  }

  if ((primary.correctAnswerRef ?? '') !== (secondary.correctAnswerRef ?? '')) {
    conflicts.push({
      field: 'correctAnswerRef',
      primaryValue: primary.correctAnswerRef,
      secondaryValue: secondary.correctAnswerRef,
      reason: 'Correct answer reference differs between parser outputs.',
    });
  }

  if ((primary.imageUrl ?? '') !== (secondary.imageUrl ?? '')) {
    conflicts.push({
      field: 'imageUrl',
      primaryValue: primary.imageUrl,
      secondaryValue: secondary.imageUrl,
      reason: 'Image URL differs between parser outputs.',
    });
  }

  const confidenceScore = conflicts.length === 0 ? 1 : Math.max(0, 1 - conflicts.length * 0.25);

  return {
    conflictDetected: conflicts.length > 0,
    conflicts,
    confidenceScore,
  };
}
