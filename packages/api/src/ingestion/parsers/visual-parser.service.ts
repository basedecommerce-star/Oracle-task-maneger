import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ParsedOutput } from './html-parser.service';

/**
 * Visual/OCR parser – Step 3 of the ingestion pipeline.
 * Extracts questions from screenshots using OCR.
 *
 * This is a stub implementation. In production, this would integrate
 * with Tesseract OCR or a cloud OCR service.
 */
@Injectable()
export class VisualParserService {
  private readonly logger = new Logger(VisualParserService.name);

  constructor(private readonly prisma: PrismaService) {}

  async parse(screenshotKey: string, parserRunId: string): Promise<ParsedOutput[]> {
    if (!screenshotKey) {
      this.logger.warn('No screenshot key provided, skipping visual parse');
      return [];
    }

    this.logger.log(`Visual parser stub: would process screenshot ${screenshotKey}`);

    // Stub: In production, this would:
    // 1. Download the screenshot from S3 using the screenshotKey
    // 2. Run OCR (Tesseract with ron+rus language support)
    // 3. Parse the OCR text to extract questions
    // 4. Return ParsedOutput[] with lower confidence scores than HTML parser

    return [];
  }
}
