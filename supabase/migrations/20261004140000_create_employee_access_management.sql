-- Migration: 20261004140000_create_employee_access_management.sql
-- Stage 1: Database Foundation for Employee Access Management & RBAC

-- 1. Create Enum EmployeeStatus if not exists
DO $$ BEGIN
    CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'INACTIVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Table "Role"
CREATE TABLE IF NOT EXISTS "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "isSystemRole" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Role_name_key" ON "Role"("name");

-- 3. Create Table "Permission"
CREATE TABLE IF NOT EXISTS "Permission" (
    "id" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Permission_module_action_key" ON "Permission"("module", "action");
CREATE INDEX IF NOT EXISTS "Permission_module_idx" ON "Permission"("module");
CREATE INDEX IF NOT EXISTS "Permission_action_idx" ON "Permission"("action");

-- 4. Create Table "RolePermission"
CREATE TABLE IF NOT EXISTS "RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");
CREATE INDEX IF NOT EXISTS "RolePermission_roleId_idx" ON "RolePermission"("roleId");
CREATE INDEX IF NOT EXISTS "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- 5. Create Table "Employee"
CREATE TABLE IF NOT EXISTS "Employee" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT,
    "department" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Employee_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Employee_employeeId_key" ON "Employee"("employeeId");
CREATE UNIQUE INDEX IF NOT EXISTS "Employee_username_key" ON "Employee"("username");
CREATE UNIQUE INDEX IF NOT EXISTS "Employee_email_key" ON "Employee"("email");
CREATE INDEX IF NOT EXISTS "Employee_employeeId_idx" ON "Employee"("employeeId");
CREATE INDEX IF NOT EXISTS "Employee_username_idx" ON "Employee"("username");
CREATE INDEX IF NOT EXISTS "Employee_email_idx" ON "Employee"("email");
CREATE INDEX IF NOT EXISTS "Employee_roleId_idx" ON "Employee"("roleId");
CREATE INDEX IF NOT EXISTS "Employee_status_idx" ON "Employee"("status");

-- 6. Create Table "EmployeePermission"
CREATE TABLE IF NOT EXISTS "EmployeePermission" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "isGranted" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmployeePermission_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "EmployeePermission_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EmployeePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "EmployeePermission_employeeId_permissionId_key" ON "EmployeePermission"("employeeId", "permissionId");
CREATE INDEX IF NOT EXISTS "EmployeePermission_employeeId_idx" ON "EmployeePermission"("employeeId");
CREATE INDEX IF NOT EXISTS "EmployeePermission_permissionId_idx" ON "EmployeePermission"("permissionId");

-- 7. Create Table "EmployeeActivityLog"
CREATE TABLE IF NOT EXISTS "EmployeeActivityLog" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT,
    "employeeName" TEXT,
    "username" TEXT,
    "employeeCode" TEXT,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "result" TEXT NOT NULL DEFAULT 'SUCCESS',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB DEFAULT '{}'::jsonb,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmployeeActivityLog_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "EmployeeActivityLog_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "EmployeeActivityLog_employeeId_idx" ON "EmployeeActivityLog"("employeeId");
CREATE INDEX IF NOT EXISTS "EmployeeActivityLog_module_idx" ON "EmployeeActivityLog"("module");
CREATE INDEX IF NOT EXISTS "EmployeeActivityLog_action_idx" ON "EmployeeActivityLog"("action");
CREATE INDEX IF NOT EXISTS "EmployeeActivityLog_createdAt_idx" ON "EmployeeActivityLog"("createdAt");
