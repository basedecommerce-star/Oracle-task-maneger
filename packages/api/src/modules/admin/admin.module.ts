import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PublicationPolicyService } from '../../ingestion/pipeline/publication-policy.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, PublicationPolicyService],
  exports: [AdminService],
})
export class AdminModule {}
