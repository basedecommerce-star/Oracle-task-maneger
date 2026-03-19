import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { category: true },
    });
    if (!user) throw new NotFoundException('User not found');

    return {
      id: user.id,
      telegramId: user.telegramId.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      preferredLang: user.preferredLang,
      categoryId: user.categoryId,
      category: user.category,
      createdAt: user.createdAt,
    };
  }

  async updateSettings(
    userId: string,
    settings: { preferredLang?: string; categoryId?: string },
  ) {
    const data: { preferredLang?: string; categoryId?: string } = {};
    if (settings.preferredLang) data.preferredLang = settings.preferredLang;
    if (settings.categoryId) data.categoryId = settings.categoryId;

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
      include: { category: true },
    });

    return {
      id: updated.id,
      telegramId: updated.telegramId.toString(),
      firstName: updated.firstName,
      lastName: updated.lastName,
      username: updated.username,
      preferredLang: updated.preferredLang,
      categoryId: updated.categoryId,
      category: updated.category,
    };
  }
}
