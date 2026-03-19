import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('import/source-snapshot')
  async importSourceSnapshot(
    @Body()
    body: {
      sourceProviderId: string;
      sourceUrl: string;
      sourceType: string;
      rawContent?: string;
      storageKey?: string;
      screenshotKey?: string;
      parserVersion: string;
      adminUserId: string;
    },
  ) {
    return this.adminService.importSourceSnapshot(body);
  }

  @Post('parser/run')
  async runParser(
    @Body() body: { snapshotId: string; parserType: string },
  ) {
    return this.adminService.runParser(body.snapshotId, body.parserType);
  }

  @Get('conflicts')
  async getConflicts() {
    return this.adminService.getConflicts();
  }

  @Post('questions/:id/approve')
  async approveQuestion(
    @Param('id') id: string,
    @Body() body: { moderatorId: string; comment?: string },
  ) {
    return this.adminService.approveQuestion(id, body.moderatorId, body.comment);
  }

  @Post('questions/:id/reject')
  async rejectQuestion(
    @Param('id') id: string,
    @Body() body: { moderatorId: string; comment?: string },
  ) {
    return this.adminService.rejectQuestion(id, body.moderatorId, body.comment);
  }

  @Post('questions/:id/publish')
  async publishQuestion(
    @Param('id') id: string,
    @Body() body: { moderatorId: string },
  ) {
    return this.adminService.publishQuestion(id, body.moderatorId);
  }

  @Get('evidence/:id')
  async getEvidence(@Param('id') id: string) {
    return this.adminService.getEvidence(id);
  }
}
