import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { sendSuccess } from '../../common/response.js';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, fullName } = req.body;
      const result = await authService.registerUser(email, password, fullName);
      sendSuccess(res, result, 'User registered successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.loginUser(email, password);
      sendSuccess(res, result, 'Login successful', 200);
    } catch (err) {
      next(err);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshTokenPair(refreshToken);
      sendSuccess(res, tokens, 'Tokens refreshed successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, null, 'Logged out successfully', 200);
    } catch (err) {
      next(err);
    }
  }
}
