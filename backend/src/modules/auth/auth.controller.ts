import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { sendSuccess } from '../../common/response.js';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, fullName } = req.body;
      const ipAddress = req.ip || '127.0.0.1';
      const userAgent = req.get('user-agent') || 'Unknown';

      const result = await authService.registerUser(email, password, fullName, ipAddress, userAgent);
      sendSuccess(res, result, 'User registered successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || '127.0.0.1';
      const userAgent = req.get('user-agent') || 'Unknown';

      const result = await authService.loginUser(email, password, ipAddress, userAgent);
      sendSuccess(res, result, 'Login successful', 200);
    } catch (err) {
      next(err);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const ipAddress = req.ip || '127.0.0.1';
      const userAgent = req.get('user-agent') || 'Unknown';

      const tokens = await authService.refreshTokenPair(refreshToken, ipAddress, userAgent);
      sendSuccess(res, tokens, 'Tokens refreshed successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      await authService.logoutUser(refreshToken);
      sendSuccess(res, null, 'Logged out successfully', 200);
    } catch (err) {
      next(err);
    }
  }
}
