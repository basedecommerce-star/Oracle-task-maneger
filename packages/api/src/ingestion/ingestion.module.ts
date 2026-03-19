import { Module } from '@nestjs/common';
import { IngestionService } from './pipeline/ingestion.service';
import { HtmlParserService } from './parsers/html-parser.service';
import { VisualParserService } from './parsers/visual-parser.service';
import { ReconcilerService } from './reconciler/reconciler.service';
import { QuestionValidatorService } from './validators/question-validator.service';
import { ConfidenceScorerService } from './confidence/confidence-scorer.service';

@Module({
  providers: [
    IngestionService,
    HtmlParserService,
    VisualParserService,
    ReconcilerService,
    QuestionValidatorService,
    ConfidenceScorerService,
  ],
  exports: [IngestionService],
})
export class IngestionModule {}
