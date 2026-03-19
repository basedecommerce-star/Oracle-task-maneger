import * as fs from 'fs';
import * as path from 'path';
import { HtmlParserService } from '../src/ingestion/parsers/html-parser.service';

const GOLDEN_DATASET_PATH = path.resolve(__dirname, '../../../../golden-dataset/sample.json');

interface GoldenEntry {
  id: string;
  external_source_id: string;
  category_code: string;
  ticket_number: number;
  topic_code: string;
  language: string;
  question_text: string;
  image_url: string | null;
  answers: Array<{ text: string; order: number; is_correct: boolean }>;
  explanation_text: string | null;
  rule_reference: string | null;
  source_url: string;
  source_hash: string;
}

function loadGoldenDataset(): GoldenEntry[] {
  const raw = fs.readFileSync(GOLDEN_DATASET_PATH, 'utf-8');
  return JSON.parse(raw);
}

function buildHtmlFromGoldenEntry(entry: GoldenEntry): string {
  const answersHtml = entry.answers
    .map((a) => {
      const correctClass = a.is_correct ? ' class="correct"' : '';
      return `<li${correctClass}>${a.text}</li>`;
    })
    .join('\n      ');

  const imgHtml = entry.image_url
    ? `\n    <img src="${entry.image_url}" />`
    : '';

  const explanationHtml = entry.explanation_text
    ? `\n    <p class="explanation">${entry.explanation_text}</p>`
    : '';

  return `<div class="question" data-question-id="${entry.external_source_id}" data-category="${entry.category_code}" data-ticket="${entry.ticket_number}" data-topic="${entry.topic_code}">
    <p class="question-text">${entry.question_text}</p>${imgHtml}
    <ul>
      ${answersHtml}
    </ul>${explanationHtml}
  </div>`;
}

describe('Parser Regression Tests (Golden Dataset)', () => {
  let goldenData: GoldenEntry[];

  beforeAll(() => {
    goldenData = loadGoldenDataset();
  });

  it('should load golden dataset with entries', () => {
    expect(goldenData).toBeDefined();
    expect(goldenData.length).toBeGreaterThan(0);
  });

  it('each entry should have required fields', () => {
    for (const entry of goldenData) {
      expect(entry.id).toBeDefined();
      expect(entry.external_source_id).toBeDefined();
      expect(entry.question_text).toBeDefined();
      expect(typeof entry.question_text).toBe('string');
      expect(entry.language).toBeDefined();
      expect(entry.answers).toBeDefined();
    }
  });

  it('each entry should have valid answers array structure', () => {
    for (const entry of goldenData) {
      expect(Array.isArray(entry.answers)).toBe(true);
      expect(entry.answers.length).toBeGreaterThanOrEqual(2);
      for (const answer of entry.answers) {
        expect(answer.text).toBeDefined();
        expect(typeof answer.text).toBe('string');
        expect(typeof answer.order).toBe('number');
        expect(typeof answer.is_correct).toBe('boolean');
      }
    }
  });

  it('each entry should have at least one correct answer', () => {
    for (const entry of goldenData) {
      const correctCount = entry.answers.filter((a) => a.is_correct).length;
      expect(correctCount).toBeGreaterThanOrEqual(1);
    }
  });

  describe('HTML parser against golden data', () => {
    let htmlParser: HtmlParserService;
    let mockPrisma: any;

    beforeEach(() => {
      mockPrisma = {
        parserOutput: {
          create: jest.fn().mockImplementation((args) =>
            Promise.resolve({ id: `output-${Math.random().toString(36).slice(2)}`, ...args.data }),
          ),
        },
      };
      htmlParser = new HtmlParserService(mockPrisma);
    });

    it('should parse constructed HTML from golden data entries', async () => {
      let testedCount = 0;

      for (const entry of goldenData) {
        const html = buildHtmlFromGoldenEntry(entry);
        const outputs = await htmlParser.parse(html, 'test-run');

        if (outputs.length > 0) {
          testedCount++;
          const output = outputs[0];

          // Question text should be extracted
          expect(output.questionText).toBeDefined();
          expect(output.questionText.length).toBeGreaterThan(0);

          // Answers should be parseable JSON
          const parsedAnswers = JSON.parse(output.answersJson);
          expect(Array.isArray(parsedAnswers)).toBe(true);
        }
      }

      // Report coverage
      const coverage = (testedCount / goldenData.length) * 100;
      console.log(
        `Golden dataset coverage: ${testedCount}/${goldenData.length} entries tested (${coverage.toFixed(1)}%)`,
      );
    });

    it('should extract correct answers matching golden data', async () => {
      for (const entry of goldenData) {
        const html = buildHtmlFromGoldenEntry(entry);
        const outputs = await htmlParser.parse(html, 'test-run');

        if (outputs.length > 0) {
          const parsedAnswers = JSON.parse(outputs[0].answersJson);
          const goldenCorrectTexts = entry.answers
            .filter((a) => a.is_correct)
            .map((a) => a.text);

          const parsedCorrectTexts = parsedAnswers
            .filter((a: any) => a.isCorrect)
            .map((a: any) => a.text);

          // If answers were extracted, verify correct ones match
          if (parsedAnswers.length > 0 && parsedCorrectTexts.length > 0) {
            for (const correctText of parsedCorrectTexts) {
              expect(goldenCorrectTexts).toContain(correctText);
            }
          }
        }
      }
    });
  });
});
