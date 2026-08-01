import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { authRateLimiter } from '../../middleware/rateLimiter.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.schema.js';

const router = Router();
const controller = new AuthController();

router.post('/register', authRateLimiter, validateRequest(registerSchema), (req, res, next) => controller.register(req, res, next));
router.post('/login', authRateLimiter, validateRequest(loginSchema), (req, res, next) => controller.login(req, res, next));
router.post('/refresh', validateRequest(refreshTokenSchema), (req, res, next) => controller.refreshToken(req, res, next));
router.post('/logout', authenticate, (req, res, next) => controller.logout(req, res, next));

export default router;
