import { Admin, Role, LoginActivity, AuditLog, SUPER_ADMIN_PERMISSION_MATRIX, DEFAULT_PERMISSION_MATRIX } from "./types";

export const INITIAL_ROLES: Role[] = [
  {
    id: "r1",
    name: "Super Admin",
    description: "Full system administration authority. Access to all modules, credentials, and settings.",
    permissions: SUPER_ADMIN_PERMISSION_MATRIX,
    isSystem: true
  },
  {
    id: "r2",
    name: "Platform Admin",
    description: "Handles users, owners, theatres, and global content moderation.",
    permissions: (() => {
      const p = JSON.parse(JSON.stringify(SUPER_ADMIN_PERMISSION_MATRIX));
      p["Settings"].update = false;
      p["Settings"].delete = false;
      return p;
    })(),
    isSystem: true
  },
  {
    id: "r3",
    name: "Finance Admin",
    description: "Manages pricing matrices, payments, refunds, taxes, and financial logs.",
    permissions: (() => {
      const p = JSON.parse(JSON.stringify(DEFAULT_PERMISSION_MATRIX));
      p["Payments"] = { create: true, read: true, update: true, delete: false, approve: true, export: true };
      p["Refunds"] = { create: true, read: true, update: true, delete: false, approve: true, export: true };
      p["Reports"] = { create: true, read: true, update: true, delete: false, approve: true, export: true };
      return p;
    })(),
    isSystem: true
  },
  {
    id: "r4",
    name: "Movie Admin",
    description: "Responsible for movie entries, posters, genres, and active movie schedules.",
    permissions: (() => {
      const p = JSON.parse(JSON.stringify(DEFAULT_PERMISSION_MATRIX));
      p["Movies"] = { create: true, read: true, update: true, delete: true, approve: true, export: true };
      p["Shows"] = { create: true, read: true, update: true, delete: true, approve: true, export: true };
      return p;
    })(),
    isSystem: true
  },
  {
    id: "r5",
    name: "Theatre Admin",
    description: "Handles multiplex configurations, layouts, and seat maps.",
    permissions: (() => {
      const p = JSON.parse(JSON.stringify(DEFAULT_PERMISSION_MATRIX));
      p["Theatres"] = { create: true, read: true, update: true, delete: true, approve: true, export: true };
      return p;
    })(),
    isSystem: true
  },
  {
    id: "r6",
    name: "Support Admin",
    description: "Resolves client tickets, processes refunds, and moderates reviews.",
    permissions: (() => {
      const p = JSON.parse(JSON.stringify(DEFAULT_PERMISSION_MATRIX));
      p["Users"].read = true;
      p["CMS"] = { create: true, read: true, update: true, delete: false, approve: false, export: false };
      p["Refunds"] = { create: true, read: true, update: false, delete: false, approve: false, export: false };
      return p;
    })(),
    isSystem: true
  },
  {
    id: "r7",
    name: "Marketing Admin",
    description: "Launches campaigns, broadcasts notifications, and manages coupons/promos.",
    permissions: (() => {
      const p = JSON.parse(JSON.stringify(DEFAULT_PERMISSION_MATRIX));
      p["Coupons"] = { create: true, read: true, update: true, delete: true, approve: true, export: true };
      p["Notifications"] = { create: true, read: true, update: true, delete: true, approve: true, export: true };
      return p;
    })(),
    isSystem: true
  },
  {
    id: "r8",
    name: "Analytics Admin",
    description: "Reads dashboard reports, occupancy metrics, and downloads csv logs.",
    permissions: (() => {
      const p = JSON.parse(JSON.stringify(DEFAULT_PERMISSION_MATRIX));
      p["Analytics"] = { create: false, read: true, update: false, delete: false, approve: false, export: true };
      p["Reports"] = { create: false, read: true, update: false, delete: false, approve: false, export: true };
      return p;
    })(),
    isSystem: true
  }
];

export const INITIAL_ADMINS: Admin[] = [
  {
    id: "ADM-1001",
    fullName: "Amarnath Gattem",
    email: "amarnathgattem@gmail.com",
    mobileNumber: "9876543210",
    gender: "Male",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    role: "Super Admin",
    department: "Executive Control",
    employeeId: "EMP-SA-01",
    address: "Jubilee Hills, Road No. 36, Hyderabad, India",
    status: "Active",
    lastLogin: "Just now",
    createdDate: "2025-01-10",
    permissions: SUPER_ADMIN_PERMISSION_MATRIX
  }
];

export const INITIAL_LOGIN_ACTIVITIES: LoginActivity[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
