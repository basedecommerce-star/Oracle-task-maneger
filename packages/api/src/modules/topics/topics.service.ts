import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TopicsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.topic.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findByCode(code: string) {
    return this.prisma.topic.findUnique({
      where: { code },
    });
  }
}
