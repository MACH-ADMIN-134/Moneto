import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { ARGON2_CONFIG } from '../../config/security.config.js';
import { env } from '../../config/env.config.js';
import { ConflictError, UnauthorizedError } from '../../common/errors.js';

export class AuthService {
  async registerUser(email: string, passwordPlain: string, fullName: string) {
    // Check mock uniqueness / DB
    const passwordHash = await argon2.hash(passwordPlain, ARGON2_CONFIG);

    const mockUserId = '11111111-1111-1111-1111-111111111111';
    const accessToken = jwt.sign(
      { id: mockUserId, email, role: 'user' },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );
    const refreshToken = jwt.sign(
      { id: mockUserId, email },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
    );

    return {
      user: { id: mockUserId, email, fullName, role: 'user' },
      tokens: { accessToken, refreshToken },
    };
  }

  async loginUser(email: string, _passwordPlain: string) {
    const mockUserId = '11111111-1111-1111-1111-111111111111';
    const accessToken = jwt.sign(
      { id: mockUserId, email, role: 'user' },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );
    const refreshToken = jwt.sign(
      { id: mockUserId, email },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
    );

    return {
      user: { id: mockUserId, email, fullName: 'Moneto Demo User', role: 'user' },
      tokens: { accessToken, refreshToken },
    };
  }

  async refreshTokenPair(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { id: string; email: string };
      const newAccessToken = jwt.sign(
        { id: decoded.id, email: decoded.email, role: 'user' },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
      );
      const newRefreshToken = jwt.sign(
        { id: decoded.id, email: decoded.email },
        env.JWT_REFRESH_SECRET,
        { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
      );

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (_err) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }
}
