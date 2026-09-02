import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import { authenticate } from "../../middleware/auth";
import { NotFoundError, ValidationError } from "../../shared/errors";

const router = Router();

// 1. Get User Wallet & Transactions
router.get("/wallet", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = await prisma.cineCoinWallet.findUnique({
      where: { userId: req.user!.userId },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 20
        }
      }
    });

    if (!wallet) {
      throw new NotFoundError("CineCoin Wallet for user", req.user!.userId);
    }

    return res.json({
      success: true,
      data: {
        balance: wallet.balance,
        lifetimeEarned: wallet.lifetimeEarned,
        totalRedeemed: wallet.totalRedeemed,
        transactions: wallet.transactions
      }
    });
  } catch (error) {
    next(error);
  }
});

// 2. Redeem Coins
router.post("/redeem", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, reason } = req.body;
    const coins = Number(amount);
    if (!coins || coins <= 0) {
      throw new ValidationError("Redemption amount must be greater than 0");
    }

    const wallet = await prisma.cineCoinWallet.findUnique({
      where: { userId: req.user!.userId }
    });

    if (!wallet || wallet.balance < coins) {
      throw new ValidationError("Insufficient CineCoins balance");
    }

    const updated = await prisma.$transaction([
      prisma.cineCoinWallet.update({
        where: { id: wallet.id },
        data: {
          balance: { decrement: coins },
          totalRedeemed: { increment: coins }
        }
      }),
      prisma.cineCoinTransaction.create({
        data: {
          walletId: wallet.id,
          amount: -coins,
          type: "REDEEMED",
          description: reason || "Ticket discount redemption"
        }
      })
    ]);

    return res.json({
      success: true,
      message: `Redeemed ${coins} CineCoins successfully`,
      data: { newBalance: updated[0].balance }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
