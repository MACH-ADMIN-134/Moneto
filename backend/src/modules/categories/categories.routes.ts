import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { sendSuccess } from '../../common/response.js';

const router = Router();

router.get('/', authenticate, (_req, res, _next) => {
  sendSuccess(res, [
    { id: 'cat-1', name: 'Salary & Income', type: 'income', icon: 'briefcase', color: '#10B981', isSystem: true },
    { id: 'cat-2', name: 'Housing & Rent', type: 'expense', icon: 'home', color: '#EF4444', isSystem: true },
    { id: 'cat-3', name: 'Utilities & Bills', type: 'expense', icon: 'zap', color: '#F59E0B', isSystem: true },
    { id: 'cat-4', name: 'Groceries & Dining', type: 'expense', icon: 'shopping-cart', color: '#8B5CF6', isSystem: true },
  ], 'Categories listed');
});

export default router;
