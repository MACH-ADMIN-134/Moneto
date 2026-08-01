import { Router } from 'express';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { UsersService } from './users.service.js';
import { sendSuccess } from '../../common/response.js';

const router = Router();
const usersService = new UsersService();

// Profile Details
router.get('/me', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const profile = await usersService.getProfile(req.user!.id);
    sendSuccess(res, profile, 'User profile retrieved');
  } catch (err) {
    next(err);
  }
});

// Update Profile
router.put('/me', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { fullName, avatarUrl } = req.body;
    const updated = await usersService.updateProfile(req.user!.id, fullName, avatarUrl);
    sendSuccess(res, updated, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
});

// Change Password
router.post('/me/change-password', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    await usersService.changePassword(req.user!.id, oldPassword, newPassword);
    sendSuccess(res, null, 'Password changed successfully. All other active sessions revoked.');
  } catch (err) {
    next(err);
  }
});

// Update Preferences
router.put('/me/preferences', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const updated = await usersService.updatePreferences(req.user!.id, req.body);
    sendSuccess(res, updated, 'User preferences updated successfully');
  } catch (err) {
    next(err);
  }
});

// List Active Sessions
router.get('/me/sessions', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const sessions = await usersService.getUserSessions(req.user!.id);
    sendSuccess(res, sessions, 'Active sessions listed successfully');
  } catch (err) {
    next(err);
  }
});

// Revoke Specific Session
router.post('/me/sessions/:sessionId/revoke', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    await usersService.revokeSession(req.user!.id, req.params.sessionId);
    sendSuccess(res, null, 'Session revoked successfully');
  } catch (err) {
    next(err);
  }
});

// Revoke All Sessions
router.post('/me/sessions/revoke-all', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    await usersService.revokeAllSessions(req.user!.id);
    sendSuccess(res, null, 'All active sessions revoked successfully');
  } catch (err) {
    next(err);
  }
});

export default router;
