import { Injectable } from '@nestjs/common';
import { ComplaintType, ReportStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReport(data: {
    questionId: string;
    userId: string;
    complaintType: string;
    comment?: string;
  }) {
    return this.prisma.questionReport.create({
      data: {
        questionId: data.questionId,
        userId: data.userId,
        complaintType: data.complaintType as ComplaintType,
        comment: data.comment,
        status: 'OPEN',
      },
    });
  }

  async findOpenReports() {
    return this.prisma.questionReport.findMany({
      where: { status: 'OPEN' },
      include: {
        question: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateReportStatus(reportId: string, status: string) {
    return this.prisma.questionReport.update({
      where: { id: reportId },
      data: { status: status as ReportStatus },
    });
  }
}
