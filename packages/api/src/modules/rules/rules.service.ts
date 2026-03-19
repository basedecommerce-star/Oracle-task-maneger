import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RulesService {
  constructor(private readonly prisma: PrismaService) {}

  async search(params: { query?: string; chapterCode?: string; lang?: string }) {
    const { query, chapterCode, lang = 'ru' } = params;

    const where: Prisma.RuleWhereInput = {};
    if (chapterCode) where.chapterCode = chapterCode;

    const rules = await this.prisma.rule.findMany({
      where,
      include: {
        translations: {
          where: { language: lang },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    if (query) {
      const lowerQuery = query.toLowerCase();
      return rules.filter((rule) =>
        rule.translations.some(
          (t) =>
            t.title.toLowerCase().includes(lowerQuery) ||
            t.content.toLowerCase().includes(lowerQuery),
        ),
      );
    }

    return rules;
  }
}
