import { Module } from '@nestjs/common';
import { IngestionService } from './pipeline/ingestion.service';
import { HtmlParserService } from './parsers/html-parser.service';
import { VisualParserService } from './parsers/visual-parser.service';
import { ReconcilerService } from './reconciler/reconciler.service';
import { QuestionValidatorService } from './validators/question-validator.service';
import { ConfidenceScorerService } from './confidence/confidence-scorer.service';
import { PublicationPolicyService } from './pipeline/publication-policy.service';

@Module({
  providers: [
    IngestionService,
    HtmlParserService,
    VisualParserService,
    ReconcilerService,
    QuestionValidatorService,
    ConfidenceScorerService,
    PublicationPolicyService,
  ],
  exports: [IngestionService, PublicationPolicyService],
})
export class IngestionModule {}
