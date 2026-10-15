import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import { authenticate } from "../../middleware/auth";
import { NotFoundError, ValidationError } from "../../shared/errors";

const router = Router();

/**
 * Temporary feature gate guard for CineCoins December 2026 launch.
 * Mutating endpoints return 403 Forbidden with exact message:
 * { message: "CineCoins is launching soon and is currently disabled." }
 * When set to false for the December launch, endpoints become active.
 */
export const CINECOINS_PAUSED_FOR_DECEMBER = true;

export const gateCineCoinsMutations = (req: Request, res: Response, next: NextFunction) => {
  if (CINECOINS_PAUSED_FOR_DECEMBER) {
    return res.status(403).json({
      success: false,
      message: "CineCoins is launching soon and is currently disabled."
    });
  }
  next();
};

// 1. Temporary Mutation Guard:
// Intercept all mutating HTTP requests (POST, PUT, PATCH, DELETE) and return 403 Forbidden while paused for December launch
router.use((req: Request, res: Response, next: NextFunction) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    return gateCineCoinsMutations(req, res, next);
  }
  next();
});

// 2. Strict Authentication Middleware:
// Protect all /api/v1/cinecoins/* routes so guests can never claim coins or access wallet operations without signing in
router.use(authenticate);

// ==========================================
// CINECOINS ENDPOINTS (PRESERVED FOR DECEMBER LAUNCH)
// ==========================================

// 1. Get User Wallet & Transactions
router.get("/wallet", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    let wallet = await prisma.cineCoinWallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 20
        }
      }
    });

    if (!wallet) {
      // Auto-initialize wallet on first authenticated view
      wallet = await prisma.cineCoinWallet.create({
        data: {
          userId,
          balance: 100, // 100 welcome bonus coins
          lifetimeEarned: 100,
          totalRedeemed: 0,
          transactions: {
            create: {
              amount: 100,
              type: "EARNED",
              activityKey: "WELCOME_BONUS",
              description: "Welcome to CineCoins! Initial bonus credited."
            }
          }
        },
        include: {
          transactions: {
            orderBy: { createdAt: "desc" },
            take: 20
          }
        }
      });
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

// 2. Redeem Coins (e.g. for ticket discount or partner vouchers)
router.post("/redeem", async (req: Request, res: Response, next: NextFunction) => {
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

// 3. Claim Daily Coins
router.post("/claim-daily", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const dailyRewardAmount = 25;

    let wallet = await prisma.cineCoinWallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      wallet = await prisma.cineCoinWallet.create({
        data: { userId, balance: 0, lifetimeEarned: 0, totalRedeemed: 0 }
      });
    }

    const updated = await prisma.$transaction([
      prisma.cineCoinWallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: dailyRewardAmount },
          lifetimeEarned: { increment: dailyRewardAmount }
        }
      }),
      prisma.cineCoinTransaction.create({
        data: {
          walletId: wallet.id,
          amount: dailyRewardAmount,
          type: "EARNED",
          activityKey: "DAILY_LOGIN",
          description: "Daily check-in streak bonus"
        }
      })
    ]);

    return res.json({
      success: true,
      message: `Claimed +${dailyRewardAmount} daily CineCoins!`,
      data: { newBalance: updated[0].balance }
    });
  } catch (error) {
    next(error);
  }
});

// 4. Spin to Win
router.post("/spin", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { rewardCoins, rewardName } = req.body;
    const coins = Math.max(0, Number(rewardCoins) || 10);

    let wallet = await prisma.cineCoinWallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await prisma.cineCoinWallet.create({
        data: { userId, balance: 0, lifetimeEarned: 0, totalRedeemed: 0 }
      });
    }

    const updated = await prisma.$transaction([
      prisma.cineCoinWallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: coins },
          lifetimeEarned: { increment: coins }
        }
      }),
      prisma.cineCoinTransaction.create({
        data: {
          walletId: wallet.id,
          amount: coins,
          type: "EARNED",
          activityKey: "SPIN_WHEEL",
          description: `Spin Wheel: ${rewardName || "Lucky Spin Bonus"}`
        }
      })
    ]);

    return res.json({
      success: true,
      message: `Spin result awarded: ${coins} CineCoins!`,
      data: { newBalance: updated[0].balance }
    });
  } catch (error) {
    next(error);
  }
});

// 5. Send Coins (P2P Transfer)
router.post("/send", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const senderUserId = req.user!.userId;
    const { recipientEmail, amount, note } = req.body;
    const coins = Number(amount);

    if (!coins || coins <= 0) {
      throw new ValidationError("Transfer amount must be greater than 0");
    }
    if (!recipientEmail) {
      throw new ValidationError("Recipient email is required");
    }

    const senderWallet = await prisma.cineCoinWallet.findUnique({
      where: { userId: senderUserId }
    });

    if (!senderWallet || senderWallet.balance < coins) {
      throw new ValidationError("Insufficient CineCoins balance for transfer");
    }

    const recipientUser = await prisma.user.findUnique({
      where: { email: recipientEmail.toLowerCase() }
    });

    if (!recipientUser) {
      throw new NotFoundError("Recipient user with email", recipientEmail);
    }

    let recipientWallet = await prisma.cineCoinWallet.findUnique({
      where: { userId: recipientUser.id }
    });

    if (!recipientWallet) {
      recipientWallet = await prisma.cineCoinWallet.create({
        data: { userId: recipientUser.id, balance: 0, lifetimeEarned: 0, totalRedeemed: 0 }
      });
    }

    const updated = await prisma.$transaction([
      prisma.cineCoinWallet.update({
        where: { id: senderWallet.id },
        data: { balance: { decrement: coins } }
      }),
      prisma.cineCoinTransaction.create({
        data: {
          walletId: senderWallet.id,
          amount: -coins,
          type: "TRANSFER_SENT",
          description: `Transferred to ${recipientEmail}: ${note || "P2P Gift"}`
        }
      }),
      prisma.cineCoinWallet.update({
        where: { id: recipientWallet.id },
        data: {
          balance: { increment: coins },
          lifetimeEarned: { increment: coins }
        }
      }),
      prisma.cineCoinTransaction.create({
        data: {
          walletId: recipientWallet.id,
          amount: coins,
          type: "TRANSFER_RECEIVED",
          description: `Received from ${req.user!.email}: ${note || "P2P Gift"}`
        }
      })
    ]);

    return res.json({
      success: true,
      message: `Transferred ${coins} CineCoins to ${recipientEmail}`,
      data: { newBalance: updated[0].balance }
    });
  } catch (error) {
    next(error);
  }
});

// 6. Generic Quest / Challenge Claim
router.post("/claim", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { challengeId, rewardAmount, title } = req.body;
    const coins = Number(rewardAmount) || 50;

    let wallet = await prisma.cineCoinWallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await prisma.cineCoinWallet.create({
        data: { userId, balance: 0, lifetimeEarned: 0, totalRedeemed: 0 }
      });
    }

    const updated = await prisma.$transaction([
      prisma.cineCoinWallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: coins },
          lifetimeEarned: { increment: coins }
        }
      }),
      prisma.cineCoinTransaction.create({
        data: {
          walletId: wallet.id,
          amount: coins,
          type: "EARNED",
          activityKey: challengeId || "QUEST_COMPLETE",
          description: `Completed quest: ${title || "Loyalty Quest"}`
        }
      })
    ]);

    return res.json({
      success: true,
      message: `Quest reward claimed: +${coins} CineCoins!`,
      data: { newBalance: updated[0].balance }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
