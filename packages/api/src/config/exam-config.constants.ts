/**
 * Default exam configurations per category group.
 * These serve as fallbacks if ExamConfig is not yet seeded in the database.
 * The database ExamConfig is always the source of truth.
 */

export interface ExamConfigDefaults {
  totalQuestions: number;
  durationSeconds: number;
  passThresholdCorrect: number;
  maxErrors: number;
}

/** A, B, AM, A1, A2, B1 */
export const AB_GROUP_CATEGORIES = ['A', 'B', 'AM', 'A1', 'A2', 'B1'];
export const AB_GROUP_CONFIG: ExamConfigDefaults = {
  totalQuestions: 24,
  durationSeconds: 1800,
  passThresholdCorrect: 22,
  maxErrors: 2,
};

/** BE, C, CE, D, F */
export const BCDF_GROUP_CATEGORIES = ['BE', 'C', 'CE', 'D', 'F'];
export const BCDF_GROUP_CONFIG: ExamConfigDefaults = {
  totalQuestions: 30,
  durationSeconds: 2280,
  passThresholdCorrect: 27,
  maxErrors: 3,
};

/** CE, DE */
export const CEDE_GROUP_CATEGORIES = ['CE', 'DE'];
export const CEDE_GROUP_CONFIG: ExamConfigDefaults = {
  totalQuestions: 36,
  durationSeconds: 2700,
  passThresholdCorrect: 32,
  maxErrors: 4,
};

export function getDefaultConfigForCategory(
  categoryCode: string,
): ExamConfigDefaults {
  if (AB_GROUP_CATEGORIES.includes(categoryCode)) return AB_GROUP_CONFIG;
  if (CEDE_GROUP_CATEGORIES.includes(categoryCode)) return CEDE_GROUP_CONFIG;
  if (BCDF_GROUP_CATEGORIES.includes(categoryCode)) return BCDF_GROUP_CONFIG;
  return AB_GROUP_CONFIG;
}
