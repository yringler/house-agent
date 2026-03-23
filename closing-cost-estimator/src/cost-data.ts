/**
 * Buyer's Closing Cost Estimator — Complete Lookup Data
 * Extracted from BUYERS_CLOSING_COST_2025__23_.xlsx
 *
 * Use this file alongside BUYERS_CLOSING_COST_ANALYSIS.md to build a web app
 * that replicates the spreadsheet's calculations.
 */

// =============================================================================
// TITLE INSURANCE — Tiered rate schedule
// =============================================================================
// The spreadsheet uses a VLOOKUP into a 2000-row table (Sheet2 A:B).
// Instead of embedding 2000 rows, here's the piecewise formula that generates
// the same values. Use getTitleInsurancePremium() below.
//
// For prices > $500K, the spreadsheet's own formula is:
//   ((price - 500000) / 1000) * 4 + 2904
// BUT that formula disagrees with the actual table data (which uses $4.56/1K
// for 501K–1M and $3.42/1K for 1M–2M). The table data is authoritative.
// The $2904 + $4/1K formula is a simplified approximation the spreadsheet
// only uses as a fallback. Use the tiered rates below for accuracy.

export const TITLE_INSURANCE_TIERS = [
  { maxPrice: 30_000, basePremium: 569, ratePerThousand: 0 },       // flat $569
  { maxPrice: 45_000, basePremium: 569, ratePerThousand: 7.41 },    // $7.41/1K over $30K
  { maxPrice: 100_000, basePremium: 680.15, ratePerThousand: 6.27 }, // $6.27/1K over $45K
  { maxPrice: 500_000, basePremium: 1025, ratePerThousand: 5.70 },   // $5.70/1K over $100K
  { maxPrice: 1_000_000, basePremium: 3305, ratePerThousand: 4.56 }, // $4.56/1K over $500K
  { maxPrice: 2_000_000, basePremium: 5585, ratePerThousand: 3.42 }, // $3.42/1K over $1M
] as const;

/**
 * Calculate title insurance premium from purchase price.
 * Replicates VLOOKUP(D12, titlechart, 2) for prices up to $2M.
 * For prices > $2M, extrapolates at the $3.42/1K rate.
 */
export function getTitleInsurancePremium(purchasePrice: number): number {
  if (purchasePrice <= 0) return 0;

  let prevMax = 0;
  for (const tier of TITLE_INSURANCE_TIERS) {
    if (purchasePrice <= tier.maxPrice) {
      const thousandsOver = Math.floor((purchasePrice - prevMax) / 1000);
      return tier.basePremium + thousandsOver * tier.ratePerThousand;
    }
    prevMax = tier.maxPrice;
  }
  // Beyond $2M: extrapolate
  const lastTier = TITLE_INSURANCE_TIERS[TITLE_INSURANCE_TIERS.length - 1];
  const thousandsOver = Math.floor((purchasePrice - lastTier.maxPrice) / 1000);
  return (
    lastTier.basePremium +
    ((lastTier.maxPrice - 1_000_000) / 1000) * lastTier.ratePerThousand +
    thousandsOver * lastTier.ratePerThousand
  );
}

// =============================================================================
// PMI CHART
// =============================================================================
// The spreadsheet's pmichart (Sheet2 D:E) maps LTV ranges to annual PMI rates.
// In the current data, every LTV from 80.01 to 97 maps to 0.94%.
// This is likely simplified — real PMI varies by LTV band. But matching the
// spreadsheet means: if LTV > 80, PMI rate = 0.52% (the value in L74).
//
// IMPORTANT: The spreadsheet actually uses L74 = 0.52 in the PMI formula:
//   I66 = IF(LTV > 80, (loanAmount * 0.52) / 100 / 12, "")
// So the effective annual PMI rate used is 0.52%, not 0.94%.
// The pmichart appears to be vestigial/unused in the actual mortgage insurance calc.

export const PMI_ANNUAL_RATE_PERCENT = 0.52; // L74 value, used in actual formula

export const PMI_CHART = [
  { ltvMin: 80.01, ltvMax: 85.0, annualRate: 0.94 },
  { ltvMin: 85.01, ltvMax: 90.0, annualRate: 0.94 },
  { ltvMin: 90.01, ltvMax: 97.0, annualRate: 0.94 },
] as const;

// =============================================================================
// CLOSING DATE → ESCROW/ADJUSTMENT MONTH LOOKUPS
// =============================================================================
// These charts map closing month to the number of months for each
// escrow/adjustment category. The VLOOKUP matches on the 1st of the
// closing month (approximate match, sorted ascending).

export interface MonthLookupEntry {
  /** First of month, ISO date string */
  closingMonth: string;
  /** Number of months */
  months: number;
}

/** County/Municipal tax adjustment months (calendar year Jan 1 – Dec 31) */
export const CM_ADJUST_CHART: MonthLookupEntry[] = [
  { closingMonth: "2024-12-01", months: 0 },
  { closingMonth: "2025-01-01", months: -1 },
  { closingMonth: "2025-02-01", months: -2 },
  { closingMonth: "2025-03-01", months: 9 },
  { closingMonth: "2025-04-01", months: 8 },
  { closingMonth: "2025-05-01", months: 7 },
  { closingMonth: "2025-06-01", months: 6 },
  { closingMonth: "2025-07-01", months: 5 },
  { closingMonth: "2025-08-01", months: 4 },
  { closingMonth: "2025-09-01", months: 3 },
  { closingMonth: "2025-10-01", months: 2 },
  { closingMonth: "2025-11-01", months: 1 },
  { closingMonth: "2025-12-01", months: 0 },
];

/** School tax adjustment months (fiscal year Jul 1 – Jun 30) */
export const SCHOOL_ADJUST_CHART: MonthLookupEntry[] = [
  { closingMonth: "2024-12-01", months: 6 },
  { closingMonth: "2025-01-01", months: 5 },
  { closingMonth: "2025-02-01", months: 4 },
  { closingMonth: "2025-03-01", months: 3 },
  { closingMonth: "2025-04-01", months: 2 },
  { closingMonth: "2025-05-01", months: 1 },
  { closingMonth: "2025-06-01", months: 0 },
  { closingMonth: "2025-07-01", months: -1 },
  { closingMonth: "2025-08-01", months: 10 },
  { closingMonth: "2025-09-01", months: 9 },
  { closingMonth: "2025-10-01", months: 8 },
  { closingMonth: "2025-11-01", months: 7 },
  { closingMonth: "2025-12-01", months: 6 },
];

/** County/Municipal escrow reserve months */
export const ESCROW_CM_CHART: MonthLookupEntry[] = [
  { closingMonth: "2024-12-01", months: 11 },
  { closingMonth: "2025-01-01", months: 12 },
  { closingMonth: "2025-02-01", months: 13 },
  { closingMonth: "2025-03-01", months: 2 },
  { closingMonth: "2025-04-01", months: 3 },
  { closingMonth: "2025-05-01", months: 4 },
  { closingMonth: "2025-06-01", months: 5 },
  { closingMonth: "2025-07-01", months: 6 },
  { closingMonth: "2025-08-01", months: 7 },
  { closingMonth: "2025-09-01", months: 8 },
  { closingMonth: "2025-10-01", months: 9 },
  { closingMonth: "2025-11-01", months: 10 },
  { closingMonth: "2025-12-01", months: 11 },
];

/** School tax escrow reserve months */
export const ESCROW_SCHOOL_CHART: MonthLookupEntry[] = [
  { closingMonth: "2024-12-01", months: 6 },
  { closingMonth: "2025-01-01", months: 7 },
  { closingMonth: "2025-02-01", months: 8 },
  { closingMonth: "2025-03-01", months: 9 },
  { closingMonth: "2025-04-01", months: 10 },
  { closingMonth: "2025-05-01", months: 11 },
  { closingMonth: "2025-06-01", months: 12 },
  { closingMonth: "2025-07-01", months: 13 },
  { closingMonth: "2025-08-01", months: 2 },
  { closingMonth: "2025-09-01", months: 3 },
  { closingMonth: "2025-10-01", months: 4 },
  { closingMonth: "2025-11-01", months: 5 },
  { closingMonth: "2025-12-01", months: 6 },
];

// =============================================================================
// FIRST PAYMENT DATE
// =============================================================================
// Closing month → first mortgage payment date (always 1st of month, ~2 months later)

export interface FirstPaymentEntry {
  closingMonth: string;
  firstPayment: string;
}

export const FIRST_PAYMENT_CHART: FirstPaymentEntry[] = [
  { closingMonth: "2024-12-01", firstPayment: "2025-02-01" },
  { closingMonth: "2025-01-01", firstPayment: "2025-03-01" },
  { closingMonth: "2025-02-01", firstPayment: "2025-04-01" },
  { closingMonth: "2025-03-01", firstPayment: "2025-05-01" },
  { closingMonth: "2025-04-01", firstPayment: "2025-06-01" },
  { closingMonth: "2025-05-01", firstPayment: "2025-07-01" },
  { closingMonth: "2025-06-01", firstPayment: "2025-08-01" },
  { closingMonth: "2025-07-01", firstPayment: "2025-09-01" },
  { closingMonth: "2025-08-01", firstPayment: "2025-10-01" },
  { closingMonth: "2025-09-01", firstPayment: "2025-11-01" },
  { closingMonth: "2025-10-01", firstPayment: "2025-12-01" },
  { closingMonth: "2025-11-01", firstPayment: "2026-01-01" },
  { closingMonth: "2025-12-01", firstPayment: "2026-02-01" },
];

/**
 * Generalized first payment: always the 1st of the month, 2 months after
 * closing month. Use this if closing date falls outside the chart range.
 */
export function getFirstPaymentDate(closingDate: Date): Date {
  const d = new Date(closingDate);
  d.setMonth(d.getMonth() + 2);
  d.setDate(1);
  return d;
}

// =============================================================================
// TAX PRORATION ENGINE
// =============================================================================
// The spreadsheet computes how many days the seller has occupied the property
// in the current tax period, to determine the seller's share of taxes.
//
// School taxes: fiscal year Jul 1 – Jun 30
//   - Find which fiscal year the closing date falls in
//   - Seller's days = closingDate - (previous Jun 30)
//
// County/Municipal taxes: calendar year Jan 1 – Dec 31
//   - Seller's days = closingDate - (previous Dec 31)
//
// Per-diem rate = annual tax / 365
// Seller's share = seller's days × per-diem
// Amount due to/from seller = total tax paid by seller - seller's share
//
// The spreadsheet chains IF formulas across year boundaries (1999–2032).
// In code, this simplifies to:

export interface TaxProrationConfig {
  /** Current C/M tax year end (configurable, currently 2024-12-31) */
  endOfYearCm: string;
  /** Current school tax year end (configurable, currently 2025-06-30) */
  endOfYearSchool: string;
  /** C/M tax bill due date */
  billDueCm: string;
  /** School tax bill due date */
  billDueSchool: string;
}

export const TAX_PRORATION_CONFIG: TaxProrationConfig = {
  endOfYearCm: "2024-12-31",
  endOfYearSchool: "2025-06-30",
  billDueCm: "2024-02-28",
  billDueSchool: "2025-08-31",
};

/**
 * For school tax proration: compute seller's days from the most recent
 * Jul 1 (start of school fiscal year) to closing date.
 *
 * The spreadsheet walks through Jun 30 boundaries:
 *   IF(closingDate <= 2025-06-30, closingDate - 2024-06-30, ...)
 *
 * In code: find the Jun 30 just before the closing date, then
 * seller's days = closingDate - that Jun 30.
 */
export function getSchoolTaxSellerDays(closingDate: Date): number {
  const year = closingDate.getFullYear();
  const month = closingDate.getMonth(); // 0-indexed
  // School fiscal year starts Jul 1. If closing is Jul–Dec, the fiscal year
  // started Jul 1 of the same year (boundary = Jun 30 of same year).
  // If closing is Jan–Jun, fiscal year started Jul 1 of previous year
  // (boundary = Jun 30 of previous year).
  const boundaryYear = month >= 6 ? year : year - 1;
  const boundary = new Date(boundaryYear, 5, 30); // Jun 30
  const diffMs = closingDate.getTime() - boundary.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * For C/M tax proration: compute seller's days from the most recent
 * Jan 1 (start of calendar year) to closing date.
 *
 * The spreadsheet walks through Dec 31 boundaries:
 *   IF(closingDate <= 2025-12-31, closingDate - 2024-12-31, ...)
 *
 * In code: seller's days = closingDate - (Dec 31 of previous year).
 */
export function getCmTaxSellerDays(closingDate: Date): number {
  const boundary = new Date(closingDate.getFullYear() - 1, 11, 31); // Dec 31 prev year
  const diffMs = closingDate.getTime() - boundary.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

// =============================================================================
// HARDCODED FEES
// =============================================================================

export const FEES = {
  appraisal: 460,
  creditReport: 35,
  taxService: 100,
  administration: 639,
  floodCert: 19,
  closingEscrow: 25,
  docPrep: 100,
  notary: 20,
  altaEndorsements: 200,
  cplLetter: 125,
  recordingFees: 140,
  pinCertWithMortgage: 30,
  pinCertCashOnly: 15,
  /** Default transfer tax rate (decimal) */
  defaultTransferTaxRate: 0.01,

  // Inspections
  structural: 300,
  radon: 150,
  pest: 100,
  septic: 400,
  well: 100,

  // Mortgage insurance
  fhaUfmipRate: 0.0175,
  vaFundingFeeRate: 0.0215,
  fhaMipAnnualRate: 0.0085,

  // Hazard insurance
  hazardInsMinimum: 550,
  hazardInsRatePerThousand: 6,
  hazardInsMinPriceThreshold: 100_000,

  // Flood insurance
  floodMandatoryRate: 0.0175,
  floodOptionalFlat: 450,

  // Mortgage
  defaultTermMonths: 360,
  interestDayBasis: 360,
} as const;

// =============================================================================
// LOOKUP HELPER
// =============================================================================

/**
 * Replicates Excel VLOOKUP with approximate match (sorted ascending).
 * Finds the largest closingMonth <= the target date's first-of-month.
 */
export function lookupByClosingMonth(
  chart: MonthLookupEntry[],
  closingDate: Date
): number | null {
  const targetFirst = new Date(
    closingDate.getFullYear(),
    closingDate.getMonth(),
    1
  );
  let result: number | null = null;
  for (const entry of chart) {
    const entryDate = new Date(entry.closingMonth);
    if (entryDate <= targetFirst) {
      result = entry.months;
    } else {
      break;
    }
  }
  return result;
}