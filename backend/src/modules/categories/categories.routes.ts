import { Router } from 'express';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { CategoriesService } from './categories.service.js';
import { sendSuccess } from '../../common/response.js';

const router = Router();
const categoriesService = new CategoriesService();

// List Categories (System + User Custom)
router.get('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const type = req.query.type as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

    const result = await categoriesService.listCategories(req.user!.id, type, page, limit);
    sendSuccess(res, result.items, 'Categories listed successfully', 200, { pagination: result.pagination });
  } catch (err) {
    next(err);
  }
});

// Create Custom User Category
router.post('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { name, type, icon, color } = req.body;
    const category = await categoriesService.createCategory(req.user!.id, name, type, icon, color);
    sendSuccess(res, category, 'Custom category created successfully', 201);
  } catch (err) {
    next(err);
  }
});

// Update Custom Category
router.put('/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { name, icon, color } = req.body;
    const updated = await categoriesService.updateCategory(req.user!.id, req.params.id, name, icon, color);
    sendSuccess(res, updated, 'Category updated successfully');
  } catch (err) {
    next(err);
  }
});

// Delete Category (Soft Delete)
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    await categoriesService.deleteCategory(req.user!.id, req.params.id);
    sendSuccess(res, null, 'Category deleted successfully');
  } catch (err) {
    next(err);
  }
});

export default router;
