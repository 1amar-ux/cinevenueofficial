import { prisma, TheatreBankAccountRecord } from "../../lib/prisma";
import {
  encryptAccountNumber,
  decryptAccountNumber,
  maskAccountNumber,
  isValidIFSC,
  isValidPAN,
  isValidGSTIN,
  sanitizeInput
} from "../../utils/bankEncryption";
import { BankVerificationStatus, TheatreBankAccount, TheatreSettlementRecord, TheatreBankStats } from "../../types";
import { logFinancialAudit } from "../../services/financialAuditService";

export interface CreateBankAccountDTO {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  confirmAccountNumber?: string;
  ifscCode: string;
  accountType?: 'Current' | 'Savings';
  branchName?: string;
  branchAddress?: string;
  beneficiaryName?: string;
  pan?: string;
  gstin?: string;
  upiId?: string;
  isPrimary?: boolean;
  createdBy?: string;
}

export interface UpdateBankAccountDTO {
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  confirmAccountNumber?: string;
  ifscCode?: string;
  accountType?: 'Current' | 'Savings';
  branchName?: string;
  branchAddress?: string;
  beneficiaryName?: string;
  pan?: string;
  gstin?: string;
  upiId?: string;
  updatedBy?: string;
}

// In-Memory Global Settlement Ledger History for Theatre Payouts
export const theatreSettlementLedger: TheatreSettlementRecord[] = [
  {
    id: "CV-SET-HYD-90421",
    theatreId: "1",
    theatreName: "IMAX Prasads",
    bankAccountId: "bank_acc_1",
    maskedAccountNumber: "XXXX XXXX 4921",
    ifscCode: "HDFC0000045",
    beneficiaryName: "Prasads Multiplex Pvt Ltd",
    bankName: "HDFC Bank",
    periodStart: "2026-07-01",
    periodEnd: "2026-07-31",
    grossSales: 450000,
    commission: 54000,
    taxes: 81000,
    netAmount: 315000,
    status: "SETTLED",
    utr: "UTR-NEFT-89124018",
    settlementDate: "2026-08-01T11:20:00Z",
    initiatedBy: "superadmin@cinevenue.com",
    idempotencyKey: "CV-SET-HYD-90421"
  },
  {
    id: "CV-SET-HYD-90422",
    theatreId: "2",
    theatreName: "PVR GVK One",
    bankAccountId: "bank_acc_2",
    maskedAccountNumber: "XXXX XXXX 8304",
    ifscCode: "ICIC0000104",
    beneficiaryName: "PVR INOX Limited - Hyderabad Ops",
    bankName: "ICICI Bank",
    periodStart: "2026-07-01",
    periodEnd: "2026-07-31",
    grossSales: 380000,
    commission: 45600,
    taxes: 68400,
    netAmount: 266000,
    status: "SETTLED",
    utr: "UTR-NEFT-94018471",
    settlementDate: "2026-08-01T11:45:00Z",
    initiatedBy: "superadmin@cinevenue.com",
    idempotencyKey: "CV-SET-HYD-90422"
  }
];

/**
 * Get all bank accounts for a specific theatre
 */
export async function getTheatreBankAccounts(theatreId: string | number): Promise<TheatreBankAccount[]> {
  const tId = String(theatreId);
  const records = await prisma.theatreBankAccount.findMany({
    where: { theatreId: tId, isActive: true }
  });

  return records.map(r => ({
    id: r.id,
    theatreId: r.theatreId,
    accountHolderName: r.accountHolderName,
    bankName: r.bankName,
    maskedAccountNumber: r.maskedAccountNumber,
    ifscCode: r.ifscCode,
    accountType: r.accountType,
    branchName: r.branchName,
    branchAddress: r.branchAddress || undefined,
    beneficiaryName: r.beneficiaryName,
    pan: r.pan || undefined,
    gstin: r.gstin || undefined,
    upiId: r.upiId || undefined,
    verificationStatus: r.verificationStatus as BankVerificationStatus,
    isPrimary: r.isPrimary,
    verifiedBy: r.verifiedBy || undefined,
    verifiedAt: r.verifiedAt ? r.verifiedAt.toISOString() : undefined,
    verificationNotes: r.verificationNotes || undefined,
    createdBy: r.createdBy,
    createdAt: r.createdAt.toISOString(),
    updatedBy: r.updatedBy || undefined,
    updatedAt: r.updatedAt ? r.updatedAt.toISOString() : undefined,
    isActive: r.isActive
  }));
}

/**
 * Add a new bank account for a theatre
 */
export async function addTheatreBankAccount(
  theatreId: string | number,
  data: CreateBankAccountDTO,
  adminUser: { id?: string; email?: string }
): Promise<TheatreBankAccount> {
  const tId = String(theatreId);

  // Input Validations
  if (!data.accountHolderName || !data.accountHolderName.trim()) {
    throw new Error("Account Holder Name is required.");
  }
  if (!data.bankName || !data.bankName.trim()) {
    throw new Error("Bank Name is required.");
  }
  if (!data.accountNumber || !data.accountNumber.trim()) {
    throw new Error("Bank Account Number is required.");
  }
  if (data.confirmAccountNumber && data.accountNumber.trim() !== data.confirmAccountNumber.trim()) {
    throw new Error("Account Number and Confirm Account Number do not match.");
  }
  if (!data.ifscCode || !isValidIFSC(data.ifscCode)) {
    throw new Error("Invalid Indian IFSC Code format. Expected format: 4 alphabets, 0, followed by 6 alphanumeric characters (e.g. HDFC0000045).");
  }
  if (data.pan && !isValidPAN(data.pan)) {
    throw new Error("Invalid PAN format. Expected format: 5 letters, 4 digits, 1 letter (e.g. AAACP1234F).");
  }
  if (data.gstin && !isValidGSTIN(data.gstin)) {
    throw new Error("Invalid GSTIN format.");
  }

  const rawAccNumber = data.accountNumber.replace(/\s+/g, "").trim();
  const maskedAccNumber = maskAccountNumber(rawAccNumber);
  const encryptedAccNumber = encryptAccountNumber(rawAccNumber);

  // Prevent accidental duplicate bank accounts for the same theatre with same account number
  const existingAccounts = await prisma.theatreBankAccount.findMany({
    where: { theatreId: tId, isActive: true }
  });

  const isDuplicate = existingAccounts.some(acc => {
    if (acc.maskedAccountNumber === maskedAccNumber && acc.ifscCode.toUpperCase() === data.ifscCode.trim().toUpperCase()) {
      return true;
    }
    return false;
  });

  if (isDuplicate) {
    throw new Error("A bank account with the same account number and IFSC code already exists for this venue.");
  }

  // Check if this is the very first account for the theatre - if so, make it default candidate
  const isFirst = existingAccounts.length === 0;
  const isPrimary = data.isPrimary !== undefined ? data.isPrimary : isFirst;

  const record = await prisma.theatreBankAccount.create({
    data: {
      theatreId: tId,
      accountHolderName: sanitizeInput(data.accountHolderName),
      bankName: sanitizeInput(data.bankName),
      encryptedAccountNumber: encryptedAccNumber,
      maskedAccountNumber: maskedAccNumber,
      ifscCode: data.ifscCode.trim().toUpperCase(),
      accountType: data.accountType || "Current",
      branchName: sanitizeInput(data.branchName || "Main Branch"),
      branchAddress: data.branchAddress ? sanitizeInput(data.branchAddress) : null,
      beneficiaryName: sanitizeInput(data.beneficiaryName || data.accountHolderName),
      pan: data.pan ? data.pan.trim().toUpperCase() : null,
      gstin: data.gstin ? data.gstin.trim().toUpperCase() : null,
      upiId: data.upiId ? data.upiId.trim() : null,
      verificationStatus: "Pending Verification",
      isPrimary: isPrimary,
      createdBy: adminUser.email || "superadmin@cinevenue.com",
      isActive: true
    }
  });

  // Financial Audit Logging
  recordAuditLog({
    adminId: adminUser.id || "ADMIN-01",
    adminEmail: adminUser.email || "superadmin@cinevenue.com",
    action: "THEATRE_BANK_ACCOUNT_ADDED",
    theatreId: tId,
    transactionId: record.id,
    oldValue: null,
    newValue: {
      bankAccountId: record.id,
      theatreId: tId,
      bankName: record.bankName,
      maskedAccount: record.maskedAccountNumber,
      ifsc: record.ifscCode,
      status: "Pending Verification"
    },
    reason: `Bank account added for theatre venue ID ${tId}`
  });

  return {
    id: record.id,
    theatreId: record.theatreId,
    accountHolderName: record.accountHolderName,
    bankName: record.bankName,
    maskedAccountNumber: record.maskedAccountNumber,
    ifscCode: record.ifscCode,
    accountType: record.accountType,
    branchName: record.branchName,
    branchAddress: record.branchAddress || undefined,
    beneficiaryName: record.beneficiaryName,
    pan: record.pan || undefined,
    gstin: record.gstin || undefined,
    upiId: record.upiId || undefined,
    verificationStatus: record.verificationStatus as BankVerificationStatus,
    isPrimary: record.isPrimary,
    createdBy: record.createdBy,
    createdAt: record.createdAt.toISOString(),
    isActive: record.isActive
  };
}

/**
 * Edit bank account
 */
export async function updateTheatreBankAccount(
  theatreId: string | number,
  bankAccountId: string,
  data: UpdateBankAccountDTO,
  adminUser: { id?: string; email?: string }
): Promise<TheatreBankAccount> {
  const existing = await prisma.theatreBankAccount.findUnique({
    where: { id: bankAccountId }
  });

  if (!existing || String(existing.theatreId) !== String(theatreId)) {
    throw new Error("Bank account record not found for this theatre.");
  }

  const updatePayload: any = {
    updatedBy: adminUser.email || "superadmin@cinevenue.com"
  };

  if (data.accountHolderName) updatePayload.accountHolderName = sanitizeInput(data.accountHolderName);
  if (data.bankName) updatePayload.bankName = sanitizeInput(data.bankName);
  if (data.ifscCode) {
    if (!isValidIFSC(data.ifscCode)) {
      throw new Error("Invalid Indian IFSC code.");
    }
    updatePayload.ifscCode = data.ifscCode.trim().toUpperCase();
  }
  if (data.accountType) updatePayload.accountType = data.accountType;
  if (data.branchName !== undefined) updatePayload.branchName = sanitizeInput(data.branchName);
  if (data.branchAddress !== undefined) updatePayload.branchAddress = sanitizeInput(data.branchAddress);
  if (data.beneficiaryName !== undefined) updatePayload.beneficiaryName = sanitizeInput(data.beneficiaryName);
  if (data.pan !== undefined) {
    if (data.pan && !isValidPAN(data.pan)) throw new Error("Invalid PAN.");
    updatePayload.pan = data.pan ? data.pan.trim().toUpperCase() : null;
  }
  if (data.gstin !== undefined) {
    if (data.gstin && !isValidGSTIN(data.gstin)) throw new Error("Invalid GSTIN.");
    updatePayload.gstin = data.gstin ? data.gstin.trim().toUpperCase() : null;
  }
  if (data.upiId !== undefined) updatePayload.upiId = data.upiId ? data.upiId.trim() : null;

  // If account number is changed, re-encrypt, re-mask and reset verification status to Pending
  if (data.accountNumber && data.accountNumber.trim()) {
    if (data.confirmAccountNumber && data.accountNumber.trim() !== data.confirmAccountNumber.trim()) {
      throw new Error("Account numbers do not match.");
    }
    const raw = data.accountNumber.replace(/\s+/g, "").trim();
    updatePayload.encryptedAccountNumber = encryptAccountNumber(raw);
    updatePayload.maskedAccountNumber = maskAccountNumber(raw);
    updatePayload.verificationStatus = "Pending Verification";
    updatePayload.verifiedBy = null;
    updatePayload.verifiedAt = null;
  }

  const updated = await prisma.theatreBankAccount.update({
    where: { id: bankAccountId },
    data: updatePayload
  });

  recordAuditLog({
    adminId: adminUser.id || "ADMIN-01",
    adminEmail: adminUser.email || "superadmin@cinevenue.com",
    action: "THEATRE_BANK_ACCOUNT_EDITED",
    theatreId: String(theatreId),
    transactionId: bankAccountId,
    oldValue: {
      bankName: existing.bankName,
      maskedAccount: existing.maskedAccountNumber,
      ifsc: existing.ifscCode,
      status: existing.verificationStatus
    },
    newValue: {
      bankName: updated.bankName,
      maskedAccount: updated.maskedAccountNumber,
      ifsc: updated.ifscCode,
      status: updated.verificationStatus
    },
    reason: `Bank account updated by admin for theatre ID ${theatreId}`
  });

  return {
    id: updated.id,
    theatreId: updated.theatreId,
    accountHolderName: updated.accountHolderName,
    bankName: updated.bankName,
    maskedAccountNumber: updated.maskedAccountNumber,
    ifscCode: updated.ifscCode,
    accountType: updated.accountType,
    branchName: updated.branchName,
    branchAddress: updated.branchAddress || undefined,
    beneficiaryName: updated.beneficiaryName,
    pan: updated.pan || undefined,
    gstin: updated.gstin || undefined,
    upiId: updated.upiId || undefined,
    verificationStatus: updated.verificationStatus as BankVerificationStatus,
    isPrimary: updated.isPrimary,
    verifiedBy: updated.verifiedBy || undefined,
    verifiedAt: updated.verifiedAt ? updated.verifiedAt.toISOString() : undefined,
    verificationNotes: updated.verificationNotes || undefined,
    createdBy: updated.createdBy,
    createdAt: updated.createdAt.toISOString(),
    updatedBy: updated.updatedBy || undefined,
    updatedAt: updated.updatedAt ? updated.updatedAt.toISOString() : undefined,
    isActive: updated.isActive
  };
}

/**
 * Verify bank account
 */
export async function verifyTheatreBankAccount(
  theatreId: string | number,
  bankAccountId: string,
  verificationNotes: string,
  adminUser: { id?: string; email?: string }
): Promise<TheatreBankAccount> {
  const existing = await prisma.theatreBankAccount.findUnique({
    where: { id: bankAccountId }
  });

  if (!existing || String(existing.theatreId) !== String(theatreId)) {
    throw new Error("Bank account record not found.");
  }

  const updated = await prisma.theatreBankAccount.update({
    where: { id: bankAccountId },
    data: {
      verificationStatus: "Verified",
      verifiedBy: adminUser.email || "superadmin@cinevenue.com",
      verifiedAt: new Date(),
      verificationNotes: sanitizeInput(verificationNotes || "Verified by CineVenue compliance team."),
      updatedBy: adminUser.email || "superadmin@cinevenue.com"
    }
  });

  recordAuditLog({
    adminId: adminUser.id || "ADMIN-01",
    adminEmail: adminUser.email || "superadmin@cinevenue.com",
    action: "THEATRE_BANK_ACCOUNT_VERIFIED",
    theatreId: String(theatreId),
    transactionId: bankAccountId,
    oldValue: { status: existing.verificationStatus },
    newValue: {
      status: "Verified",
      verifiedBy: updated.verifiedBy,
      verifiedAt: updated.verifiedAt,
      notes: updated.verificationNotes
    },
    reason: verificationNotes || "KYC and bank penny verification verified."
  });

  return {
    id: updated.id,
    theatreId: updated.theatreId,
    accountHolderName: updated.accountHolderName,
    bankName: updated.bankName,
    maskedAccountNumber: updated.maskedAccountNumber,
    ifscCode: updated.ifscCode,
    accountType: updated.accountType,
    branchName: updated.branchName,
    branchAddress: updated.branchAddress || undefined,
    beneficiaryName: updated.beneficiaryName,
    pan: updated.pan || undefined,
    gstin: updated.gstin || undefined,
    upiId: updated.upiId || undefined,
    verificationStatus: "Verified",
    isPrimary: updated.isPrimary,
    verifiedBy: updated.verifiedBy || undefined,
    verifiedAt: updated.verifiedAt ? updated.verifiedAt.toISOString() : undefined,
    verificationNotes: updated.verificationNotes || undefined,
    createdBy: updated.createdBy,
    createdAt: updated.createdAt.toISOString(),
    updatedBy: updated.updatedBy || undefined,
    updatedAt: updated.updatedAt ? updated.updatedAt.toISOString() : undefined,
    isActive: updated.isActive
  };
}

/**
 * Reject bank account
 */
export async function rejectTheatreBankAccount(
  theatreId: string | number,
  bankAccountId: string,
  rejectionReason: string,
  adminUser: { id?: string; email?: string }
): Promise<TheatreBankAccount> {
  const existing = await prisma.theatreBankAccount.findUnique({
    where: { id: bankAccountId }
  });

  if (!existing || String(existing.theatreId) !== String(theatreId)) {
    throw new Error("Bank account record not found.");
  }

  if (!rejectionReason || !rejectionReason.trim()) {
    throw new Error("A clear rejection reason is required.");
  }

  const updated = await prisma.theatreBankAccount.update({
    where: { id: bankAccountId },
    data: {
      verificationStatus: "Rejected",
      verificationNotes: sanitizeInput(rejectionReason),
      isPrimary: false, // Rejected account cannot be primary
      updatedBy: adminUser.email || "superadmin@cinevenue.com"
    }
  });

  recordAuditLog({
    adminId: adminUser.id || "ADMIN-01",
    adminEmail: adminUser.email || "superadmin@cinevenue.com",
    action: "THEATRE_BANK_ACCOUNT_REJECTED",
    theatreId: String(theatreId),
    transactionId: bankAccountId,
    oldValue: { status: existing.verificationStatus },
    newValue: { status: "Rejected", rejectionReason },
    reason: rejectionReason
  });

  return {
    id: updated.id,
    theatreId: updated.theatreId,
    accountHolderName: updated.accountHolderName,
    bankName: updated.bankName,
    maskedAccountNumber: updated.maskedAccountNumber,
    ifscCode: updated.ifscCode,
    accountType: updated.accountType,
    branchName: updated.branchName,
    branchAddress: updated.branchAddress || undefined,
    beneficiaryName: updated.beneficiaryName,
    pan: updated.pan || undefined,
    gstin: updated.gstin || undefined,
    upiId: updated.upiId || undefined,
    verificationStatus: "Rejected",
    isPrimary: false,
    verifiedBy: updated.verifiedBy || undefined,
    verifiedAt: updated.verifiedAt ? updated.verifiedAt.toISOString() : undefined,
    verificationNotes: updated.verificationNotes || undefined,
    createdBy: updated.createdBy,
    createdAt: updated.createdAt.toISOString(),
    updatedBy: updated.updatedBy || undefined,
    updatedAt: updated.updatedAt ? updated.updatedAt.toISOString() : undefined,
    isActive: updated.isActive
  };
}

/**
 * Suspend bank account
 */
export async function suspendTheatreBankAccount(
  theatreId: string | number,
  bankAccountId: string,
  reason: string,
  adminUser: { id?: string; email?: string }
): Promise<TheatreBankAccount> {
  const existing = await prisma.theatreBankAccount.findUnique({
    where: { id: bankAccountId }
  });

  if (!existing || String(existing.theatreId) !== String(theatreId)) {
    throw new Error("Bank account record not found.");
  }

  const updated = await prisma.theatreBankAccount.update({
    where: { id: bankAccountId },
    data: {
      verificationStatus: "Suspended",
      verificationNotes: sanitizeInput(reason || "Account suspended by CineVenue compliance risk review."),
      isPrimary: false,
      updatedBy: adminUser.email || "superadmin@cinevenue.com"
    }
  });

  recordAuditLog({
    adminId: adminUser.id || "ADMIN-01",
    adminEmail: adminUser.email || "superadmin@cinevenue.com",
    action: "THEATRE_BANK_ACCOUNT_SUSPENDED",
    theatreId: String(theatreId),
    transactionId: bankAccountId,
    oldValue: { status: existing.verificationStatus },
    newValue: { status: "Suspended", reason },
    reason: reason || "Suspension applied"
  });

  return {
    id: updated.id,
    theatreId: updated.theatreId,
    accountHolderName: updated.accountHolderName,
    bankName: updated.bankName,
    maskedAccountNumber: updated.maskedAccountNumber,
    ifscCode: updated.ifscCode,
    accountType: updated.accountType,
    branchName: updated.branchName,
    branchAddress: updated.branchAddress || undefined,
    beneficiaryName: updated.beneficiaryName,
    pan: updated.pan || undefined,
    gstin: updated.gstin || undefined,
    upiId: updated.upiId || undefined,
    verificationStatus: "Suspended",
    isPrimary: false,
    verifiedBy: updated.verifiedBy || undefined,
    verifiedAt: updated.verifiedAt ? updated.verifiedAt.toISOString() : undefined,
    verificationNotes: updated.verificationNotes || undefined,
    createdBy: updated.createdBy,
    createdAt: updated.createdAt.toISOString(),
    updatedBy: updated.updatedBy || undefined,
    updatedAt: updated.updatedAt ? updated.updatedAt.toISOString() : undefined,
    isActive: updated.isActive
  };
}

/**
 * Set a verified account as Primary Settlement Account
 */
export async function setPrimaryTheatreBankAccount(
  theatreId: string | number,
  bankAccountId: string,
  adminUser: { id?: string; email?: string }
): Promise<TheatreBankAccount> {
  const target = await prisma.theatreBankAccount.findUnique({
    where: { id: bankAccountId }
  });

  if (!target || String(target.theatreId) !== String(theatreId)) {
    throw new Error("Bank account record not found.");
  }

  // Strict Rule: ONLY Verified accounts can be set as primary
  if (target.verificationStatus !== "Verified") {
    throw new Error("Only a verified bank account can be marked as the primary settlement account.");
  }

  const updated = await prisma.theatreBankAccount.update({
    where: { id: bankAccountId },
    data: {
      isPrimary: true,
      updatedBy: adminUser.email || "superadmin@cinevenue.com"
    }
  });

  recordAuditLog({
    adminId: adminUser.id || "ADMIN-01",
    adminEmail: adminUser.email || "superadmin@cinevenue.com",
    action: "THEATRE_PRIMARY_BANK_CHANGED",
    theatreId: String(theatreId),
    transactionId: bankAccountId,
    oldValue: null,
    newValue: {
      primaryBankAccountId: bankAccountId,
      maskedAccount: target.maskedAccountNumber,
      ifsc: target.ifscCode
    },
    reason: `Primary settlement bank account updated for theatre ID ${theatreId}`
  });

  return {
    id: updated.id,
    theatreId: updated.theatreId,
    accountHolderName: updated.accountHolderName,
    bankName: updated.bankName,
    maskedAccountNumber: updated.maskedAccountNumber,
    ifscCode: updated.ifscCode,
    accountType: updated.accountType,
    branchName: updated.branchName,
    branchAddress: updated.branchAddress || undefined,
    beneficiaryName: updated.beneficiaryName,
    pan: updated.pan || undefined,
    gstin: updated.gstin || undefined,
    upiId: updated.upiId || undefined,
    verificationStatus: updated.verificationStatus as BankVerificationStatus,
    isPrimary: true,
    verifiedBy: updated.verifiedBy || undefined,
    verifiedAt: updated.verifiedAt ? updated.verifiedAt.toISOString() : undefined,
    verificationNotes: updated.verificationNotes || undefined,
    createdBy: updated.createdBy,
    createdAt: updated.createdAt.toISOString(),
    updatedBy: updated.updatedBy || undefined,
    updatedAt: updated.updatedAt ? updated.updatedAt.toISOString() : undefined,
    isActive: updated.isActive
  };
}

/**
 * Reveal full account number for authorized admin (with audit log)
 */
export async function revealFullAccountNumber(
  theatreId: string | number,
  bankAccountId: string,
  adminUser: { id?: string; email?: string }
): Promise<{ fullAccountNumber: string; maskedAccountNumber: string }> {
  const record = await prisma.theatreBankAccount.findUnique({
    where: { id: bankAccountId }
  });

  if (!record || String(record.theatreId) !== String(theatreId)) {
    throw new Error("Bank account record not found.");
  }

  const decrypted = decryptAccountNumber(record.encryptedAccountNumber);

  // Audit log this sensitive security event
  recordAuditLog({
    adminId: adminUser.id || "ADMIN-01",
    adminEmail: adminUser.email || "superadmin@cinevenue.com",
    action: "THEATRE_BANK_ACCOUNT_FULL_REVEALED",
    theatreId: String(theatreId),
    transactionId: bankAccountId,
    oldValue: null,
    newValue: { maskedAccount: record.maskedAccountNumber },
    reason: `Authorized security reveal of bank account number for theatre ID ${theatreId}`
  });

  return {
    fullAccountNumber: decrypted,
    maskedAccountNumber: record.maskedAccountNumber
  };
}

/**
 * Get settlement history for a theatre
 */
export async function getTheatreSettlementHistory(theatreId: string | number): Promise<TheatreSettlementRecord[]> {
  const tId = String(theatreId);
  return theatreSettlementLedger.filter(s => String(s.theatreId) === tId);
}

/**
 * Process a safe payout / settlement for a theatre
 */
export async function processTheatreSettlement(
  theatreId: string | number,
  theatreName: string,
  amount: number,
  grossSales: number,
  commission: number,
  taxes: number,
  idempotencyKey: string,
  adminUser: { id?: string; email?: string }
): Promise<TheatreSettlementRecord> {
  const tId = String(theatreId);

  // Check idempotency to prevent duplicate settlement
  if (idempotencyKey) {
    const existing = theatreSettlementLedger.find(s => s.idempotencyKey === idempotencyKey);
    if (existing) {
      return existing;
    }
  }

  // Safety Requirement: NEVER allow settlement to an unverified or missing bank account
  const primaryAccount = await prisma.theatreBankAccount.findFirst({
    where: {
      theatreId: tId,
      isPrimary: true,
      verificationStatus: "Verified",
      isActive: true
    }
  });

  if (!primaryAccount) {
    throw new Error("Cannot process settlement: Theatre has no verified primary bank account on file.");
  }

  if (amount <= 0) {
    throw new Error("Cannot process settlement for ₹0 balance.");
  }

  const settlementId = `CV-SET-${tId}-${Date.now().toString().slice(-6)}`;
  const utrNumber = `UTR-NEFT-${Math.floor(10000000 + Math.random() * 90000000)}`;

  const settlementRecord: TheatreSettlementRecord = {
    id: settlementId,
    theatreId: tId,
    theatreName: theatreName || "Venue Multiplex",
    bankAccountId: primaryAccount.id,
    maskedAccountNumber: primaryAccount.maskedAccountNumber,
    ifscCode: primaryAccount.ifscCode,
    beneficiaryName: primaryAccount.beneficiaryName,
    bankName: primaryAccount.bankName,
    periodStart: new Date(Date.now() - 30 * 86400 * 1000).toISOString().split("T")[0],
    periodEnd: new Date().toISOString().split("T")[0],
    grossSales: Number(grossSales.toFixed(2)),
    commission: Number(commission.toFixed(2)),
    taxes: Number(taxes.toFixed(2)),
    netAmount: Number(amount.toFixed(2)),
    status: "SETTLED",
    utr: utrNumber,
    settlementDate: new Date().toISOString(),
    initiatedBy: adminUser.email || "superadmin@cinevenue.com",
    idempotencyKey: idempotencyKey || settlementId
  };

  theatreSettlementLedger.unshift(settlementRecord);

  // Record in Prisma settlement store
  await prisma.settlement.create({
    data: {
      theatreId: tId,
      periodStart: new Date(settlementRecord.periodStart),
      periodEnd: new Date(settlementRecord.periodEnd),
      grossSales: settlementRecord.grossSales,
      commission: settlementRecord.commission,
      refunds: 0,
      netAmount: settlementRecord.netAmount,
      status: "SETTLED"
    }
  });

  // Financial Audit Log
  recordAuditLog({
    adminId: adminUser.id || "ADMIN-01",
    adminEmail: adminUser.email || "superadmin@cinevenue.com",
    action: "THEATRE_SETTLEMENT_DISBURSED",
    theatreId: tId,
    transactionId: settlementId,
    oldValue: null,
    newValue: {
      settlementId,
      netAmount: settlementRecord.netAmount,
      utr: utrNumber,
      beneficiary: primaryAccount.beneficiaryName,
      maskedAccount: primaryAccount.maskedAccountNumber,
      ifsc: primaryAccount.ifscCode
    },
    reason: `Disbursed theatre payout of ₹${settlementRecord.netAmount.toLocaleString("en-IN")} via NEFT to ${primaryAccount.beneficiaryName}`
  });

  return settlementRecord;
}

/**
 * Get dashboard stats for Theatre Bank Accounts card
 */
export async function getTheatreBankStats(): Promise<TheatreBankStats> {
  const allTheatres = await prisma.theatre.findMany();
  const allBankAccounts = await prisma.theatreBankAccount.findMany({
    where: { isActive: true }
  });

  const verified = allBankAccounts.filter(b => b.verificationStatus === "Verified").length;
  const pending = allBankAccounts.filter(b => b.verificationStatus === "Pending Verification").length;
  const rejected = allBankAccounts.filter(b => b.verificationStatus === "Rejected").length;
  const suspended = allBankAccounts.filter(b => b.verificationStatus === "Suspended").length;

  // Theatres with NO bank account
  const theatresWithBank = new Set(allBankAccounts.map(b => String(b.theatreId)));
  let missing = 0;
  allTheatres.forEach(t => {
    if (!theatresWithBank.has(String(t.id))) {
      missing++;
    }
  });

  return {
    totalAccounts: allBankAccounts.length,
    verified,
    pending,
    rejected,
    missingDetails: missing,
    suspended
  };
}

/**
 * Helper to record financial & administrative audit logs securely
 */
function recordAuditLog(payload: {
  adminId: string;
  adminEmail: string;
  action: string;
  theatreId: string;
  transactionId: string;
  oldValue: any;
  newValue: any;
  reason: string;
}) {
  try {
    logFinancialAudit({
      adminId: payload.adminId,
      adminEmail: payload.adminEmail,
      action: payload.action,
      transactionId: payload.transactionId,
      theatreId: payload.theatreId,
      oldValue: payload.oldValue,
      newValue: payload.newValue,
      reason: payload.reason
    });
  } catch (err) {
    console.error("Failed to record bank audit log safely", err);
  }
}
