import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(mode?: 'training' | 'exam') {
    const where: Record<string, boolean> = {};
    if (mode === 'training') {
      where.availableForTraining = true;
    } else if (mode === 'exam') {
      where.availableForExam = true;
    }

    return this.prisma.category.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: {
        examConfigs: {
          where: {
            activeTo: null,
          },
          take: 1,
        },
      },
    });
  }

  async findByCode(code: string) {
    return this.prisma.category.findUnique({
      where: { code },
      include: {
        examConfigs: {
          where: { activeTo: null },
          take: 1,
        },
      },
    });
  }
}
