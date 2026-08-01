import argon2 from 'argon2';
import { prisma } from '../../config/database.config.js';
import { ARGON2_CONFIG } from '../../config/security.config.js';
import { NotFoundError, UnauthorizedError } from '../../common/errors.js';
import { storageService } from '../../services/storage.service.js';

export class UsersService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { settings: true },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundError('User profile not found');
    }

    const { passwordHash: _, ...profile } = user;
    return profile;
  }

  async updateProfile(userId: string, fullName?: string, avatarUrl?: string) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName ? { fullName } : {}),
        ...(avatarUrl ? { avatarUrl } : {}),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        status: true,
      },
    });

    return updated;
  }

  async changePassword(userId: string, oldPasswordPlain: string, newPasswordPlain: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');

    const isValid = await argon2.verify(user.passwordHash, oldPasswordPlain);
    if (!isValid) throw new UnauthorizedError('Incorrect current password');

    const newPasswordHash = await argon2.hash(newPasswordPlain, ARGON2_CONFIG);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // Revoke all sessions on password change
    await prisma.userSession.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    return true;
  }

  async updatePreferences(userId: string, preferences: {
    theme?: string;
    defaultCurrency?: string;
    emailNotifications?: boolean;
    pushNotifications?: boolean;
  }) {
    const updated = await prisma.userSetting.upsert({
      where: { userId },
      update: preferences,
      create: {
        userId,
        ...preferences,
      },
    });

    return updated;
  }

  async uploadAvatar(userId: string, fileBuffer: Buffer, fileName: string, mimeType: string) {
    const avatarUrl = await storageService.uploadFile(fileBuffer, fileName, mimeType);
    return this.updateProfile(userId, undefined, avatarUrl);
  }

  async getUserSessions(userId: string) {
    const sessions = await prisma.userSession.findMany({
      where: {
        userId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sessions;
  }

  async revokeSession(userId: string, sessionId: string) {
    await prisma.userSession.updateMany({
      where: { id: sessionId, userId },
      data: { isRevoked: true },
    });
    return true;
  }

  async revokeAllSessions(userId: string) {
    await prisma.userSession.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
    return true;
  }
}
