import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface ParsedOutput {
  id: string;
  parserRunId: string;
  externalSourceId?: string;
  categoryCode?: string;
  ticketNumber?: number;
  topicCode?: string;
  language: string;
  questionText: string;
  imageUrl?: string;
  answersJson: string;
  explanationText?: string;
  ruleReference?: string;
  rawFragment?: string;
  confidenceScore: number;
}

/**
 * HTML DOM parser – Step 2 of the ingestion pipeline.
 * Extracts questions from raw HTML content using deterministic parsing.
 */
@Injectable()
export class HtmlParserService {
  private readonly logger = new Logger(HtmlParserService.name);

  constructor(private readonly prisma: PrismaService) {}

  async parse(htmlContent: string, parserRunId: string): Promise<ParsedOutput[]> {
    if (!htmlContent || htmlContent.trim().length === 0) {
      this.logger.warn('Empty HTML content, skipping parse');
      return [];
    }

    const outputs: ParsedOutput[] = [];
    const questionBlocks = this.extractQuestionBlocks(htmlContent);

    for (const block of questionBlocks) {
      const parsed = this.parseQuestionBlock(block);
      if (!parsed) continue;

      const output = await this.prisma.parserOutput.create({
        data: {
          parserRunId,
          externalSourceId: parsed.externalSourceId,
          categoryCode: parsed.categoryCode,
          ticketNumber: parsed.ticketNumber,
          topicCode: parsed.topicCode,
          language: parsed.language || 'ru',
          questionText: parsed.questionText,
          imageUrl: parsed.imageUrl,
          answersJson: JSON.stringify(parsed.answers),
          explanationText: parsed.explanationText,
          ruleReference: parsed.ruleReference,
          rawFragment: block,
        },
      });

      outputs.push({
        id: output.id,
        parserRunId,
        externalSourceId: parsed.externalSourceId ?? undefined,
        categoryCode: parsed.categoryCode ?? undefined,
        ticketNumber: parsed.ticketNumber ?? undefined,
        topicCode: parsed.topicCode ?? undefined,
        language: parsed.language || 'ru',
        questionText: parsed.questionText,
        imageUrl: parsed.imageUrl ?? undefined,
        answersJson: JSON.stringify(parsed.answers),
        explanationText: parsed.explanationText ?? undefined,
        ruleReference: parsed.ruleReference ?? undefined,
        rawFragment: block,
        confidenceScore: 1.0, // HTML parsing is deterministic
      });
    }

    this.logger.log(`HTML parser extracted ${outputs.length} questions`);
    return outputs;
  }

  /**
   * Extract individual question blocks from HTML.
   * Supports common patterns from PDD Moldova sources.
   */
  private extractQuestionBlocks(html: string): string[] {
    const blocks: string[] = [];

    // Pattern 1: div.question or div.test-question blocks
    const questionRegex =
      /<div[^>]*class="[^"]*(?:question|test-item|bilet-question)[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?=<div[^>]*class="[^"]*(?:question|test-item|bilet-question)|$)/gi;
    let match: RegExpExecArray | null;
    while ((match = questionRegex.exec(html)) !== null) {
      blocks.push(match[0]);
    }

    // Pattern 2: numbered question blocks (e.g., <p>1. Вопрос...</p>)
    if (blocks.length === 0) {
      const numberedRegex =
        /(<(?:p|div)[^>]*>\s*\d+\.\s*[\s\S]*?)(?=<(?:p|div)[^>]*>\s*\d+\.\s*|$)/gi;
      while ((match = numberedRegex.exec(html)) !== null) {
        blocks.push(match[0]);
      }
    }

    return blocks;
  }

  private parseQuestionBlock(block: string): {
    externalSourceId?: string | null;
    categoryCode?: string | null;
    ticketNumber?: number | null;
    topicCode?: string | null;
    language?: string;
    questionText: string;
    imageUrl?: string | null;
    answers: Array<{ text: string; order: number; isCorrect: boolean }>;
    explanationText?: string | null;
    ruleReference?: string | null;
  } | null {
    // Extract question text (strip HTML tags for clean text)
    const questionTextMatch = block.match(
      /<(?:p|span|div)[^>]*class="[^"]*(?:question-text|q-text)[^"]*"[^>]*>([\s\S]*?)<\/(?:p|span|div)>/i,
    );
    const questionText = questionTextMatch
      ? this.stripHtml(questionTextMatch[1]).trim()
      : this.stripHtml(block.split(/<(?:ul|ol|div[^>]*class="[^"]*answer)/i)[0] || '').trim();

    if (!questionText || questionText.length < 5) return null;

    // Extract image URL
    const imgMatch = block.match(/<img[^>]*src="([^"]+)"[^>]*>/i);
    const imageUrl = imgMatch ? imgMatch[1] : null;

    // Extract answers
    const answers: Array<{ text: string; order: number; isCorrect: boolean }> = [];
    const answerRegex =
      /<li[^>]*(?:class="[^"]*(?:correct|right|answer)[^"]*")?[^>]*>([\s\S]*?)<\/li>/gi;
    let answerMatch: RegExpExecArray | null;
    let order = 1;
    while ((answerMatch = answerRegex.exec(block)) !== null) {
      const isCorrect =
        /class="[^"]*(?:correct|right|true)[^"]*"/i.test(answerMatch[0]) ||
        /data-correct="true"/i.test(answerMatch[0]);
      answers.push({
        text: this.stripHtml(answerMatch[1]).trim(),
        order: order++,
        isCorrect,
      });
    }

    // Extract explanation
    const explMatch = block.match(
      /<(?:p|div|span)[^>]*class="[^"]*(?:explanation|hint|comment)[^"]*"[^>]*>([\s\S]*?)<\/(?:p|div|span)>/i,
    );
    const explanationText = explMatch ? this.stripHtml(explMatch[1]).trim() : null;

    // Extract data attributes for metadata
    const idMatch = block.match(/data-(?:question-)?id="([^"]+)"/i);
    const catMatch = block.match(/data-category="([^"]+)"/i);
    const ticketMatch = block.match(/data-ticket="(\d+)"/i);
    const topicMatch = block.match(/data-topic="([^"]+)"/i);

    return {
      externalSourceId: idMatch ? idMatch[1] : null,
      categoryCode: catMatch ? catMatch[1] : null,
      ticketNumber: ticketMatch ? parseInt(ticketMatch[1], 10) : null,
      topicCode: topicMatch ? topicMatch[1] : null,
      language: 'ru',
      questionText,
      imageUrl,
      answers,
      explanationText,
      ruleReference: null,
    };
  }

  private stripHtml(html: string): string {
    // Loop until no more HTML tags remain to prevent nested tag bypass
    let result = html;
    let previous: string;
    do {
      previous = result;
      result = result.replace(/<[^>]+>/g, '');
    } while (result !== previous);
    return result.replace(/\s+/g, ' ');
  }
}
