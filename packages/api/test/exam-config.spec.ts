import {
  AB_GROUP_CATEGORIES,
  AB_GROUP_CONFIG,
  BCDF_GROUP_CATEGORIES,
  BCDF_GROUP_CONFIG,
  CEDE_GROUP_CATEGORIES,
  CEDE_GROUP_CONFIG,
  getDefaultConfigForCategory,
  ExamConfigDefaults,
} from '../src/config/exam-config.constants';

describe('ExamConfigConstants', () => {
  describe('AB group', () => {
    it('should include categories A, B, AM, A1, A2, B1', () => {
      expect(AB_GROUP_CATEGORIES).toEqual(['A', 'B', 'AM', 'A1', 'A2', 'B1']);
    });

    it('should have 24 questions, 1800s duration, pass=22, maxErrors=2', () => {
      expect(AB_GROUP_CONFIG).toEqual<ExamConfigDefaults>({
        totalQuestions: 24,
        durationSeconds: 1800,
        passThresholdCorrect: 22,
        maxErrors: 2,
      });
    });
  });

  describe('BCDF group', () => {
    it('should include categories BE, C, CE, D, F', () => {
      expect(BCDF_GROUP_CATEGORIES).toEqual(['BE', 'C', 'CE', 'D', 'F']);
    });

    it('should have 30 questions, 2280s duration, pass=27, maxErrors=3', () => {
      expect(BCDF_GROUP_CONFIG).toEqual<ExamConfigDefaults>({
        totalQuestions: 30,
        durationSeconds: 2280,
        passThresholdCorrect: 27,
        maxErrors: 3,
      });
    });
  });

  describe('CEDE group', () => {
    it('should include categories CE, DE', () => {
      expect(CEDE_GROUP_CATEGORIES).toEqual(['CE', 'DE']);
    });

    it('should have 36 questions, 2700s duration, pass=32, maxErrors=4', () => {
      expect(CEDE_GROUP_CONFIG).toEqual<ExamConfigDefaults>({
        totalQuestions: 36,
        durationSeconds: 2700,
        passThresholdCorrect: 32,
        maxErrors: 4,
      });
    });
  });

  describe('math invariants', () => {
    it.each([
      ['AB', AB_GROUP_CONFIG],
      ['BCDF', BCDF_GROUP_CONFIG],
      ['CEDE', CEDE_GROUP_CONFIG],
    ])(
      '%s config: totalQuestions = passThreshold + maxErrors',
      (_name, config) => {
        expect(config.totalQuestions).toBe(
          config.passThresholdCorrect + config.maxErrors,
        );
      },
    );
  });

  describe('getDefaultConfigForCategory', () => {
    it.each(['A', 'B', 'AM', 'A1', 'A2', 'B1'])(
      'returns AB config for category %s',
      (cat) => {
        expect(getDefaultConfigForCategory(cat)).toBe(AB_GROUP_CONFIG);
      },
    );

    it.each(['BE', 'D', 'F'])(
      'returns BCDF config for category %s',
      (cat) => {
        expect(getDefaultConfigForCategory(cat)).toBe(BCDF_GROUP_CONFIG);
      },
    );

    it.each(['DE'])('returns CEDE config for category %s', (cat) => {
      expect(getDefaultConfigForCategory(cat)).toBe(CEDE_GROUP_CONFIG);
    });

    it('CE is in both BCDF and CEDE — AB is checked first, then CEDE takes priority over BCDF', () => {
      // CE is in AB_GROUP_CATEGORIES? No. CE is in CEDE first, then BCDF.
      // The function checks AB -> CEDE -> BCDF, so CEDE wins for CE.
      const config = getDefaultConfigForCategory('CE');
      expect(config).toBe(CEDE_GROUP_CONFIG);
    });

    it('returns AB config as fallback for unknown category', () => {
      expect(getDefaultConfigForCategory('UNKNOWN')).toBe(AB_GROUP_CONFIG);
    });
  });
});
