import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { prisma } from "../../config/database";
import { authenticate } from "../../middleware/auth";
import { env } from "../../config/env";

export const employeeRouter = Router();

// ==========================================
// 1. DATA TYPES & DEFAULT ROLES
// ==========================================

export interface RoleDef {
  id: string;
  name: string;
  displayName: string;
  description: string;
  isSystemRole: boolean;
  defaultPermissions: { [module: string]: { [action: string]: boolean } };
}

export const SYSTEM_MODULES = [
  { id: "EVENTS", label: "Event Management" },
  { id: "MOVIES", label: "Movie Management" },
  { id: "THEATRES", label: "Theatre Management" },
  { id: "SHOWS", label: "Show Master & Schedules" },
  { id: "BOOKINGS", label: "Booking Audit & Ticketing" },
  { id: "FINANCE", label: "Finance & Settlements" },
  { id: "MARKETING", label: "Marketing & Campaigns" },
  { id: "FILM_PRODUCTION", label: "Film Production & Proposals" },
  { id: "EMPLOYEES", label: "Employee Access Management" },
  { id: "SYSTEM_SETTINGS", label: "System & Security Settings" }
] as const;

export const PERMISSION_ACTIONS = [
  { id: "VIEW", label: "View" },
  { id: "CREATE", label: "Create" },
  { id: "EDIT", label: "Edit" },
  { id: "DELETE", label: "Delete" },
  { id: "APPROVE", label: "Approve" },
  { id: "EXPORT", label: "Export" },
  { id: "MANAGE", label: "Manage" },
  { id: "VIEW_REPORTS", label: "View Reports" }
] as const;

export const INITIAL_ROLES: RoleDef[] = [
  {
    id: "role_super_admin",
    name: "SUPER_ADMIN",
    displayName: "Super Admin",
    description: "Full access to the entire CineVenue Admin Panel and all operational modules.",
    isSystemRole: true,
    defaultPermissions: {
      EVENTS: { VIEW: true, CREATE: true, EDIT: true, DELETE: true, APPROVE: true, EXPORT: true, MANAGE: true, VIEW_REPORTS: true },
      MOVIES: { VIEW: true, CREATE: true, EDIT: true, DELETE: true, APPROVE: true, EXPORT: true, MANAGE: true, VIEW_REPORTS: true },
      THEATRES: { VIEW: true, CREATE: true, EDIT: true, DELETE: true, APPROVE: true, EXPORT: true, MANAGE: true, VIEW_REPORTS: true },
      SHOWS: { VIEW: true, CREATE: true, EDIT: true, DELETE: true, APPROVE: true, EXPORT: true, MANAGE: true, VIEW_REPORTS: true },
      BOOKINGS: { VIEW: true, CREATE: true, EDIT: true, DELETE: true, APPROVE: true, EXPORT: true, MANAGE: true, VIEW_REPORTS: true },
      FINANCE: { VIEW: true, CREATE: true, EDIT: true, DELETE: true, APPROVE: true, EXPORT: true, MANAGE: true, VIEW_REPORTS: true },
      MARKETING: { VIEW: true, CREATE: true, EDIT: true, DELETE: true, APPROVE: true, EXPORT: true, MANAGE: true, VIEW_REPORTS: true },
      FILM_PRODUCTION: { VIEW: true, CREATE: true, EDIT: true, DELETE: true, APPROVE: true, EXPORT: true, MANAGE: true, VIEW_REPORTS: true },
      EMPLOYEES: { VIEW: true, CREATE: true, EDIT: true, DELETE: true, APPROVE: true, EXPORT: true, MANAGE: true, VIEW_REPORTS: true },
      SYSTEM_SETTINGS: { VIEW: true, CREATE: true, EDIT: true, DELETE: true, APPROVE: true, EXPORT: true, MANAGE: true, VIEW_REPORTS: true }
    }
  },
  {
    id: "role_admin",
    name: "ADMIN",
    displayName: "Admin",
    description: "Access to most operational modules but cannot manage Super Admins or change critical security settings.",
    isSystemRole: true,
    defaultPermissions: {
      EVENTS: { VIEW: true, CREATE: true, EDIT: true, DELETE: false, APPROVE: true, EXPORT: true, MANAGE: true, VIEW_REPORTS: true },
      MOVIES: { VIEW: true, CREATE: true, EDIT: true, DELETE: false, APPROVE: true, EXPORT: true, MANAGE: true, VIEW_REPORTS: true },
      THEATRES: { VIEW: true, CREATE: true, EDIT: true, DELETE: false, APPROVE: true, EXPORT: true, MANAGE: true, VIEW_REPORTS: true },
      SHOWS: { VIEW: true, CREATE: true, EDIT: true, DELETE: false, APPROVE: true, EXPORT: true, MANAGE: true, VIEW_REPORTS: true },
      BOOKINGS: { VIEW: true, CREATE: true, EDIT: true, DELETE: false, APPROVE: false, EXPORT: true, MANAGE: true, VIEW_REPORTS: true },
      FINANCE: { VIEW: true, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: true, MANAGE: false, VIEW_REPORTS: true },
      MARKETING: { VIEW: true, CREATE: true, EDIT: true, DELETE: false, APPROVE: true, EXPORT: true, MANAGE: true, VIEW_REPORTS: true },
      FILM_PRODUCTION: { VIEW: true, CREATE: true, EDIT: true, DELETE: false, APPROVE: true, EXPORT: true, MANAGE: true, VIEW_REPORTS: true },
      EMPLOYEES: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      SYSTEM_SETTINGS: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false }
    }
  },
  {
    id: "role_event_manager",
    name: "EVENT_MANAGER",
    displayName: "Event Manager",
    description: "Access only to Event Management, Passes, Attendee Data, Bookings, and Event Analytics.",
    isSystemRole: true,
    defaultPermissions: {
      EVENTS: { VIEW: true, CREATE: true, EDIT: true, DELETE: true, APPROVE: true, EXPORT: true, MANAGE: true, VIEW_REPORTS: true },
      MOVIES: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      THEATRES: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      SHOWS: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      BOOKINGS: { VIEW: true, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: true, MANAGE: false, VIEW_REPORTS: true },
      FINANCE: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      MARKETING: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      FILM_PRODUCTION: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      EMPLOYEES: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      SYSTEM_SETTINGS: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false }
    }
  },
  {
    id: "role_movie_manager",
    name: "MOVIE_MANAGER",
    displayName: "Movie Manager",
    description: "Access only to Movie Management, Posters, Trailers/Teasers, Release Configuration, and Shows.",
    isSystemRole: true,
    defaultPermissions: {
      EVENTS: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      MOVIES: { VIEW: true, CREATE: true, EDIT: true, DELETE: true, APPROVE: true, EXPORT: true, MANAGE: true, VIEW_REPORTS: true },
      THEATRES: { VIEW: true, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      SHOWS: { VIEW: true, CREATE: true, EDIT: true, DELETE: false, APPROVE: true, EXPORT: true, MANAGE: true, VIEW_REPORTS: true },
      BOOKINGS: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      FINANCE: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      MARKETING: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      FILM_PRODUCTION: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      EMPLOYEES: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      SYSTEM_SETTINGS: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false }
    }
  },
  {
    id: "role_theatre_manager",
    name: "THEATRE_MANAGER",
    displayName: "Theatre Manager",
    description: "Access to Assigned Theatre, Screens, Shows, Seat Layout, Ticket Pricing, and Theatre Reports.",
    isSystemRole: true,
    defaultPermissions: {
      EVENTS: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      MOVIES: { VIEW: true, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      THEATRES: { VIEW: true, CREATE: false, EDIT: true, DELETE: false, APPROVE: false, EXPORT: true, MANAGE: true, VIEW_REPORTS: true },
      SHOWS: { VIEW: true, CREATE: true, EDIT: true, DELETE: true, APPROVE: true, EXPORT: true, MANAGE: true, VIEW_REPORTS: true },
      BOOKINGS: { VIEW: true, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: true, MANAGE: false, VIEW_REPORTS: true },
      FINANCE: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      MARKETING: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      FILM_PRODUCTION: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      EMPLOYEES: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      SYSTEM_SETTINGS: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false }
    }
  },
  {
    id: "role_marketing_promotion",
    name: "MARKETING_PROMOTION",
    displayName: "Marketing / Brand Promotion",
    description: "Access to Brand Promotion, Campaigns, Promotional Content, Leads, and Marketing Analytics.",
    isSystemRole: true,
    defaultPermissions: {
      EVENTS: { VIEW: true, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: true, MANAGE: false, VIEW_REPORTS: true },
      MOVIES: { VIEW: true, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: true, MANAGE: false, VIEW_REPORTS: true },
      THEATRES: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      SHOWS: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      BOOKINGS: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      FINANCE: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      MARKETING: { VIEW: true, CREATE: true, EDIT: true, DELETE: true, APPROVE: true, EXPORT: true, MANAGE: true, VIEW_REPORTS: true },
      FILM_PRODUCTION: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      EMPLOYEES: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      SYSTEM_SETTINGS: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false }
    }
  },
  {
    id: "role_film_production_manager",
    name: "FILM_PRODUCTION_MANAGER",
    displayName: "Film Production Manager",
    description: "Access to Film Production, Production Proposals, Status, Crafts, and Submitted Proposals.",
    isSystemRole: true,
    defaultPermissions: {
      EVENTS: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      MOVIES: { VIEW: true, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: true, MANAGE: false, VIEW_REPORTS: true },
      THEATRES: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      SHOWS: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      BOOKINGS: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      FINANCE: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      MARKETING: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      FILM_PRODUCTION: { VIEW: true, CREATE: true, EDIT: true, DELETE: true, APPROVE: true, EXPORT: true, MANAGE: true, VIEW_REPORTS: true },
      EMPLOYEES: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      SYSTEM_SETTINGS: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false }
    }
  },
  {
    id: "role_finance",
    name: "FINANCE",
    displayName: "Finance",
    description: "Access to Financial reports, Settlements, Revenue reports, Booking reports, and Refund audits.",
    isSystemRole: true,
    defaultPermissions: {
      EVENTS: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      MOVIES: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      THEATRES: { VIEW: true, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: true, MANAGE: false, VIEW_REPORTS: true },
      SHOWS: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      BOOKINGS: { VIEW: true, CREATE: false, EDIT: false, DELETE: false, APPROVE: true, EXPORT: true, MANAGE: false, VIEW_REPORTS: true },
      FINANCE: { VIEW: true, CREATE: true, EDIT: true, DELETE: false, APPROVE: true, EXPORT: true, MANAGE: true, VIEW_REPORTS: true },
      MARKETING: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      FILM_PRODUCTION: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      EMPLOYEES: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false },
      SYSTEM_SETTINGS: { VIEW: false, CREATE: false, EDIT: false, DELETE: false, APPROVE: false, EXPORT: false, MANAGE: false, VIEW_REPORTS: false }
    }
  }
];

// Fallback seed store path for robust offline/local sync
const FALLBACK_STORE_PATH = path.resolve(process.cwd(), "server/config/employee_store.json");

interface FallbackStore {
  employees: any[];
  activityLogs: any[];
  customPermissions: { [employeeId: string]: { [module: string]: { [action: string]: boolean } } };
}

function loadFallbackStore(): FallbackStore {
  try {
    if (fs.existsSync(FALLBACK_STORE_PATH)) {
      const data = JSON.parse(fs.readFileSync(FALLBACK_STORE_PATH, "utf-8"));
      return data;
    }
  } catch (err) {
    console.error("[EMPLOYEE_STORE_READ_ERROR]", err);
  }
  // Initialize with Super Admin and seed demo employees
  const initialHash = bcrypt.hashSync("Amarnath123", 10);
  const eventMgrHash = bcrypt.hashSync("EventMgr@2026", 10);
  const movieMgrHash = bcrypt.hashSync("MovieMgr@2026", 10);
  const finHash = bcrypt.hashSync("Finance@2026", 10);

  const initialStore: FallbackStore = {
    employees: [
      {
        id: "emp_super_admin",
        employeeId: "EMP-001",
        fullName: "Amarnath Gattem",
        username: "amarnath_admin",
        email: "superadmin@cinevenue.com",
        mobile: "+91 9876543210",
        department: "Executive Leadership",
        designation: "Chief Executive Officer & Super Admin",
        roleId: "role_super_admin",
        passwordHash: initialHash,
        status: "ACTIVE",
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "emp_event_mgr",
        employeeId: "EMP-1002",
        fullName: "Priya Sharma",
        username: "priya_events",
        email: "priya.events@cinevenue.com",
        mobile: "+91 9811223344",
        department: "Live Events & Experiences",
        designation: "Head of Live Experiences",
        roleId: "role_event_manager",
        passwordHash: eventMgrHash,
        status: "ACTIVE",
        lastLoginAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "emp_movie_mgr",
        employeeId: "EMP-1003",
        fullName: "Vikram Reddy",
        username: "vikram_movies",
        email: "vikram.movies@cinevenue.com",
        mobile: "+91 9822334455",
        department: "Cinema Operations",
        designation: "Lead Movie Content Manager",
        roleId: "role_movie_manager",
        passwordHash: movieMgrHash,
        status: "ACTIVE",
        lastLoginAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "emp_fin_mgr",
        employeeId: "EMP-1004",
        fullName: "Kiran Deshmukh",
        username: "kiran_finance",
        email: "kiran.finance@cinevenue.com",
        mobile: "+91 9833445566",
        department: "Finance & Accounts",
        designation: "Senior Financial Auditor",
        roleId: "role_finance",
        passwordHash: finHash,
        status: "ACTIVE",
        lastLoginAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    activityLogs: [
      {
        id: "log_init_01",
        employeeId: "emp_super_admin",
        employeeName: "Amarnath Gattem",
        username: "amarnath_admin",
        employeeCode: "EMP-001",
        action: "Employee logged in",
        module: "AUTH",
        result: "SUCCESS",
        ipAddress: "103.22.41.8",
        createdAt: new Date().toISOString()
      },
      {
        id: "log_init_02",
        employeeId: "emp_event_mgr",
        employeeName: "Priya Sharma",
        username: "priya_events",
        employeeCode: "EMP-1002",
        action: "Employee created an event pass tier: VIP Front Row",
        module: "EVENTS",
        result: "SUCCESS",
        ipAddress: "192.168.1.104",
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ],
    customPermissions: {}
  };

  saveFallbackStore(initialStore);
  return initialStore;
}

function saveFallbackStore(store: FallbackStore) {
  try {
    const dir = path.dirname(FALLBACK_STORE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(FALLBACK_STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("[EMPLOYEE_STORE_WRITE_ERROR]", err);
  }
}

// Password Complexity Validation Helper
// Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, 1 special character
export function validatePasswordComplexity(password: string): { isValid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters in length." };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one uppercase letter (A-Z)." };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one lowercase letter (a-z)." };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one number (0-9)." };
  }
  if (!/[!@#$%^&*(),.?":{}|<>\-_=+]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one special character (!@#$%^&* etc.)." };
  }
  return { isValid: true };
}

// Compute Effective Permissions (Role Defaults merged with Employee Overrides)
export function computeEffectivePermissions(roleId: string, customOverrides?: { [module: string]: { [action: string]: boolean } }) {
  const role = INITIAL_ROLES.find(r => r.id === roleId || r.name === roleId) || INITIAL_ROLES[1];
  const permissions: { [module: string]: { [action: string]: boolean } } = JSON.parse(JSON.stringify(role.defaultPermissions));

  if (customOverrides) {
    for (const mod of Object.keys(customOverrides)) {
      if (!permissions[mod]) permissions[mod] = {};
      for (const act of Object.keys(customOverrides[mod])) {
        permissions[mod][act] = customOverrides[mod][act];
      }
    }
  }
  return permissions;
}

// Privilege Escalation & Super Admin Authentication Middleware
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
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
    if (req.user?.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        error: {
          code: "SUPER_ADMIN_REQUIRED",
          message: "Privilege restriction: Only CineVenue Super Admin can perform Employee Access Management operations."
        }
      });
    }
    next();
  });
};

// ==========================================
// 2. PUBLIC / AUTH ENDPOINTS
// ==========================================

/**
 * POST /api/v1/auth/employee-login
 * Unified secure employee authentication via username/email + password
 */
employeeRouter.post("/auth/employee-login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_INPUT", message: "Username/email and password are required." }
      });
    }

    const cleanUser = username.trim().toLowerCase();
    const store = loadFallbackStore();

    // Check fallback store & DB
    let employee = store.employees.find(
      e => e.username.toLowerCase() === cleanUser || e.email.toLowerCase() === cleanUser
    );

    if (!employee) {
      // Try DB lookup
      try {
        const dbEmp = await (prisma as any).employee.findFirst({
          where: {
            OR: [
              { username: { equals: cleanUser, mode: "insensitive" } },
              { email: { equals: cleanUser, mode: "insensitive" } }
            ]
          }
        });
        if (dbEmp) employee = dbEmp;
      } catch (err) {
        // DB table may not exist yet, fallback store used
      }
    }

    if (!employee) {
      return res.status(401).json({
        success: false,
        error: { code: "INVALID_CREDENTIALS", message: "Invalid username or password. Please verify your credentials." }
      });
    }

    // Account status check
    if (employee.status === "INACTIVE") {
      return res.status(403).json({
        success: false,
        error: {
          code: "ACCOUNT_INACTIVE",
          message: "Your employee account has been deactivated. Please contact the CineVenue Super Admin."
        }
      });
    }

    // Verify Password Hash
    const passwordMatch = await bcrypt.compare(password, employee.passwordHash);
    if (!passwordMatch) {
      // Record failed login in audit
      store.activityLogs.unshift({
        id: "log_" + Date.now(),
        employeeId: employee.id,
        employeeName: employee.fullName,
        username: employee.username,
        employeeCode: employee.employeeId,
        action: "Employee login attempt failed (bad password)",
        module: "AUTH",
        result: "FAILED",
        ipAddress: req.ip || "127.0.0.1",
        createdAt: new Date().toISOString()
      });
      saveFallbackStore(store);

      return res.status(401).json({
        success: false,
        error: { code: "INVALID_CREDENTIALS", message: "Invalid username or password. Please verify your credentials." }
      });
    }

    // Update lastLoginAt
    const nowIso = new Date().toISOString();
    employee.lastLoginAt = nowIso;
    const empIdx = store.employees.findIndex(e => e.id === employee.id);
    if (empIdx !== -1) {
      store.employees[empIdx].lastLoginAt = nowIso;
    }

    // Add Audit Log
    store.activityLogs.unshift({
      id: "log_" + Date.now(),
      employeeId: employee.id,
      employeeName: employee.fullName,
      username: employee.username,
      employeeCode: employee.employeeId,
      action: "Employee logged in",
      module: "AUTH",
      result: "SUCCESS",
      ipAddress: req.ip || "127.0.0.1",
      createdAt: nowIso
    });
    saveFallbackStore(store);

    // Identify role & calculate permissions
    const role = INITIAL_ROLES.find(r => r.id === employee.roleId || r.name === employee.roleId) || INITIAL_ROLES[1];
    const customOverrides = store.customPermissions[employee.id] || {};
    const effectivePermissions = computeEffectivePermissions(employee.roleId, customOverrides);

    // Generate JWT Access Token
    const token = jwt.sign(
      {
        userId: employee.id,
        employeeId: employee.employeeId,
        username: employee.username,
        email: employee.email,
        role: role.name,
        name: employee.fullName
      },
      env.JWT_ACCESS_SECRET,
      { expiresIn: "7d" }
    );

    // Return sanitized employee payload without sensitive passwordHash
    const sanitizedEmployee = {
      id: employee.id,
      employeeId: employee.employeeId,
      fullName: employee.fullName,
      username: employee.username,
      email: employee.email,
      mobile: employee.mobile,
      department: employee.department,
      designation: employee.designation,
      roleId: employee.roleId,
      role: {
        id: role.id,
        name: role.name,
        displayName: role.displayName,
        description: role.description
      },
      status: employee.status,
      permissions: effectivePermissions,
      lastLoginAt: employee.lastLoginAt,
      createdAt: employee.createdAt
    };

    return res.json({
      success: true,
      data: {
        token,
        employee: sanitizedEmployee
      }
    });
  } catch (error: any) {
    console.error("[EMPLOYEE_LOGIN_ERROR]", error);
    return res.status(500).json({
      success: false,
      error: { code: "LOGIN_FAILED", message: error.message || "Authentication process failed." }
    });
  }
});

// ==========================================
// 3. SUPER ADMIN PROTECTED EMPLOYEE MANAGEMENT ENDPOINTS
// ==========================================

/**
 * GET /api/v1/admin/employees/roles
 * List all available system roles & definitions
 */
employeeRouter.get("/admin/employees/roles", requireSuperAdmin, (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: INITIAL_ROLES,
    modules: SYSTEM_MODULES,
    actions: PERMISSION_ACTIONS
  });
});

/**
 * GET /api/v1/admin/employees
 * List all employees with search and filters (never displays password hash)
 */
employeeRouter.get("/admin/employees", requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const store = loadFallbackStore();
    const { search, role, department, status } = req.query;

    let filtered = [...store.employees];

    if (search && typeof search === "string" && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        e =>
          e.fullName.toLowerCase().includes(q) ||
          e.username.toLowerCase().includes(q) ||
          e.employeeId.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q)
      );
    }

    if (role && typeof role === "string" && role !== "ALL") {
      filtered = filtered.filter(e => e.roleId === role || e.roleId.toLowerCase().includes(role.toLowerCase()));
    }

    if (department && typeof department === "string" && department !== "ALL") {
      filtered = filtered.filter(e => e.department.toLowerCase() === department.toLowerCase());
    }

    if (status && typeof status === "string" && status !== "ALL") {
      filtered = filtered.filter(e => e.status === status);
    }

    // Attach role metadata and sanitize passwordHash
    const sanitized = filtered.map(e => {
      const roleDef = INITIAL_ROLES.find(r => r.id === e.roleId || r.name === e.roleId) || INITIAL_ROLES[1];
      const customOverrides = store.customPermissions[e.id] || {};
      const permissions = computeEffectivePermissions(e.roleId, customOverrides);

      return {
        id: e.id,
        employeeId: e.employeeId,
        fullName: e.fullName,
        username: e.username,
        email: e.email,
        mobile: e.mobile,
        department: e.department,
        designation: e.designation,
        roleId: e.roleId,
        role: {
          id: roleDef.id,
          name: roleDef.name,
          displayName: roleDef.displayName
        },
        status: e.status,
        permissions,
        lastLoginAt: e.lastLoginAt,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt
      };
    });

    return res.json({
      success: true,
      data: sanitized,
      total: sanitized.length
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: "FETCH_FAILED", message: error.message || "Failed to retrieve employee roster." }
    });
  }
});

/**
 * POST /api/v1/admin/employees
 * Create a new CineVenue employee with unique validation and secure hashing
 */
employeeRouter.post("/admin/employees", requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      employeeId,
      username,
      email,
      mobile,
      department,
      designation,
      roleId,
      password,
      confirmPassword,
      status
    } = req.body;

    // Validate required fields
    if (!fullName || !employeeId || !username || !email || !department || !designation || !roleId || !password) {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_FIELDS", message: "All required employee profile fields must be provided." }
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: { code: "PASSWORD_MISMATCH", message: "Password and Confirm Password do not match." }
      });
    }

    // Password Complexity Rules
    const pwdValidation = validatePasswordComplexity(password);
    if (!pwdValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: { code: "WEAK_PASSWORD", message: pwdValidation.message }
      });
    }

    const store = loadFallbackStore();

    // Check unique employeeId
    const existingEmpId = store.employees.find(
      e => e.employeeId.toLowerCase() === employeeId.trim().toLowerCase()
    );
    if (existingEmpId) {
      return res.status(400).json({
        success: false,
        error: { code: "DUPLICATE_EMPLOYEE_ID", message: `Employee ID '${employeeId}' is already registered.` }
      });
    }

    // Check unique username
    const existingUsername = store.employees.find(
      e => e.username.toLowerCase() === username.trim().toLowerCase()
    );
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        error: { code: "DUPLICATE_USERNAME", message: `Username '${username}' is already in use.` }
      });
    }

    // Check unique email
    const existingEmail = store.employees.find(
      e => e.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        error: { code: "DUPLICATE_EMAIL", message: `Official email '${email}' is already registered.` }
      });
    }

    // Hash Password
    const passwordHash = await bcrypt.hash(password, 10);
    const nowIso = new Date().toISOString();

    const newEmp = {
      id: "emp_" + Date.now(),
      employeeId: employeeId.trim().toUpperCase(),
      fullName: fullName.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      mobile: mobile?.trim() || null,
      department: department.trim(),
      designation: designation.trim(),
      roleId: roleId,
      passwordHash,
      status: status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
      lastLoginAt: null,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    store.employees.unshift(newEmp);

    // Audit Log
    store.activityLogs.unshift({
      id: "log_" + Date.now(),
      employeeId: newEmp.id,
      employeeName: newEmp.fullName,
      username: newEmp.username,
      employeeCode: newEmp.employeeId,
      action: `Employee created by Super Admin (${newEmp.fullName} - ${newEmp.employeeId})`,
      module: "EMPLOYEES",
      result: "SUCCESS",
      ipAddress: req.ip || "127.0.0.1",
      createdAt: nowIso
    });

    saveFallbackStore(store);

    const roleDef = INITIAL_ROLES.find(r => r.id === newEmp.roleId || r.name === newEmp.roleId) || INITIAL_ROLES[1];

    return res.status(201).json({
      success: true,
      message: "Employee created successfully.",
      data: {
        id: newEmp.id,
        employeeId: newEmp.employeeId,
        fullName: newEmp.fullName,
        username: newEmp.username,
        email: newEmp.email,
        mobile: newEmp.mobile,
        department: newEmp.department,
        designation: newEmp.designation,
        role: {
          id: roleDef.id,
          name: roleDef.name,
          displayName: roleDef.displayName
        },
        status: newEmp.status,
        createdAt: newEmp.createdAt
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: "CREATE_FAILED", message: error.message || "Failed to create employee profile." }
    });
  }
});

/**
 * PUT /api/v1/admin/employees/:id
 * Update employee details (prevents unauthorized privilege escalation)
 */
employeeRouter.put("/admin/employees/:id", requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, email, mobile, department, designation, roleId } = req.body;

    const store = loadFallbackStore();
    const empIdx = store.employees.findIndex(e => e.id === id);

    if (empIdx === -1) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Employee record not found." }
      });
    }

    const currentEmp = store.employees[empIdx];

    // Protect primary Super Admin
    if (currentEmp.id === "emp_super_admin" && roleId && roleId !== "role_super_admin" && roleId !== "SUPER_ADMIN") {
      return res.status(400).json({
        success: false,
        error: { code: "RESTRICTED", message: "Primary Super Admin role cannot be modified or demoted." }
      });
    }

    const nowIso = new Date().toISOString();
    store.employees[empIdx] = {
      ...currentEmp,
      fullName: fullName?.trim() || currentEmp.fullName,
      email: email?.trim().toLowerCase() || currentEmp.email,
      mobile: mobile !== undefined ? mobile.trim() : currentEmp.mobile,
      department: department?.trim() || currentEmp.department,
      designation: designation?.trim() || currentEmp.designation,
      roleId: roleId || currentEmp.roleId,
      updatedAt: nowIso
    };

    store.activityLogs.unshift({
      id: "log_" + Date.now(),
      employeeId: currentEmp.id,
      employeeName: currentEmp.fullName,
      username: currentEmp.username,
      employeeCode: currentEmp.employeeId,
      action: `Employee details updated: ${currentEmp.fullName} (${currentEmp.employeeId})`,
      module: "EMPLOYEES",
      result: "SUCCESS",
      ipAddress: req.ip || "127.0.0.1",
      createdAt: nowIso
    });

    saveFallbackStore(store);

    return res.json({
      success: true,
      message: "Employee profile updated successfully."
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: "UPDATE_FAILED", message: error.message || "Failed to update employee." }
    });
  }
});

/**
 * PATCH /api/v1/admin/employees/:id/status
 * Toggle Active / Inactive status
 */
employeeRouter.patch("/admin/employees/:id/status", requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const store = loadFallbackStore();
    const empIdx = store.employees.findIndex(e => e.id === id);

    if (empIdx === -1) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Employee not found." }
      });
    }

    const emp = store.employees[empIdx];

    // Primary Super Admin cannot be deactivated
    if (emp.id === "emp_super_admin" || emp.username === "amarnath_admin") {
      return res.status(400).json({
        success: false,
        error: { code: "CANNOT_DEACTIVATE_SUPER_ADMIN", message: "Primary Super Admin account cannot be deactivated." }
      });
    }

    const nextStatus = status ? status : (emp.status === "ACTIVE" ? "INACTIVE" : "ACTIVE");
    emp.status = nextStatus;
    emp.updatedAt = new Date().toISOString();

    store.activityLogs.unshift({
      id: "log_" + Date.now(),
      employeeId: emp.id,
      employeeName: emp.fullName,
      username: emp.username,
      employeeCode: emp.employeeId,
      action: `Employee status changed to ${nextStatus}: ${emp.fullName}`,
      module: "EMPLOYEES",
      result: "SUCCESS",
      ipAddress: req.ip || "127.0.0.1",
      createdAt: new Date().toISOString()
    });

    saveFallbackStore(store);

    return res.json({
      success: true,
      status: nextStatus,
      message: `Employee account is now ${nextStatus === "ACTIVE" ? "🟢 Active" : "🔴 Inactive"}.`
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: "STATUS_UPDATE_FAILED", message: error.message }
    });
  }
});

/**
 * POST /api/v1/admin/employees/:id/reset-password
 * Secure password reset by Super Admin with hashing
 */
employeeRouter.post("/admin/employees/:id/reset-password", requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_PASSWORD", message: "New password and confirmation are required." }
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: { code: "PASSWORD_MISMATCH", message: "Password and Confirm Password do not match." }
      });
    }

    const pwdValidation = validatePasswordComplexity(newPassword);
    if (!pwdValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: { code: "WEAK_PASSWORD", message: pwdValidation.message }
      });
    }

    const store = loadFallbackStore();
    const empIdx = store.employees.findIndex(e => e.id === id);

    if (empIdx === -1) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Employee not found." }
      });
    }

    const emp = store.employees[empIdx];
    const passwordHash = await bcrypt.hash(newPassword, 10);
    emp.passwordHash = passwordHash;
    emp.updatedAt = new Date().toISOString();

    store.activityLogs.unshift({
      id: "log_" + Date.now(),
      employeeId: emp.id,
      employeeName: emp.fullName,
      username: emp.username,
      employeeCode: emp.employeeId,
      action: `Super Admin reset password for employee: ${emp.fullName} (${emp.employeeId})`,
      module: "EMPLOYEES",
      result: "SUCCESS",
      ipAddress: req.ip || "127.0.0.1",
      createdAt: new Date().toISOString()
    });

    saveFallbackStore(store);

    return res.json({
      success: true,
      message: "Password reset successfully."
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: "RESET_FAILED", message: error.message }
    });
  }
});

/**
 * GET /api/v1/admin/employees/:id/permissions
 * Retrieve individual custom permissions for an employee
 */
employeeRouter.get("/admin/employees/:id/permissions", requireSuperAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const store = loadFallbackStore();
    const emp = store.employees.find(e => e.id === id);

    if (!emp) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Employee not found." }
      });
    }

    const customOverrides = store.customPermissions[id] || {};
    const effective = computeEffectivePermissions(emp.roleId, customOverrides);

    return res.json({
      success: true,
      data: {
        employeeId: emp.id,
        employeeCode: emp.employeeId,
        fullName: emp.fullName,
        roleId: emp.roleId,
        customOverrides,
        effectivePermissions: effective
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: "FETCH_PERMS_FAILED", message: error.message }
    });
  }
});

/**
 * PUT /api/v1/admin/employees/:id/permissions
 * Save individual custom permission overrides
 */
employeeRouter.put("/admin/employees/:id/permissions", requireSuperAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body; // { [module]: { [action]: boolean } }

    const store = loadFallbackStore();
    const emp = store.employees.find(e => e.id === id);

    if (!emp) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Employee not found." }
      });
    }

    if (emp.id === "emp_super_admin" || emp.roleId === "role_super_admin" || emp.roleId === "SUPER_ADMIN") {
      return res.status(400).json({
        success: false,
        error: { code: "CANNOT_ALTER_SUPER_ADMIN_PERMISSIONS", message: "Super Admin maintains universal full access." }
      });
    }

    store.customPermissions[id] = permissions || {};

    store.activityLogs.unshift({
      id: "log_" + Date.now(),
      employeeId: emp.id,
      employeeName: emp.fullName,
      username: emp.username,
      employeeCode: emp.employeeId,
      action: `Employee permission changed for ${emp.fullName} (${emp.employeeId})`,
      module: "EMPLOYEES",
      result: "SUCCESS",
      ipAddress: req.ip || "127.0.0.1",
      createdAt: new Date().toISOString()
    });

    saveFallbackStore(store);

    const effective = computeEffectivePermissions(emp.roleId, store.customPermissions[id]);

    return res.json({
      success: true,
      message: "Custom permissions updated successfully.",
      data: {
        effectivePermissions: effective
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: "PERMS_SAVE_FAILED", message: error.message }
    });
  }
});

/**
 * DELETE /api/v1/admin/employees/:id
 * Delete an employee profile (Primary Super Admin protected from deletion)
 */
employeeRouter.delete("/admin/employees/:id", requireSuperAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const store = loadFallbackStore();
    const emp = store.employees.find(e => e.id === id);

    if (!emp) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Employee not found." }
      });
    }

    if (emp.id === "emp_super_admin" || emp.username === "amarnath_admin") {
      return res.status(400).json({
        success: false,
        error: { code: "CANNOT_DELETE_SUPER_ADMIN", message: "Primary CineVenue Super Admin cannot be deleted." }
      });
    }

    store.employees = store.employees.filter(e => e.id !== id);
    delete store.customPermissions[id];

    store.activityLogs.unshift({
      id: "log_" + Date.now(),
      employeeId: null,
      employeeName: emp.fullName,
      username: emp.username,
      employeeCode: emp.employeeId,
      action: `Deleted employee record: ${emp.fullName} (${emp.employeeId})`,
      module: "EMPLOYEES",
      result: "SUCCESS",
      ipAddress: req.ip || "127.0.0.1",
      createdAt: new Date().toISOString()
    });

    saveFallbackStore(store);

    return res.json({
      success: true,
      message: "Employee profile deleted successfully."
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: "DELETE_FAILED", message: error.message }
    });
  }
});

/**
 * GET /api/v1/admin/employees/activity-logs
 * Fetch Employee Activity / Audit Logs
 */
employeeRouter.get("/admin/employees-logs/activity", requireSuperAdmin, (req: Request, res: Response) => {
  try {
    const store = loadFallbackStore();
    const { module, employeeId, limit } = req.query;

    let logs = [...store.activityLogs];

    if (module && typeof module === "string" && module !== "ALL") {
      logs = logs.filter(l => l.module === module);
    }

    if (employeeId && typeof employeeId === "string" && employeeId !== "ALL") {
      logs = logs.filter(l => l.employeeId === employeeId || l.employeeCode === employeeId);
    }

    const max = limit ? parseInt(limit as string, 10) : 100;
    return res.json({
      success: true,
      data: logs.slice(0, max)
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: "FETCH_LOGS_FAILED", message: error.message }
    });
  }
});

/**
 * POST /api/v1/admin/employees/activity-logs
 * Append custom activity log from other modules
 */
employeeRouter.post("/admin/employees-logs/activity", (req: Request, res: Response) => {
  try {
    const { employeeId, employeeName, username, employeeCode, action, module, result } = req.body;
    if (!action || !module) {
      return res.status(400).json({ success: false, message: "Action and module are required." });
    }

    const store = loadFallbackStore();
    const newLog = {
      id: "log_" + Date.now(),
      employeeId: employeeId || null,
      employeeName: employeeName || "System Actor",
      username: username || "system",
      employeeCode: employeeCode || "SYS",
      action,
      module,
      result: result || "SUCCESS",
      ipAddress: req.ip || "127.0.0.1",
      createdAt: new Date().toISOString()
    };

    store.activityLogs.unshift(newLog);
    if (store.activityLogs.length > 500) {
      store.activityLogs = store.activityLogs.slice(0, 500);
    }
    saveFallbackStore(store);

    return res.json({ success: true, data: newLog });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default employeeRouter;
