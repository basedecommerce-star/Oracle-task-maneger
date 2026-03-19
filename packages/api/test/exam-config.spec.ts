import {
  AB_GROUP_CATEGORIES,
  AB_GROUP_CONFIG,
  BCDF_GROUP_CATEGORIES,
  BCDF_GROUP_CONFIG,
  CEDE_GROUP_CATEGORIES,
  CEDE_GROUP_CONFIG,
  ALL_EXAM_CATEGORIES,
  ALL_TRAINING_CATEGORIES,
  getDefaultConfigForCategory,
  ExamConfigDefaults,
} from '../src/config/exam-config.constants';

describe('ExamConfigConstants', () => {
  describe('AB group', () => {
    it('should include only AB', () => {
      expect(AB_GROUP_CATEGORIES).toEqual(['AB']);
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
    it('should include categories BE, C, D, F', () => {
      expect(BCDF_GROUP_CATEGORIES).toEqual(['BE', 'C', 'D', 'F']);
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

  describe('category lists', () => {
    it('ALL_EXAM_CATEGORIES should be AB, BE, C, CE, D, DE, F', () => {
      expect(ALL_EXAM_CATEGORIES).toEqual(['AB', 'BE', 'C', 'CE', 'D', 'DE', 'F']);
    });

    it('ALL_TRAINING_CATEGORIES should be AB, C, D, E, F', () => {
      expect(ALL_TRAINING_CATEGORIES).toEqual(['AB', 'C', 'D', 'E', 'F']);
    });

    it('E is training-only, not in any exam group', () => {
      expect(ALL_EXAM_CATEGORIES).not.toContain('E');
      expect(ALL_TRAINING_CATEGORIES).toContain('E');
    });

    it('BE, CE, DE are exam-only, not in training', () => {
      expect(ALL_EXAM_CATEGORIES).toContain('BE');
      expect(ALL_EXAM_CATEGORIES).toContain('CE');
      expect(ALL_EXAM_CATEGORIES).toContain('DE');
      expect(ALL_TRAINING_CATEGORIES).not.toContain('BE');
      expect(ALL_TRAINING_CATEGORIES).not.toContain('CE');
      expect(ALL_TRAINING_CATEGORIES).not.toContain('DE');
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
    it('returns AB config for category AB', () => {
      expect(getDefaultConfigForCategory('AB')).toBe(AB_GROUP_CONFIG);
    });

    it.each(['BE', 'C', 'D', 'F'])(
      'returns BCDF config for category %s',
      (cat) => {
        expect(getDefaultConfigForCategory(cat)).toBe(BCDF_GROUP_CONFIG);
      },
    );

    it.each(['CE', 'DE'])('returns CEDE config for category %s', (cat) => {
      expect(getDefaultConfigForCategory(cat)).toBe(CEDE_GROUP_CONFIG);
    });

    it('returns AB config as fallback for unknown category', () => {
      expect(getDefaultConfigForCategory('UNKNOWN')).toBe(AB_GROUP_CONFIG);
    });

    it('returns AB config as fallback for training-only category E', () => {
      // E has no exam config, so falls back to AB
      expect(getDefaultConfigForCategory('E')).toBe(AB_GROUP_CONFIG);
    });
  });
});
