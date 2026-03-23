import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  FEES,
  getTitleInsurancePremium,
  lookupByClosingMonth,
  getFirstPaymentDate,
  FIRST_PAYMENT_CHART,
  CM_ADJUST_CHART,
  SCHOOL_ADJUST_CHART,
  ESCROW_CM_CHART,
  ESCROW_SCHOOL_CHART,
  PMI_ANNUAL_RATE_PERCENT,
} from '../../cost-data';

export type MortgageType = 'conventional' | 'fha' | 'va' | 'cash';
export type FloodCategory = 'none' | 'mandatory' | 'optional';

export interface FormInputs {
  closingDate: string;
  purchasePrice: number;
  totalLoanAmount: number;
  deposit: number;
  sellersAssist: number;
  interestRate: number;
  loanTermMonths: number;
  schoolTaxesAnnual: number;
  countyMuniTaxesAnnual: number;
  escrowing: boolean;
  mortgageType: MortgageType;
  originationFeePercent: number;
  transferTaxRate: number;
  attorneyFee: number;
  brokerFee: number;
  hoaFeeMonthly: number;
  inspStructural: boolean;
  inspRadon: boolean;
  inspPest: boolean;
  inspSeptic: boolean;
  inspWell: boolean;
  inspOther: number;
  floodCategory: FloodCategory;
  landOnly: boolean;
}

function defaultInputs(): FormInputs {
  return {
    closingDate: '',
    purchasePrice: 0,
    totalLoanAmount: 0,
    deposit: 0,
    sellersAssist: 0,
    interestRate: 6.5,
    loanTermMonths: 360,
    schoolTaxesAnnual: 0,
    countyMuniTaxesAnnual: 0,
    escrowing: true,
    mortgageType: 'conventional',
    originationFeePercent: 0,
    transferTaxRate: 1,
    attorneyFee: 0,
    brokerFee: 0,
    hoaFeeMonthly: 0,
    inspStructural: false,
    inspRadon: false,
    inspPest: false,
    inspSeptic: false,
    inspWell: false,
    inspOther: 0,
    floodCategory: 'none',
    landOnly: false,
  };
}

function pmt(annualRate: number, termMonths: number, principal: number): number {
  if (principal === 0 || annualRate === 0) return 0;
  const r = annualRate / 12;
  return (r * principal) / (1 - Math.pow(1 + r, -termMonths));
}

interface CalcResults {
  hasLoan: boolean;
  closingDateObj: Date | null;
  firstPaymentDate: Date | null;
  outOfChartRange: boolean;

  originationFee: number;
  appraisalFee: number;
  creditReport: number;
  taxService: number;
  administrationFee: number;
  floodCert: number;
  section800Total: number;

  closingEscrowFee: number;
  docPrepFee: number;
  notaryFee: number;
  attorneyFee: number;
  titleInsurance: number;
  altaEndorsements: number;
  cplLetter: number;
  brokerFee: number;
  section1100Total: number;

  recordingFees: number;
  transferTax: number;
  pinCert: number;
  section1200Total: number;

  inspStructural: number;
  inspRadon: number;
  inspPest: number;
  inspSeptic: number;
  inspWell: number;
  inspOther: number;
  section1300Total: number;

  estimatedClosingCosts: number;

  perDiemDays: number;
  perDiemRate: number;
  perDiemTotal: number;
  hazardInsurance: number;
  floodInsurance: number;

  hazardInsReserveMonths: number;
  hazardInsReserve: number;
  schoolTaxReserveMonths: number;
  schoolTaxReserve: number;
  cmTaxReserveMonths: number;
  cmTaxReserve: number;
  schoolTaxAdjustMonths: number;
  schoolTaxAdjust: number;
  cmTaxAdjustMonths: number;
  cmTaxAdjust: number;

  estimatedPrepaidItems: number;
  totalSettlementCharges: number;

  ufmipFundingFee: number;
  finalLoanAmount: number;
  downPaymentAndCosts: number;
  totalFundsToClose: number;

  mortgagePayment: number;
  hazardInsMonthly: number;
  floodInsMonthly: number;
  reTaxesMonthly: number;
  mortgageInsurance: number;
  ltv: number;
  totalMonthlyPayment: number;
}

function calculate(f: FormInputs): CalcResults {
  const hasLoan = f.mortgageType !== 'cash' && f.totalLoanAmount > 0;
  const loanAmount = hasLoan ? f.totalLoanAmount : 0;

  let closingDateObj: Date | null = null;
  let firstPaymentDate: Date | null = null;
  let outOfChartRange = false;

  if (f.closingDate) {
    closingDateObj = new Date(f.closingDate + 'T12:00:00');

    const chartEntry = FIRST_PAYMENT_CHART.find(e => {
      const entryDate = new Date(e.closingMonth + 'T12:00:00');
      return (
        entryDate.getFullYear() === closingDateObj!.getFullYear() &&
        entryDate.getMonth() === closingDateObj!.getMonth()
      );
    });
    if (chartEntry) {
      firstPaymentDate = new Date(chartEntry.firstPayment + 'T12:00:00');
    } else {
      firstPaymentDate = getFirstPaymentDate(closingDateObj);
      outOfChartRange = true;
    }
  }

  // Section 800
  const originationFee = loanAmount * (f.originationFeePercent / 100);
  const appraisalFee = hasLoan ? FEES.appraisal : 0;
  const creditReport = hasLoan ? FEES.creditReport : 0;
  const taxService = hasLoan ? FEES.taxService : 0;
  const administrationFee = hasLoan ? FEES.administration : 0;
  const floodCert = hasLoan ? FEES.floodCert : 0;
  const section800Total = originationFee + appraisalFee + creditReport + taxService + administrationFee + floodCert;

  // Section 1100
  const closingEscrowFee = hasLoan ? FEES.closingEscrow : 0;
  const docPrepFee = closingDateObj ? FEES.docPrep : 0;
  const notaryFee = closingDateObj ? FEES.notary : 0;
  const attorneyFee = f.attorneyFee;
  const titleInsurance = closingDateObj ? getTitleInsurancePremium(f.purchasePrice) : 0;
  const altaEndorsements = hasLoan ? FEES.altaEndorsements : 0;
  const cplLetter = hasLoan ? FEES.cplLetter : 0;
  const brokerFee = f.brokerFee;
  const section1100Total = closingEscrowFee + docPrepFee + notaryFee + attorneyFee + titleInsurance + altaEndorsements + cplLetter + brokerFee;

  // Section 1200
  const recordingFees = closingDateObj ? FEES.recordingFees : 0;
  const transferTax = f.purchasePrice * (f.transferTaxRate / 100);
  const pinCert = closingDateObj ? (hasLoan ? FEES.pinCertWithMortgage : FEES.pinCertCashOnly) : 0;
  const section1200Total = recordingFees + transferTax + pinCert;

  // Section 1300
  const inspStructural = f.inspStructural ? FEES.structural : 0;
  const inspRadon = f.inspRadon ? FEES.radon : 0;
  const inspPest = f.inspPest ? FEES.pest : 0;
  const inspSeptic = f.inspSeptic ? FEES.septic : 0;
  const inspWell = f.inspWell ? FEES.well : 0;
  const inspOther = f.inspOther || 0;
  const section1300Total = inspStructural + inspRadon + inspPest + inspSeptic + inspWell + inspOther;

  const estimatedClosingCosts = section800Total + section1100Total + section1200Total + section1300Total;

  // Section 900 — Per-diem interest
  let perDiemDays = 0;
  let perDiemRate = 0;
  let perDiemTotal = 0;

  if (closingDateObj && firstPaymentDate && hasLoan) {
    const interestStartDate = new Date(firstPaymentDate);
    interestStartDate.setDate(interestStartDate.getDate() - 30);
    perDiemDays = Math.round((interestStartDate.getTime() - closingDateObj.getTime()) / (1000 * 60 * 60 * 24));
    perDiemRate = (loanAmount * (f.interestRate / 100)) / FEES.interestDayBasis;
    perDiemTotal = perDiemDays * perDiemRate;
  }

  // Hazard insurance
  let hazardInsurance = 0;
  if (!f.landOnly && f.purchasePrice > 0) {
    hazardInsurance = f.purchasePrice < FEES.hazardInsMinPriceThreshold
      ? FEES.hazardInsMinimum
      : (f.purchasePrice / 1000) * FEES.hazardInsRatePerThousand;
  }

  // Flood insurance
  let floodInsurance = 0;
  if (f.floodCategory === 'mandatory') {
    floodInsurance = loanAmount * FEES.floodMandatoryRate;
  } else if (f.floodCategory === 'optional') {
    floodInsurance = FEES.floodOptionalFlat;
  }

  // Section 1000
  let hazardInsReserveMonths = 0;
  let hazardInsReserve = 0;
  let schoolTaxReserveMonths = 0;
  let schoolTaxReserve = 0;
  let cmTaxReserveMonths = 0;
  let cmTaxReserve = 0;
  let schoolTaxAdjustMonths = 0;
  let schoolTaxAdjust = 0;
  let cmTaxAdjustMonths = 0;
  let cmTaxAdjust = 0;

  if (f.escrowing && closingDateObj) {
    const monthlySchool = f.schoolTaxesAnnual / 12;
    const monthlyCm = f.countyMuniTaxesAnnual / 12;

    hazardInsReserveMonths = 2;
    hazardInsReserve = hazardInsReserveMonths * (hazardInsurance / 12);

    const escSchoolMonths = lookupByClosingMonth(ESCROW_SCHOOL_CHART, closingDateObj);
    if (escSchoolMonths !== null) {
      schoolTaxReserveMonths = escSchoolMonths;
      schoolTaxReserve = escSchoolMonths * monthlySchool;
    } else { outOfChartRange = true; }

    const escCmMonths = lookupByClosingMonth(ESCROW_CM_CHART, closingDateObj);
    if (escCmMonths !== null) {
      cmTaxReserveMonths = escCmMonths;
      cmTaxReserve = escCmMonths * monthlyCm;
    } else { outOfChartRange = true; }

    const adjSchoolMonths = lookupByClosingMonth(SCHOOL_ADJUST_CHART, closingDateObj);
    if (adjSchoolMonths !== null) {
      schoolTaxAdjustMonths = adjSchoolMonths;
      schoolTaxAdjust = adjSchoolMonths * monthlySchool;
    } else { outOfChartRange = true; }

    const adjCmMonths = lookupByClosingMonth(CM_ADJUST_CHART, closingDateObj);
    if (adjCmMonths !== null) {
      cmTaxAdjustMonths = adjCmMonths;
      cmTaxAdjust = adjCmMonths * monthlyCm;
    } else { outOfChartRange = true; }
  }

  const estimatedPrepaidItems = perDiemTotal + hazardInsurance + floodInsurance +
    hazardInsReserve + schoolTaxReserve + cmTaxReserve + schoolTaxAdjust + cmTaxAdjust;

  const totalSettlementCharges = estimatedClosingCosts + estimatedPrepaidItems;

  // UFMIP / Funding Fee
  let ufmipFundingFee = 0;
  if (f.mortgageType === 'fha') {
    ufmipFundingFee = loanAmount * FEES.fhaUfmipRate;
  } else if (f.mortgageType === 'va') {
    ufmipFundingFee = loanAmount * FEES.vaFundingFeeRate;
  }

  const finalLoanAmount = loanAmount + ufmipFundingFee;

  const downPaymentAndCosts = f.purchasePrice + ufmipFundingFee + estimatedClosingCosts + estimatedPrepaidItems + f.hoaFeeMonthly - finalLoanAmount;
  const totalFundsToClose = downPaymentAndCosts - f.sellersAssist - f.deposit;

  // Monthly payment
  const mortgagePayment = hasLoan ? pmt(f.interestRate / 100, f.loanTermMonths, finalLoanAmount) : 0;
  const hazardInsMonthly = hazardInsurance / 12;
  const floodInsMonthly = f.floodCategory === 'mandatory' ? floodInsurance / 12 : 0;
  const monthlySchool = f.schoolTaxesAnnual / 12;
  const monthlyCm = f.countyMuniTaxesAnnual / 12;
  const reTaxesMonthly = monthlySchool + monthlyCm;

  const ltv = f.purchasePrice > 0 ? (loanAmount / f.purchasePrice) * 100 : 0;
  let mortgageInsurance = 0;
  if (f.mortgageType === 'conventional') {
    if (ltv > 80) {
      mortgageInsurance = (loanAmount * PMI_ANNUAL_RATE_PERCENT / 100) / 12;
    }
  } else if (f.mortgageType === 'fha') {
    mortgageInsurance = (finalLoanAmount * FEES.fhaMipAnnualRate) / 12;
  }

  const totalMonthlyPayment = mortgagePayment + hazardInsMonthly + floodInsMonthly + reTaxesMonthly + mortgageInsurance + f.hoaFeeMonthly;

  return {
    hasLoan,
    closingDateObj,
    firstPaymentDate,
    outOfChartRange,
    originationFee,
    appraisalFee,
    creditReport,
    taxService,
    administrationFee,
    floodCert,
    section800Total,
    closingEscrowFee,
    docPrepFee,
    notaryFee,
    attorneyFee,
    titleInsurance,
    altaEndorsements,
    cplLetter,
    brokerFee,
    section1100Total,
    recordingFees,
    transferTax,
    pinCert,
    section1200Total,
    inspStructural,
    inspRadon,
    inspPest,
    inspSeptic,
    inspWell,
    inspOther,
    section1300Total,
    estimatedClosingCosts,
    perDiemDays,
    perDiemRate,
    perDiemTotal,
    hazardInsurance,
    floodInsurance,
    hazardInsReserveMonths,
    hazardInsReserve,
    schoolTaxReserveMonths,
    schoolTaxReserve,
    cmTaxReserveMonths,
    cmTaxReserve,
    schoolTaxAdjustMonths,
    schoolTaxAdjust,
    cmTaxAdjustMonths,
    cmTaxAdjust,
    estimatedPrepaidItems,
    totalSettlementCharges,
    ufmipFundingFee,
    finalLoanAmount,
    downPaymentAndCosts,
    totalFundsToClose,
    mortgagePayment,
    hazardInsMonthly,
    floodInsMonthly,
    reTaxesMonthly,
    mortgageInsurance,
    ltv,
    totalMonthlyPayment,
  };
}

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './calculator.html',
})
export class CalculatorComponent {
  form: FormInputs = defaultInputs();

  get r(): CalcResults {
    return calculate(this.form);
  }

  fmt(n: number): string {
    if (!isFinite(n)) return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  }

  fmtDate(d: Date | null): string {
    if (!d) return '—';
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
}
