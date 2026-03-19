import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId?: string) {
    if (!userId) throw new NotFoundException('User not found');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { category: true },
    });
    if (!user) throw new NotFoundException('User not found');

    return this.toUserResponse(user);
  }

  async updateSettings(
    userId: string | undefined,
    settings: { languageCode?: string; categoryId?: string },
  ) {
    if (!userId) throw new NotFoundException('User not found');

    const data: Record<string, string> = {};
    if (settings.languageCode) {
      data.languageCode = settings.languageCode;
      data.preferredLang = settings.languageCode;
    }
    if (settings.categoryId) data.categoryId = settings.categoryId;

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
      include: { category: true },
    });

    return this.toUserResponse(updated);
  }

  private toUserResponse(user: {
    id: string;
    telegramId: bigint;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    languageCode: string;
    preferredLang: string;
    categoryId: string | null;
    createdAt: Date;
    updatedAt: Date;
    category?: unknown;
  }) {
    return {
      id: user.id,
      telegramId: Number(user.telegramId),
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      languageCode: user.languageCode,
      preferredLang: user.preferredLang,
      categoryId: user.categoryId,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
