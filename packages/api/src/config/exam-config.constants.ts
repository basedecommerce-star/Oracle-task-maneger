/**
 * Default exam configurations per category group.
 * Based on auto-test.online Moldova actual structure:
 *   Exam categories: AB, BE, C, CE, D, DE, F
 *   Training categories: AB, C, D, E, F
 *
 * These serve as fallbacks if ExamConfig is not yet seeded in the database.
 * The database ExamConfig is always the source of truth.
 */

export interface ExamConfigDefaults {
  totalQuestions: number;
  durationSeconds: number;
  passThresholdCorrect: number;
  maxErrors: number;
}

/** AB — 24 questions, 30 min */
export const AB_GROUP_CATEGORIES = ['AB'];
export const AB_GROUP_CONFIG: ExamConfigDefaults = {
  totalQuestions: 24,
  durationSeconds: 1800,
  passThresholdCorrect: 22,
  maxErrors: 2,
};

/** BE, C, D, F — 30 questions, 38 min */
export const BCDF_GROUP_CATEGORIES = ['BE', 'C', 'D', 'F'];
export const BCDF_GROUP_CONFIG: ExamConfigDefaults = {
  totalQuestions: 30,
  durationSeconds: 2280,
  passThresholdCorrect: 27,
  maxErrors: 3,
};

/** CE, DE — 36 questions, 45 min */
export const CEDE_GROUP_CATEGORIES = ['CE', 'DE'];
export const CEDE_GROUP_CONFIG: ExamConfigDefaults = {
  totalQuestions: 36,
  durationSeconds: 2700,
  passThresholdCorrect: 32,
  maxErrors: 4,
};

/** All exam category codes (explicit order for consistency) */
export const ALL_EXAM_CATEGORIES = ['AB', 'BE', 'C', 'CE', 'D', 'DE', 'F'];

/** All training category codes */
export const ALL_TRAINING_CATEGORIES = ['AB', 'C', 'D', 'E', 'F'];

export function getDefaultConfigForCategory(
  categoryCode: string,
): ExamConfigDefaults {
  if (AB_GROUP_CATEGORIES.includes(categoryCode)) return AB_GROUP_CONFIG;
  if (CEDE_GROUP_CATEGORIES.includes(categoryCode)) return CEDE_GROUP_CONFIG;
  if (BCDF_GROUP_CATEGORIES.includes(categoryCode)) return BCDF_GROUP_CONFIG;
  return AB_GROUP_CONFIG;
}
