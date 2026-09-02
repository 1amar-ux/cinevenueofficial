export interface PermissionMatrix {
  [category: string]: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    approve: boolean;
    export: boolean;
  };
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: PermissionMatrix;
  isSystem?: boolean; // Can't delete core system roles
}

export interface Admin {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  gender: 'Male' | 'Female' | 'Other';
  profileImage: string;
  role: string; // references role.name
  department: string;
  employeeId: string;
  address: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  lastLogin: string;
  createdDate: string;
  permissions?: PermissionMatrix; // Custom/assigned permissions
}

export interface LoginActivity {
  id: string;
  adminName: string;
  adminEmail: string;
  ipAddress: string;
  browser: string;
  os: string;
  device: 'Desktop' | 'Mobile' | 'Tablet';
  location: string;
  loginTime: string;
  logoutTime: string;
  status: 'Success' | 'Failed';
}

export interface AuditLog {
  id: string;
  adminName: string;
  adminEmail: string;
  action: string;
  module: string; // e.g. "Admin Management", "Theatres", etc.
  description: string;
  oldData?: string;
  newData?: string;
  ipAddress: string;
  timestamp: string;
  status: 'Success' | 'Failed';
}

export interface SpecificBankPermissions {
  theatre_bank_view: boolean;
  theatre_bank_add: boolean;
  theatre_bank_edit: boolean;
  theatre_bank_verify: boolean;
  theatre_bank_settlement: boolean;
}

export const PERMISSION_CATEGORIES = [
  "Dashboard",
  "Admin Management",
  "Users",
  "Theatre Owners",
  "Theatres",
  "Bank & Settlements",
  "Movies",
  "Shows",
  "Bookings",
  "Payments",
  "Refunds",
  "Coupons",
  "Reports",
  "Analytics",
  "Notifications",
  "CMS",
  "Settings"
];

export const DEFAULT_PERMISSION_MATRIX: PermissionMatrix = PERMISSION_CATEGORIES.reduce((acc, cat) => {
  acc[cat] = {
    create: false,
    read: true,
    update: false,
    delete: false,
    approve: false,
    export: false
  };
  return acc;
}, {} as PermissionMatrix);

export const SUPER_ADMIN_PERMISSION_MATRIX: PermissionMatrix = PERMISSION_CATEGORIES.reduce((acc, cat) => {
  acc[cat] = {
    create: true,
    read: true,
    update: true,
    delete: true,
    approve: true,
    export: true
  };
  return acc;
}, {} as PermissionMatrix);
