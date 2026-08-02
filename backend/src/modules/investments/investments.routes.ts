import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { sendSuccess } from '../../common/response.js';
import { prisma } from '../../config/database.config.js';
import { NotFoundError } from '../../common/errors.js';

const router = Router();

// GET /api/v1/investments - List investment portfolio
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const investments = await prisma.investment.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    let totalInvested = 0;
    let currentValue = 0;

    const items = investments.map((inv) => {
      const qty = Number(inv.quantity);
      const buyPrice = Number(inv.buyPrice);
      const currPrice = Number(inv.currentPrice);
      const costBasis = qty * buyPrice;
      const marketVal = qty * currPrice;
      const gainLoss = marketVal - costBasis;
      const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

      totalInvested += costBasis;
      currentValue += marketVal;

      return {
        ...inv,
        costBasis,
        marketValue: marketVal,
        gainLoss,
        gainLossPercent,
      };
    });

    const totalGainLoss = currentValue - totalInvested;
    const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

    sendSuccess(res, {
      items,
      summary: {
        totalInvested,
        currentValue,
        totalGainLoss,
        totalGainLossPercent,
      },
    }, 'Investments portfolio fetched successfully');
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/investments - Add new investment asset
router.post('/', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { name, symbol, type, quantity, buyPrice, currentPrice } = req.body;

    const investment = await prisma.investment.create({
      data: {
        userId,
        name,
        symbol: symbol ? symbol.toUpperCase() : null,
        type: type || 'stock',
        quantity: Number(quantity),
        buyPrice: Number(buyPrice),
        currentPrice: currentPrice !== undefined ? Number(currentPrice) : Number(buyPrice),
      },
    });

    sendSuccess(res, investment, 'Investment added successfully', 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/investments/:id - Update investment
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { name, symbol, type, quantity, buyPrice, currentPrice } = req.body;

    const existing = await prisma.investment.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundError('Investment asset not found');
    }

    const updated = await prisma.investment.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        symbol: symbol !== undefined ? symbol.toUpperCase() : existing.symbol,
        type: type !== undefined ? type : existing.type,
        quantity: quantity !== undefined ? Number(quantity) : existing.quantity,
        buyPrice: buyPrice !== undefined ? Number(buyPrice) : existing.buyPrice,
        currentPrice: currentPrice !== undefined ? Number(currentPrice) : existing.currentPrice,
      },
    });

    sendSuccess(res, updated, 'Investment updated successfully');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/investments/:id - Remove asset
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const existing = await prisma.investment.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundError('Investment asset not found');
    }

    await prisma.investment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    sendSuccess(res, null, 'Investment removed successfully');
  } catch (err) {
    next(err);
  }
});

export default router;
