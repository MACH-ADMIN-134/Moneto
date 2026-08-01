import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database.config.js';
import { ARGON2_CONFIG } from '../../config/security.config.js';
import { env } from '../../config/env.config.js';
import { ConflictError, UnauthorizedError } from '../../common/errors.js';
import { hashToken } from '../../services/crypto.service.js';

export class AuthService {
  async registerUser(email: string, passwordPlain: string, fullName: string, ipAddress = '127.0.0.1', userAgent = 'Unknown') {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictError('A user with this email address already exists');
    }

    const passwordHash = await argon2.hash(passwordPlain, ARGON2_CONFIG);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        fullName,
        role: 'user',
        status: 'active',
        settings: {
          create: {
            theme: 'system',
            defaultCurrency: 'USD',
          },
        },
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
    );

    const refreshTokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.userSession.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        ipAddress,
        userAgent,
        expiresAt,
      },
    });

    return {
      user,
      tokens: { accessToken, refreshToken },
    };
  }

  async loginUser(email: string, passwordPlain: string, ipAddress = '127.0.0.1', userAgent = 'Unknown') {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedError('Invalid email address or password');
    }

    const isValidPassword = await argon2.verify(user.passwordHash, passwordPlain);

    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email address or password');
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
    );

    const refreshTokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.userSession.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        ipAddress,
        userAgent,
        expiresAt,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        status: user.status,
      },
      tokens: { accessToken, refreshToken },
    };
  }

  async refreshTokenPair(refreshToken: string, ipAddress = '127.0.0.1', userAgent = 'Unknown') {
    let decoded: { id: string; email: string };
    try {
      decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { id: string; email: string };
    } catch (_err) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const currentHash = hashToken(refreshToken);

    const session = await prisma.userSession.findFirst({
      where: {
        userId: decoded.id,
        refreshTokenHash: currentHash,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      throw new UnauthorizedError('Revoked or invalid session token');
    }

    // Revoke old session (Rotation)
    await prisma.userSession.update({
      where: { id: session.id },
      data: { isRevoked: true },
    });

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedError('User account suspended or deleted');
    }

    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    const newRefreshToken = jwt.sign(
      { id: user.id, email: user.email },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
    );

    const newHash = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.userSession.create({
      data: {
        userId: user.id,
        refreshTokenHash: newHash,
        ipAddress,
        userAgent,
        expiresAt,
      },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logoutUser(refreshToken?: string) {
    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      await prisma.userSession.updateMany({
        where: { refreshTokenHash: tokenHash },
        data: { isRevoked: true },
      });
    }
    return true;
  }
}
