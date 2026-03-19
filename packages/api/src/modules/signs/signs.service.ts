import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SignsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: { signType?: string; lang?: string }) {
    const { signType, lang = 'ru' } = params;

    const where: Prisma.SignWhereInput = {};
    if (signType) where.signType = signType as Prisma.EnumSignTypeFilter['equals'];

    return this.prisma.sign.findMany({
      where,
      include: {
        translations: {
          where: { language: lang },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
