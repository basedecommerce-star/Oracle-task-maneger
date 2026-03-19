import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ParsedOutput } from './html-parser.service';

/**
 * Feature flag controlling whether the visual/OCR parser is active.
 * Set to `true` once OCR integration (Tesseract / cloud) is production-ready.
 */
const VISUAL_PARSER_ENABLED =
  process.env.VISUAL_PARSER_ENABLED === 'true' || false;

export interface VisualParserResult {
  outputs: ParsedOutput[];
  enabled: boolean;
  status: 'ok' | 'disabled' | 'skipped';
}

/**
 * Visual/OCR parser – Step 3 of the ingestion pipeline.
 * Extracts questions from screenshots using OCR.
 *
 * This is a stub implementation behind a feature flag.
 * When disabled the pipeline runs in single-parser mode.
 */
@Injectable()
export class VisualParserService {
  private readonly logger = new Logger(VisualParserService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Whether the visual parser feature flag is on. */
  isEnabled(): boolean {
    return VISUAL_PARSER_ENABLED;
  }

  async parse(
    screenshotKey: string,
    parserRunId: string,
  ): Promise<VisualParserResult> {
    if (!VISUAL_PARSER_ENABLED) {
      this.logger.warn(
        'Visual parser is disabled by feature flag VISUAL_PARSER_ENABLED. ' +
          'Pipeline will run in single-parser mode.',
      );
      return { outputs: [], enabled: false, status: 'disabled' };
    }

    if (!screenshotKey) {
      this.logger.warn('No screenshot key provided, skipping visual parse');
      return { outputs: [], enabled: true, status: 'skipped' };
    }

    this.logger.log(
      `Visual parser stub: would process screenshot ${screenshotKey}`,
    );

    // Stub: In production, this would:
    // 1. Download the screenshot from S3 using the screenshotKey
    // 2. Run OCR (Tesseract with ron+rus language support)
    // 3. Parse the OCR text to extract questions
    // 4. Return ParsedOutput[] with lower confidence scores than HTML parser

    return { outputs: [], enabled: true, status: 'ok' };
  }
}
