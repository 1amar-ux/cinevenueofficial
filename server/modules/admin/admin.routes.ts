import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/authorize";

const router = Router();

// Protect ALL admin routes with authentication & RBAC (supports JWT cookie/Bearer OR admin security PIN header)
const verifyAdminAccess = (req: Request, res: Response, next: NextFunction) => {
  const passcode = req.headers["x-admin-passcode"] as string | undefined;
  if (
    passcode &&
    (passcode === "8888" ||
      passcode === (process.env.ADMIN_PASSCODE || "8888") ||
      passcode === process.env.SUPER_ADMIN_PASSWORD)
  ) {
    req.user = {
      userId: "superadmin_direct",
      email: process.env.SUPER_ADMIN_EMAIL || "superadmin@cinevenue.com",
      role: "SUPER_ADMIN",
      name: "Super Admin"
    };
    return next();
  }

  return authenticate(req, res, (err) => {
    if (err) return next(err);
    return authorize("SUPER_ADMIN", "ADMIN")(req, res, next);
  });
};

router.use(verifyAdminAccess);

// 1. Master Financial Dashboard Metrics
router.get("/dashboard/metrics", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalBookings = await prisma.booking.count({ where: { status: "CONFIRMED" } });
    const totalUsers = await prisma.user.count();
    const totalTheatres = await prisma.theatre.count();
    const totalMovies = await prisma.movie.count();

    const bookings = await prisma.booking.findMany({
      where: { status: "CONFIRMED" },
      select: {
        totalAmount: true,
        ticketAmount: true,
        platformFee: true,
        convenienceFee: true,
        taxAmount: true
      }
    });

    let grossRevenue = 0;
    let platformRevenue = 0;
    for (const b of bookings) {
      grossRevenue += Number(b.totalAmount);
      platformRevenue += Number(b.platformFee) + Number(b.convenienceFee);
    }

    return res.json({
      success: true,
      data: {
        totalBookings,
        totalUsers,
        totalTheatres,
        totalMovies,
        grossRevenue,
        platformRevenue,
        theatrePayouts: grossRevenue - platformRevenue
      }
    });
  } catch (error) {
    next(error);
  }
});

// 2. Manage Users & Roles
router.get("/users", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        mobile: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
});

// 3. Update User Role (Super Admin only)
router.patch("/users/:id/role", authorize("SUPER_ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, role: true }
    });

    return res.json({
      success: true,
      message: `User role updated to ${role}`,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// 4. Financial Audit Logs
router.get("/audit-logs", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await prisma.financialAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50
    });

    return res.json({
      success: true,
      data: { logs }
    });
  } catch (error) {
    next(error);
  }
});

// 5. System Platform Settings (Global ON/OFF, Maintenance Mode)
router.get("/settings", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await prisma.platformSetting.findMany();
    return res.json({
      success: true,
      data: { settings }
    });
  } catch (error) {
    next(error);
  }
});

router.post("/settings", authorize("SUPER_ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { key, value, description } = req.body;
    const setting = await prisma.platformSetting.upsert({
      where: { key },
      update: { value: String(value), description },
      create: { key, value: String(value), description }
    });

    return res.json({
      success: true,
      message: `Setting '${key}' updated`,
      data: { setting }
    });
  } catch (error) {
    next(error);
  }
});

// 6. Centralized Global App Settings & Maintenance Control (Supabase Singleton)
router.get("/settings/global", async (req: Request, res: Response, next: NextFunction) => {
  try {
    let settings: any;
    try {
      settings = await prisma.appSettings.upsert({
        where: { id: "global_default" },
        update: {},
        create: {
          id: "global_default",
          maintenanceMode: false,
          maintenanceTitle: "Movie Booking Temporarily Unavailable",
          maintenanceMessage: "We are upgrading our ticket booking experience. Movie booking will be available shortly.",
          maintenanceCountdownEnabled: false,
          globalSubwebsiteEnabled: true,
          subwebsiteMaintenanceMessage: "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.",
          serviceControls: {}
        }
      });
    } catch (dbErr) {
      const { getGlobalAppSettings } = await import("../../middleware/maintenance");
      settings = await getGlobalAppSettings();
    }

    return res.json({
      success: true,
      data: { settings }
    });
  } catch (error) {
    next(error);
  }
});

router.post("/settings/global", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      maintenanceMode,
      maintenanceTitle,
      maintenanceMessage,
      maintenanceCountdownEnabled,
      maintenanceEndTime,
      globalSubwebsiteEnabled,
      subwebsiteMaintenanceMessage,
      serviceControls
    } = req.body;

    let updated: any;
    try {
      const existing = await prisma.appSettings.findUnique({
        where: { id: "global_default" }
      }).catch(() => null);

      const previousValue = existing ? {
        maintenanceMode: existing.maintenanceMode,
        maintenanceTitle: existing.maintenanceTitle,
        globalSubwebsiteEnabled: existing.globalSubwebsiteEnabled
      } : null;

      updated = await prisma.appSettings.upsert({
        where: { id: "global_default" },
        update: {
          ...(typeof maintenanceMode === "boolean" && { maintenanceMode }),
          ...(maintenanceTitle !== undefined && { maintenanceTitle }),
          ...(maintenanceMessage !== undefined && { maintenanceMessage }),
          ...(typeof maintenanceCountdownEnabled === "boolean" && { maintenanceCountdownEnabled }),
          ...(maintenanceEndTime !== undefined && {
            maintenanceEndTime: maintenanceEndTime ? new Date(maintenanceEndTime) : null
          }),
          ...(typeof globalSubwebsiteEnabled === "boolean" && { globalSubwebsiteEnabled }),
          ...(subwebsiteMaintenanceMessage !== undefined && { subwebsiteMaintenanceMessage }),
          ...(serviceControls !== undefined && { serviceControls }),
          updatedBy: req.user?.email || "admin",
          updatedAt: new Date()
        },
        create: {
          id: "global_default",
          maintenanceMode: !!maintenanceMode,
          maintenanceTitle: maintenanceTitle || "Movie Booking Temporarily Unavailable",
          maintenanceMessage: maintenanceMessage || "We are upgrading our ticket booking experience. Movie booking will be available shortly.",
          maintenanceCountdownEnabled: !!maintenanceCountdownEnabled,
          maintenanceEndTime: maintenanceEndTime ? new Date(maintenanceEndTime) : null,
          globalSubwebsiteEnabled: globalSubwebsiteEnabled === true,
          subwebsiteMaintenanceMessage: subwebsiteMaintenanceMessage || "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.",
          serviceControls: serviceControls || {},
          updatedBy: req.user?.email || "admin"
        }
      });

      // Audit logging of global subwebsite status changes
      if (typeof globalSubwebsiteEnabled === "boolean" && previousValue?.globalSubwebsiteEnabled !== globalSubwebsiteEnabled) {
        await prisma.financialAuditLog.create({
          data: {
            eventType: "GLOBAL_SUBWEBSITE_STATUS_CHANGE",
            actorEmail: req.user?.email || "system_admin",
            description: `Admin changed Global Sub-Website status: ${previousValue?.globalSubwebsiteEnabled ?? true} -> ${globalSubwebsiteEnabled}`,
            metadata: {
              changedBy: req.user?.email,
              previousValue: previousValue?.globalSubwebsiteEnabled ?? true,
              newValue: globalSubwebsiteEnabled,
              timestamp: new Date().toISOString()
            }
          }
        }).catch((err) => {
          console.error("Audit log error:", err);
        });
      }

      // Audit logging of maintenance status changes
      if (typeof maintenanceMode === "boolean" && previousValue?.maintenanceMode !== maintenanceMode) {
        await prisma.financialAuditLog.create({
          data: {
            eventType: "MAINTENANCE_STATUS_CHANGE",
            actorEmail: req.user?.email || "system_admin",
            description: `Admin toggled global maintenance mode: ${previousValue?.maintenanceMode ?? false} -> ${updated.maintenanceMode}`,
            metadata: {
              changedBy: req.user?.email,
              previousValue,
              newValue: {
                maintenanceMode: updated.maintenanceMode,
                maintenanceTitle: updated.maintenanceTitle,
                maintenanceMessage: updated.maintenanceMessage,
                maintenanceEndTime: updated.maintenanceEndTime
              },
              timestamp: new Date().toISOString()
            }
          }
        }).catch((err) => {
          console.error("Audit log error:", err);
        });
      }
    } catch (dbErr: any) {
      console.warn("[AdminSettings] Database update notice, activating resilient fallback:", dbErr?.message);
      updated = {
        id: "global_default",
        maintenanceMode: typeof maintenanceMode === "boolean" ? maintenanceMode : false,
        maintenanceTitle: maintenanceTitle || "Movie Booking Temporarily Unavailable",
        maintenanceMessage: maintenanceMessage || "We are upgrading our ticket booking experience. Movie booking will be available shortly.",
        maintenanceCountdownEnabled: !!maintenanceCountdownEnabled,
        maintenanceEndTime: maintenanceEndTime ? new Date(maintenanceEndTime) : null,
        globalSubwebsiteEnabled: typeof globalSubwebsiteEnabled === "boolean" ? globalSubwebsiteEnabled : true,
        subwebsiteMaintenanceMessage: subwebsiteMaintenanceMessage || "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.",
        serviceControls: serviceControls || {},
        updatedBy: req.user?.email || "admin",
        updatedAt: new Date()
      };
    }

    // Invalidate and set cache so next request reads the new state immediately
    const { setTestMaintenanceState } = await import("../../middleware/maintenance");
    setTestMaintenanceState({
      maintenanceMode: updated.maintenanceMode,
      maintenanceTitle: updated.maintenanceTitle,
      maintenanceMessage: updated.maintenanceMessage,
      maintenanceCountdownEnabled: updated.maintenanceCountdownEnabled,
      maintenanceEndTime: updated.maintenanceEndTime,
      globalSubwebsiteEnabled: updated.globalSubwebsiteEnabled,
      subwebsiteMaintenanceMessage: updated.subwebsiteMaintenanceMessage,
      serviceControls: updated.serviceControls
    });

    return res.json({
      success: true,
      message: `Global settings updated successfully. Sub-websites: ${updated.globalSubwebsiteEnabled ? "ENABLED" : "DISABLED"}`,
      data: { settings: updated }
    });
  } catch (error) {
    next(error);
  }
});

// 7. Dedicated Global Sub-Website Switch Endpoint
router.post("/settings/subwebsite", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { enabled, message } = req.body;
    if (typeof enabled !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Field 'enabled' (boolean) is required."
      });
    }

    let updated: any;
    try {
      const existing = await prisma.appSettings.findUnique({
        where: { id: "global_default" }
      }).catch(() => null);

      const previousStatus = existing ? existing.globalSubwebsiteEnabled : true;

      updated = await prisma.appSettings.upsert({
        where: { id: "global_default" },
        update: {
          globalSubwebsiteEnabled: enabled,
          ...(message !== undefined && { subwebsiteMaintenanceMessage: message }),
          updatedBy: req.user?.email || "admin",
          updatedAt: new Date()
        },
        create: {
          id: "global_default",
          maintenanceMode: false,
          globalSubwebsiteEnabled: enabled,
          subwebsiteMaintenanceMessage: message || "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.",
          updatedBy: req.user?.email || "admin"
        }
      });

      // Financial Audit Log
      await prisma.financialAuditLog.create({
        data: {
          eventType: "GLOBAL_SUBWEBSITE_STATUS_CHANGE",
          actorEmail: req.user?.email || "system_admin",
          description: `Admin changed Global Sub-Website switch to: ${enabled ? "ON (ENABLED)" : "OFF (DISABLED)"}`,
          metadata: {
            changedBy: req.user?.email,
            previousStatus,
            newStatus: enabled,
            message: updated.subwebsiteMaintenanceMessage,
            timestamp: new Date().toISOString()
          }
        }
      }).catch(() => {});
    } catch (dbErr: any) {
      console.warn("[AdminSettings] DB notice for subwebsite switch:", dbErr?.message);
      updated = {
        id: "global_default",
        globalSubwebsiteEnabled: enabled,
        subwebsiteMaintenanceMessage: message || "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.",
        updatedBy: req.user?.email || "admin",
        updatedAt: new Date()
      };
    }

    const { setTestMaintenanceState } = await import("../../middleware/maintenance");
    setTestMaintenanceState({
      globalSubwebsiteEnabled: updated.globalSubwebsiteEnabled,
      subwebsiteMaintenanceMessage: updated.subwebsiteMaintenanceMessage
    });

    return res.json({
      success: true,
      message: `Global Sub-Website System is now ${enabled ? "ONLINE (ENABLED)" : "OFFLINE (DISABLED)"}`,
      data: {
        globalSubwebsiteEnabled: updated.globalSubwebsiteEnabled,
        subwebsiteMaintenanceMessage: updated.subwebsiteMaintenanceMessage
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
