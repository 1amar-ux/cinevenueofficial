import { randomUUID } from "crypto";

export const financeDb = {
  feeConfigs: [
    {
      id: "fc_default",
      version: "V1",
      effectiveFrom: new Date("2026-01-01"),
      status: "ACTIVE",
      feeMode: "PER_TICKET",
      calculation: "FIXED_SLAB",
      taxEnabled: true,
      taxRate: 18,
      createdAt: new Date()
    }
  ] as any[],
  feeSlabs: [
    { id: "fs_1", feeConfigId: "fc_default", minPrice: 50, maxPrice: 99, fee: 12 },
    { id: "fs_2", feeConfigId: "fc_default", minPrice: 100, maxPrice: 149, fee: 15 },
    { id: "fs_3", feeConfigId: "fc_default", minPrice: 150, maxPrice: 199, fee: 18 },
    { id: "fs_4", feeConfigId: "fc_default", minPrice: 200, maxPrice: 249, fee: 20 },
    { id: "fs_5", feeConfigId: "fc_default", minPrice: 250, maxPrice: 299, fee: 25 },
    { id: "fs_6", feeConfigId: "fc_default", minPrice: 300, maxPrice: 349, fee: 28 },
    { id: "fs_7", feeConfigId: "fc_default", minPrice: 350, maxPrice: 399, fee: 30 },
    { id: "fs_8", feeConfigId: "fc_default", minPrice: 400, maxPrice: 449, fee: 32 },
    { id: "fs_9", feeConfigId: "fc_default", minPrice: 450, maxPrice: 499, fee: 34 },
    { id: "fs_10", feeConfigId: "fc_default", minPrice: 500, maxPrice: 599, fee: 35 },
    { id: "fs_11", feeConfigId: "fc_default", minPrice: 600, maxPrice: 699, fee: 38 },
    { id: "fs_12", feeConfigId: "fc_default", minPrice: 700, maxPrice: 799, fee: 40 },
    { id: "fs_13", feeConfigId: "fc_default", minPrice: 800, maxPrice: 899, fee: 42 },
    { id: "fs_14", feeConfigId: "fc_default", minPrice: 900, maxPrice: 1000, fee: 45 },
    { id: "fs_15", feeConfigId: "fc_default", minPrice: 1001, maxPrice: 999999, fee: 50 } // fallback
  ] as any[],
  taxConfigs: [
    {
      id: "tc_default",
      version: "T1",
      effectiveFrom: new Date("2026-01-01"),
      status: "ACTIVE",
      type: "CINEMA_TICKET",
      rules: [
        { maxPrice: 100, rate: 5 },
        { minPrice: 101, maxPrice: 999999, rate: 18 }
      ],
      createdAt: new Date()
    }
  ] as any[],
  commissionConfigs: [
    {
      id: "cc_default",
      type: "GLOBAL", // GLOBAL or THEATRE
      theatreId: null,
      defaultRate: 7,
      volumeRules: [
        { minTickets: 0, maxTickets: 5000, rate: 8 },
        { minTickets: 5001, maxTickets: 15000, rate: 7 },
        { minTickets: 15001, maxTickets: 30000, rate: 6 },
        { minTickets: 30001, maxTickets: 9999999, rate: 5 }
      ],
      createdAt: new Date()
    }
  ] as any[],
  paymentOrders: [] as any[],
  paymentTransactions: [] as any[],
  paymentWebhooks: [] as any[],
  refunds: [] as any[],
  settlementLedgers: [] as any[]
};
