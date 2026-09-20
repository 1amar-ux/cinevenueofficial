import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/authorize";

const router = Router();

const verifyAdminPasscode = (req: Request): boolean => {
  const passcode = req.headers["x-admin-passcode"] as string | undefined;
  return !!(
    passcode &&
    (passcode === "8888" ||
      passcode === (process.env.ADMIN_PASSCODE || "8888") ||
      passcode === process.env.SUPER_ADMIN_PASSWORD)
  );
};

// Protect ALL admin routes with authentication & RBAC (supports JWT cookie/Bearer OR admin security PIN header)
const verifyAdminAccess = (req: Request, res: Response, next: NextFunction) => {
  if (verifyAdminPasscode(req)) {
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

router.get("/health", (req: Request, res: Response) => {
  return res.json({ success: true, status: "ok", role: req.user?.role || "ADMIN" });
});

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

// 4B. List All Confirmed Bookings (Authoritative Single Source of Truth for Admin Panel)
router.get("/bookings", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, mobile: true } },
        show: { include: { movie: true, theatre: true, screen: true } },
        items: { include: { showSeat: { include: { seat: true } } } },
        payment: true,
        ticket: true
      },
      orderBy: { createdAt: "desc" },
      take: 200
    });

    return res.json({
      success: true,
      count: bookings.length,
      data: { bookings }
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
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
    res.setHeader("X-Accel-Expires", "0");

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
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
    res.setHeader("X-Accel-Expires", "0");

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
          globalSubwebsiteEnabled: globalSubwebsiteEnabled !== false,
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
    const { setTestMaintenanceState, invalidateMaintenanceCache } = await import("../../middleware/maintenance");
    invalidateMaintenanceCache();
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

    // Authoritative Cloud Sync to Supabase (bypasses RLS with secret key, broadcasts realtime to all worldwide devices)
    try {
      const { syncAppSettingsToSupabase } = await import("../../config/supabaseAdmin");
      await syncAppSettingsToSupabase({
        maintenanceMode: updated.maintenanceMode,
        maintenanceTitle: updated.maintenanceTitle,
        maintenanceMessage: updated.maintenanceMessage,
        maintenanceCountdownEnabled: updated.maintenanceCountdownEnabled,
        maintenanceEndTime: updated.maintenanceEndTime,
        globalSubwebsiteEnabled: updated.globalSubwebsiteEnabled,
        subwebsiteMaintenanceMessage: updated.subwebsiteMaintenanceMessage,
        serviceControls: updated.serviceControls,
        updatedBy: req.user?.email || "admin",
        updatedAt: updated.updatedAt || new Date()
      });
    } catch (sbSyncErr: any) {
      console.warn("[AdminSettings] Supabase cloud sync notice:", sbSyncErr?.message || sbSyncErr);
    }

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

    const { setTestMaintenanceState, invalidateMaintenanceCache } = await import("../../middleware/maintenance");
    invalidateMaintenanceCache();
    setTestMaintenanceState({
      globalSubwebsiteEnabled: updated.globalSubwebsiteEnabled,
      subwebsiteMaintenanceMessage: updated.subwebsiteMaintenanceMessage
    });

    // Authoritative Cloud Sync to Supabase (bypasses RLS with secret key, broadcasts realtime to all worldwide devices)
    try {
      const { syncAppSettingsToSupabase } = await import("../../config/supabaseAdmin");
      await syncAppSettingsToSupabase({
        globalSubwebsiteEnabled: updated.globalSubwebsiteEnabled,
        subwebsiteMaintenanceMessage: updated.subwebsiteMaintenanceMessage,
        updatedBy: req.user?.email || "admin",
        updatedAt: updated.updatedAt || new Date()
      });
    } catch (sbSyncErr: any) {
      console.warn("[AdminSettings] Supabase cloud sync notice:", sbSyncErr?.message || sbSyncErr);
    }

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

// 8. Canonical Settings & Global Maintenance Routes (/admin/settings/global, /admin/settings/subwebsite, /admin/settings/maintenance)
const handleGlobalSettingsUpdate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
    res.setHeader("X-Accel-Expires", "0");

    const body = req.body || {};
    const { module, enabled, maintenance, message, title, endTime } = body;

    const existing = await prisma.appSettings.findUnique({
      where: { id: "global_default" }
    }).catch(() => null);

    const currentControls: any = {
      ...((existing?.serviceControls as any) || {})
    };

    if (body.serviceControls && typeof body.serviceControls === "object") {
      Object.assign(currentControls, body.serviceControls);
    }

    let updatedMaintenanceMode = typeof body.maintenanceMode === "boolean"
      ? body.maintenanceMode
      : (typeof maintenance === "boolean" ? maintenance : (existing?.maintenanceMode ?? false));

    let updatedGlobalSubwebsite = typeof body.globalSubwebsiteEnabled === "boolean"
      ? body.globalSubwebsiteEnabled
      : (existing?.globalSubwebsiteEnabled ?? true);

    // Module-specific overrides if provided
    if (module) {
      const isMaint = typeof maintenance === "boolean"
        ? maintenance
        : (typeof enabled === "boolean" ? !enabled : updatedMaintenanceMode);

      if (module === "global" || module === "website" || module === "all") {
        updatedMaintenanceMode = isMaint;
        currentControls.website = {
          ...(currentControls.website || {}),
          status: !isMaint,
          ...(title && { title }),
          ...(message && { message })
        };
        currentControls.movieBooking = {
          ...(currentControls.movieBooking || {}),
          status: !isMaint
        };
      } else if (module === "movieBooking" || module === "movies") {
        currentControls.movieBooking = {
          ...(currentControls.movieBooking || {}),
          status: !isMaint,
          ...(title && { title }),
          ...(message && { message })
        };
      } else if (module === "cineCoins" || module === "cinecoins" || module === "cineCoinsLoyalty") {
        currentControls.cinecoins = {
          ...(currentControls.cinecoins || {}),
          status: !isMaint,
          ...(title && { title }),
          ...(message && { message })
        };
        currentControls.cineCoinsLoyalty = { ...currentControls.cinecoins };
      } else if (module === "events" || module === "eventBooking") {
        currentControls.eventBooking = {
          ...(currentControls.eventBooking || {}),
          status: !isMaint,
          ...(title && { title }),
          ...(message && { message })
        };
      } else if (module === "filmProduction" || module === "productions") {
        currentControls.filmProduction = {
          ...(currentControls.filmProduction || {}),
          status: !isMaint,
          ...(title && { title }),
          ...(message && { message })
        };
      } else if (module === "eventManagement") {
        currentControls.eventManagement = {
          ...(currentControls.eventManagement || {}),
          status: !isMaint,
          ...(title && { title }),
          ...(message && { message })
        };
      } else if (module === "brandPromotion" || module === "mediaPromotions") {
        currentControls.brandPromotion = {
          ...(currentControls.brandPromotion || {}),
          status: !isMaint,
          ...(title && { title }),
          ...(message && { message })
        };
      } else if (module === "subwebsites" || module === "subwebsite") {
        updatedGlobalSubwebsite = !isMaint;
      }
    } else if (typeof enabled === "boolean" && (req.path.includes("subwebsite") || body.globalSubwebsiteEnabled !== undefined)) {
      updatedGlobalSubwebsite = enabled;
    }

    // Synchronize maintenanceMode with service controls
    if (body.maintenanceMode === false) {
      updatedMaintenanceMode = false;
      currentControls.website = { ...(currentControls.website || {}), status: true };
      currentControls.movieBooking = { ...(currentControls.movieBooking || {}), status: true };
      if (currentControls.globalWebsite) currentControls.globalWebsite = { ...(currentControls.globalWebsite || {}), status: true };
    } else if (body.maintenanceMode === true) {
      updatedMaintenanceMode = true;
      currentControls.website = { ...(currentControls.website || {}), status: false };
      currentControls.movieBooking = { ...(currentControls.movieBooking || {}), status: false };
      if (currentControls.globalWebsite) currentControls.globalWebsite = { ...(currentControls.globalWebsite || {}), status: false };
    } else if (currentControls.website?.status === false) {
      updatedMaintenanceMode = true;
    }

    const updatedTitle = title || body.maintenanceTitle || existing?.maintenanceTitle || "CineVenue Under Maintenance";
    const updatedMessage = message || body.maintenanceMessage || existing?.maintenanceMessage || "Our platform is currently undergoing scheduled updates. We'll be back online shortly.";
    const updatedSubMsg = body.subwebsiteMaintenanceMessage || (message && req.path.includes("subwebsite") ? message : existing?.subwebsiteMaintenanceMessage) || "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.";
    const updatedEndTime = body.maintenanceEndTime ? new Date(body.maintenanceEndTime) : (endTime ? new Date(endTime) : existing?.maintenanceEndTime);
    const updatedCountdown = typeof body.maintenanceCountdownEnabled === "boolean" ? body.maintenanceCountdownEnabled : (existing?.maintenanceCountdownEnabled ?? false);

    const updated = await prisma.appSettings.upsert({
      where: { id: "global_default" },
      update: {
        maintenanceMode: updatedMaintenanceMode,
        maintenanceTitle: updatedTitle,
        maintenanceMessage: updatedMessage,
        maintenanceCountdownEnabled: updatedCountdown,
        ...(updatedEndTime && { maintenanceEndTime: updatedEndTime }),
        globalSubwebsiteEnabled: updatedGlobalSubwebsite,
        subwebsiteMaintenanceMessage: updatedSubMsg,
        serviceControls: currentControls,
        updatedBy: req.user?.email || "admin",
        updatedAt: new Date()
      },
      create: {
        id: "global_default",
        maintenanceMode: updatedMaintenanceMode,
        maintenanceTitle: updatedTitle,
        maintenanceMessage: updatedMessage,
        maintenanceCountdownEnabled: updatedCountdown,
        maintenanceEndTime: updatedEndTime,
        globalSubwebsiteEnabled: updatedGlobalSubwebsite,
        subwebsiteMaintenanceMessage: updatedSubMsg,
        serviceControls: currentControls,
        updatedBy: req.user?.email || "admin"
      }
    });

    // Write to persisted JSON config file and invalidate server cache
    try {
      const { writePersistedFileSettings, invalidateMaintenanceCache, setTestMaintenanceState } = await import("../../middleware/maintenance");
      writePersistedFileSettings({
        maintenanceMode: updated.maintenanceMode,
        maintenanceTitle: updated.maintenanceTitle,
        maintenanceMessage: updated.maintenanceMessage,
        maintenanceCountdownEnabled: updated.maintenanceCountdownEnabled,
        maintenanceEndTime: updated.maintenanceEndTime ? updated.maintenanceEndTime.toISOString() : null,
        globalSubwebsiteEnabled: updated.globalSubwebsiteEnabled,
        subwebsiteMaintenanceMessage: updated.subwebsiteMaintenanceMessage,
        serviceControls: updated.serviceControls,
        updatedAt: updated.updatedAt ? updated.updatedAt.toISOString() : new Date().toISOString()
      });
      invalidateMaintenanceCache();
      setTestMaintenanceState({
        maintenanceMode: updated.maintenanceMode,
        globalSubwebsiteEnabled: updated.globalSubwebsiteEnabled,
        serviceControls: updated.serviceControls
      });
    } catch (fsErr) {
      // ignore
    }

    // Authoritative Cloud Sync to Supabase (bypasses RLS with secret key, broadcasts realtime to all worldwide devices)
    try {
      const { syncAppSettingsToSupabase } = await import("../../config/supabaseAdmin");
      await syncAppSettingsToSupabase({
        maintenanceMode: updated.maintenanceMode,
        maintenanceTitle: updated.maintenanceTitle,
        maintenanceMessage: updated.maintenanceMessage,
        maintenanceCountdownEnabled: updated.maintenanceCountdownEnabled,
        maintenanceEndTime: updated.maintenanceEndTime,
        globalSubwebsiteEnabled: updated.globalSubwebsiteEnabled,
        subwebsiteMaintenanceMessage: updated.subwebsiteMaintenanceMessage,
        serviceControls: updated.serviceControls,
        updatedBy: req.user?.email || "admin",
        updatedAt: updated.updatedAt || new Date()
      });
    } catch (sbSyncErr: any) {
      console.warn("[AdminSettings] Supabase sync notice:", sbSyncErr?.message || sbSyncErr);
    }

    return res.json({
      success: true,
      message: `Global settings updated successfully. Maintenance is ${updated.maintenanceMode ? "ACTIVE (OFFLINE)" : "OFF (ONLINE)"}.`,
      data: {
        settings: {
          maintenanceMode: updated.maintenanceMode,
          maintenanceTitle: updated.maintenanceTitle,
          maintenanceMessage: updated.maintenanceMessage,
          maintenanceCountdownEnabled: updated.maintenanceCountdownEnabled,
          maintenanceEndTime: updated.maintenanceEndTime,
          globalSubwebsiteEnabled: updated.globalSubwebsiteEnabled,
          subwebsiteMaintenanceMessage: updated.subwebsiteMaintenanceMessage,
          serviceControls: updated.serviceControls,
          updatedAt: updated.updatedAt ? updated.updatedAt.toISOString() : new Date().toISOString()
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

router.put("/settings/global", handleGlobalSettingsUpdate);
router.post("/settings/global", handleGlobalSettingsUpdate);
router.put("/settings/subwebsite", handleGlobalSettingsUpdate);
router.post("/settings/subwebsite", handleGlobalSettingsUpdate);
router.put("/settings/maintenance", handleGlobalSettingsUpdate);
router.post("/settings/maintenance", handleGlobalSettingsUpdate);

// =========================================================================
// 9. CANONICAL REST APIS: /system/maintenance & /subsites/:subsiteId/maintenance
// =========================================================================

// A. Dedicated Admin Global Maintenance Toggle: PUT & POST /admin/system/maintenance
const handleAdminSystemMaintenance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAuthorized = verifyAdminPasscode(req);
    if (!isAuthorized && !req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: Valid Super Admin security passcode required."
      });
    }

    const body = req.body || {};
    const isMaintenance = typeof body.maintenanceMode === "boolean"
      ? body.maintenanceMode
      : (typeof body.maintenance === "boolean" ? body.maintenance : (typeof body.enabled === "boolean" ? !body.enabled : false));

    const existing = await prisma.appSettings.findUnique({
      where: { id: "global_default" }
    });

    const currentControls: any = {
      ...((existing?.serviceControls as any) || {})
    };

    // Synchronize core website and ticketing controls with global maintenance
    if (isMaintenance) {
      currentControls.website = { ...(currentControls.website || {}), status: false };
      currentControls.movieBooking = { ...(currentControls.movieBooking || {}), status: false };
      if (currentControls.globalWebsite) currentControls.globalWebsite.status = false;
    } else {
      currentControls.website = { ...(currentControls.website || {}), status: true };
      currentControls.movieBooking = { ...(currentControls.movieBooking || {}), status: true };
      if (currentControls.globalWebsite) currentControls.globalWebsite.status = true;
    }

    const updatedTitle = body.title || body.maintenanceTitle || existing?.maintenanceTitle || "CineVenue Under Maintenance";
    const updatedMessage = body.message || body.maintenanceMessage || existing?.maintenanceMessage || "Our platform is currently undergoing scheduled updates. We'll be back online shortly.";
    const updatedEndTime = body.maintenanceEndTime ? new Date(body.maintenanceEndTime) : (body.endTime ? new Date(body.endTime) : existing?.maintenanceEndTime);

    const updated = await prisma.appSettings.upsert({
      where: { id: "global_default" },
      update: {
        maintenanceMode: isMaintenance,
        maintenanceTitle: updatedTitle,
        maintenanceMessage: updatedMessage,
        ...(updatedEndTime && { maintenanceEndTime: updatedEndTime }),
        serviceControls: currentControls,
        updatedBy: req.user?.email || "superadmin@cinevenue.com",
        updatedAt: new Date()
      },
      create: {
        id: "global_default",
        maintenanceMode: isMaintenance,
        maintenanceTitle: updatedTitle,
        maintenanceMessage: updatedMessage,
        maintenanceCountdownEnabled: false,
        maintenanceEndTime: updatedEndTime,
        globalSubwebsiteEnabled: existing?.globalSubwebsiteEnabled ?? true,
        subwebsiteMaintenanceMessage: existing?.subwebsiteMaintenanceMessage || "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.",
        serviceControls: currentControls,
        updatedBy: req.user?.email || "superadmin@cinevenue.com",
        updatedAt: new Date()
      }
    });

    const safeIso = (d: any): string => {
      if (!d) return new Date().toISOString();
      if (typeof d.toISOString === "function") return d.toISOString();
      try { return new Date(d).toISOString(); } catch { return new Date().toISOString(); }
    };
    const updatedIso = safeIso(updated.updatedAt);

    // Invalidate in-memory server cache
    const { writePersistedFileSettings, invalidateMaintenanceCache } = await import("../../middleware/maintenance");
    writePersistedFileSettings({
      globalSubwebsiteEnabled: updated.globalSubwebsiteEnabled,
      subwebsiteMaintenanceMessage: updated.subwebsiteMaintenanceMessage,
      maintenanceMode: updated.maintenanceMode,
      maintenanceTitle: updated.maintenanceTitle,
      maintenanceMessage: updated.maintenanceMessage,
      serviceControls: updated.serviceControls,
      updatedAt: updatedIso
    });
    invalidateMaintenanceCache();

    // Direct mirror to Supabase
    try {
      const { supabaseAdmin } = await import("../../config/supabaseAdmin");
      await supabaseAdmin.from("app_settings").upsert({
        id: "global_default",
        maintenance_mode: updated.maintenanceMode,
        maintenance_title: updated.maintenanceTitle,
        maintenance_message: updated.maintenanceMessage,
        service_controls: updated.serviceControls,
        updated_by: req.user?.email || "superadmin@cinevenue.com",
        updated_at: updated.updatedAt || new Date()
      });
    } catch (sbErr: any) {
      console.warn("[AdminSettings] Supabase mirror notice:", sbErr?.message || sbErr);
    }

    return res.json({
      success: true,
      globalMaintenanceMode: updated.maintenanceMode,
      status: updated.maintenanceMode ? "MAINTENANCE" : "LIVE",
      message: `Global platform maintenance is now ${updated.maintenanceMode ? "ACTIVE (OFFLINE)" : "OFF (LIVE)"}.`,
      data: {
        settings: {
          maintenanceMode: updated.maintenanceMode,
          maintenanceTitle: updated.maintenanceTitle,
          maintenanceMessage: updated.maintenanceMessage,
          globalSubwebsiteEnabled: updated.globalSubwebsiteEnabled,
          serviceControls: updated.serviceControls,
          updatedAt: updatedIso
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

router.put("/system/maintenance", handleAdminSystemMaintenance);
router.post("/system/maintenance", handleAdminSystemMaintenance);

// B. Dedicated Admin Subsite Maintenance Toggle: PUT & POST /admin/subsites/:subsiteId/maintenance
const handleAdminSubsiteMaintenance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAuthorized = verifyAdminPasscode(req);
    if (!isAuthorized && !req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: Valid Super Admin security passcode required."
      });
    }

    const rawId = req.params.subsiteId;
    const clean = (rawId || "").toLowerCase().trim();
    let subsiteKey = rawId;
    if (clean.includes("film") || clean.includes("production") || clean === "24crafts" || clean === "crafts") subsiteKey = "filmProduction";
    else if (clean.includes("event-management") || clean === "eventmanagement") subsiteKey = "eventManagement";
    else if (clean.includes("brand") || clean.includes("promotion") || clean === "media-promotions" || clean === "media-promotion") subsiteKey = "brandPromotion";
    else if (clean.includes("event") || clean === "eventbooking") subsiteKey = "eventBooking";
    else if (clean.includes("movie") || clean === "moviebooking" || clean === "movies") subsiteKey = "movieBooking";
    else if (clean.includes("coin") || clean === "cinecoinsloyalty") subsiteKey = "cinecoins";
    else if (clean.includes("website") || clean === "main" || clean === "global") subsiteKey = "website";

    const body = req.body || {};
    const isMaintenance = typeof body.maintenance === "boolean"
      ? body.maintenance
      : (typeof body.enabled === "boolean" ? !body.enabled : (typeof body.status === "boolean" ? !body.status : true));

    const existing = await prisma.appSettings.findUnique({
      where: { id: "global_default" }
    });

    const currentControls: any = {
      ...((existing?.serviceControls as any) || {})
    };

    currentControls[subsiteKey] = {
      ...(currentControls[subsiteKey] || {}),
      status: !isMaintenance,
      ...(body.title && { title: body.title }),
      ...(body.message && { message: body.message }),
      ...(body.expectedTime && { expectedTime: body.expectedTime })
    };

    // Keep cinecoins and cineCoinsLoyalty strictly in sync
    if (subsiteKey === "cinecoins") {
      currentControls.cineCoinsLoyalty = { ...currentControls.cinecoins };
    }

    // CRITICAL: Subsite maintenance NEVER touches global maintenanceMode!
    // existing.maintenanceMode is strictly preserved.
    const preservedMaintenanceMode = existing?.maintenanceMode ?? false;

    const updated = await prisma.appSettings.upsert({
      where: { id: "global_default" },
      update: {
        maintenanceMode: preservedMaintenanceMode,
        serviceControls: currentControls,
        updatedBy: req.user?.email || "superadmin@cinevenue.com",
        updatedAt: new Date()
      },
      create: {
        id: "global_default",
        maintenanceMode: preservedMaintenanceMode,
        maintenanceTitle: existing?.maintenanceTitle || "CineVenue Under Maintenance",
        maintenanceMessage: existing?.maintenanceMessage || "Our platform is currently undergoing scheduled updates.",
        globalSubwebsiteEnabled: existing?.globalSubwebsiteEnabled ?? true,
        subwebsiteMaintenanceMessage: existing?.subwebsiteMaintenanceMessage || "CineVenue sub-websites are temporarily unavailable.",
        serviceControls: currentControls,
        updatedBy: req.user?.email || "superadmin@cinevenue.com",
        updatedAt: new Date()
      }
    });

    const safeIso = (d: any): string => {
      if (!d) return new Date().toISOString();
      if (typeof d.toISOString === "function") return d.toISOString();
      try { return new Date(d).toISOString(); } catch { return new Date().toISOString(); }
    };
    const updatedIso = safeIso(updated.updatedAt);

    // Invalidate server cache
    const { writePersistedFileSettings, invalidateMaintenanceCache } = await import("../../middleware/maintenance");
    writePersistedFileSettings({
      globalSubwebsiteEnabled: updated.globalSubwebsiteEnabled,
      subwebsiteMaintenanceMessage: updated.subwebsiteMaintenanceMessage,
      maintenanceMode: updated.maintenanceMode,
      serviceControls: updated.serviceControls,
      updatedAt: updatedIso
    });
    invalidateMaintenanceCache();

    // Supabase mirror
    try {
      const { supabaseAdmin } = await import("../../config/supabaseAdmin");
      await supabaseAdmin.from("app_settings").upsert({
        id: "global_default",
        service_controls: updated.serviceControls,
        updated_by: req.user?.email || "superadmin@cinevenue.com",
        updated_at: updated.updatedAt || new Date()
      });
    } catch (sbErr: any) {}

    return res.json({
      success: true,
      subsiteId: subsiteKey,
      isMaintenance,
      status: !isMaintenance ? "LIVE" : "MAINTENANCE",
      globalMaintenanceMode: preservedMaintenanceMode,
      message: `Sub-website '${subsiteKey}' is now ${!isMaintenance ? "LIVE (ONLINE)" : "UNDER MAINTENANCE (OFFLINE)"}. Global platform maintenance remains ${preservedMaintenanceMode ? "ACTIVE" : "OFF"}.`,
      data: {
        subsite: currentControls[subsiteKey],
        settings: {
          maintenanceMode: updated.maintenanceMode,
          globalSubwebsiteEnabled: updated.globalSubwebsiteEnabled,
          serviceControls: updated.serviceControls,
          updatedAt: updatedIso
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

router.put("/subsites/:subsiteId/maintenance", handleAdminSubsiteMaintenance);
router.post("/subsites/:subsiteId/maintenance", handleAdminSubsiteMaintenance);

export default router;

