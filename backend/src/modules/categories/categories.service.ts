import { prisma } from '../../config/database.config.js';
import { ForbiddenError, NotFoundError } from '../../common/errors.js';

export class CategoriesService {
  async listCategories(userId: string, type?: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const whereClause = {
      deletedAt: null,
      OR: [
        { isSystem: true },
        { userId },
      ],
      ...(type ? { type } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.category.findMany({
        where: whereClause,
        orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
        skip,
        take: limit,
      }),
      prisma.category.count({ where: whereClause }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createCategory(userId: string, name: string, type: string, icon = 'folder', color = '#10B981') {
    const category = await prisma.category.create({
      data: {
        userId,
        name,
        type,
        icon,
        color,
        isSystem: false,
      },
    });
    return category;
  }

  async updateCategory(userId: string, categoryId: string, name?: string, icon?: string, color?: string) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.deletedAt) {
      throw new NotFoundError('Category not found');
    }

    if (category.isSystem) {
      throw new ForbiddenError('System categories are protected and cannot be modified');
    }

    if (category.userId !== userId) {
      throw new ForbiddenError('You do not have permission to modify this category');
    }

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(name ? { name } : {}),
        ...(icon ? { icon } : {}),
        ...(color ? { color } : {}),
      },
    });

    return updated;
  }

  async deleteCategory(userId: string, categoryId: string) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.deletedAt) {
      throw new NotFoundError('Category not found');
    }

    if (category.isSystem) {
      throw new ForbiddenError('System categories are protected and cannot be deleted');
    }

    if (category.userId !== userId) {
      throw new ForbiddenError('You do not have permission to delete this category');
    }

    await prisma.category.update({
      where: { id: categoryId },
      data: { deletedAt: new Date() },
    });

    return true;
  }
}
