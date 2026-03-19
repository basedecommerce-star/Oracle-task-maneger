import { Module } from '@nestjs/common';
import { SignsController } from './signs.controller';
import { SignsService } from './signs.service';

@Module({
  controllers: [SignsController],
  providers: [SignsService],
  exports: [SignsService],
})
export class SignsModule {}
