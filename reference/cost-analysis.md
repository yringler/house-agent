# Buyer's Closing Cost Estimator — Complete Formula Map

This is a **Pennsylvania real estate closing cost estimator** (Good Faith Estimate of Settlement Charges). Sheet1 is the protected user-facing form; Sheet2 contains all the lookup tables.

---

## Protection Status

- **Sheet1**: Protected (SHA-512 hashed password). All formulas and data are fully readable despite protection.
- **Sheet2**: Unprotected. Contains lookup/reference tables.
- **Workbook structure**: Locked (prevents adding/deleting sheets).

---

## Input Cells (Gray Fields — User Fills These In)

| Cell | Purpose |
|------|---------|
| `C14` | **Closing Date** — named `closingdate`, drives nearly every calculation |
| `D12` | **Purchase Price** |
| `D13` | **Total Loan Amount** |
| `G12` | **Deposit** held in escrow |
| `G13` | **Seller's Assist** amount |
| `G14` | **Interest Rate** (decimal, e.g. 0.065 for 6.5%) |
| `I10` | **School Taxes** (annual) |
| `I11` | **County/Muni Taxes** (annual) |
| `I14` | **Escrowing** — "yes" or "no" |
| `E15` | **Conventional** mortgage — mark "x" |
| `G15` | **FHA** mortgage — mark "x" |
| `I15` | **VA** mortgage — mark "x" |
| `F17` | **Origination/Discount Fee** percentage |
| `I28` | **Attorney Fee** (manual entry) |
| `I32` | **Broker Fee** (manual entry) |
| `G35` | **Transfer Tax** rate (default 1%) |
| `G38-G42` | **Inspections** — "y" or "n" for each |
| `E48` | **Flood Insurance** — "Yes" or "No" |
| `G48` | **Flood Insurance Category** — "optional" or "mandatory" |
| `D67` | **HOA Fee** (manual) |
| `I67` / `I68` | **Monthly HOA / Other** (manual) |

---

## Named Ranges (The Key to Understanding the VLOOKUPs)

| Name | Points To | Purpose |
|------|-----------|---------|
| `closingdate` | `Sheet1!$C$14` | The closing date — central input |
| `titlechart` | `Sheet2!$A:$B` | Title insurance lookup (price → premium) |
| `FirstPaymentchart` | `Sheet2!$S$2:$T$14` | Closing date → first mortgage payment date |
| `CMAdjustchart` | `Sheet2!$G$2:$H$14` | County/Muni tax adjustment months by closing date |
| `SchoolAdjustchart` | `Sheet2!$J$2:$K$14` | School tax adjustment months by closing date |
| `EscrowCMchart` | `Sheet2!$M$2:$N$14` | County/Muni escrow months by closing date |
| `EscrowSchoolchart` | `Sheet2!$P$2:$Q$14` | School escrow months by closing date |
| `endofyearcm` | `Sheet2!$G$22` | End of C/M tax year (12/31/2024) |
| `endofyearschool` | `Sheet2!$J$22` | End of school tax year (6/30/2025) |
| `billduecm` | `Sheet2!$G$25` | C/M tax bill due date (2/28/2024) |
| `billdueschool` | `Sheet2!$J$25` | School tax bill due date (8/31/2025) |
| `pmichart` | `Sheet2!$D$1:$E$20` | PMI/LTV rate lookup |

---

## Section 800: Items Payable in Connection with Loan

| Row | Item | Formula | Logic |
|-----|------|---------|-------|
| 17 | Origination/Discount Fee | `=D13*(F17/100)` | Loan amount × fee percentage |
| 18 | Appraisal Fee | `=IF(D13=0, 0, 460)` | $460 flat if loan exists |
| 19 | Credit Report | `=IF(D13=0, 0, 35)` | $35 flat if loan exists |
| 20 | Tax Related Service Fee | `=IF(D13=0, 0, 100)` | $100 flat if loan exists |
| 22 | Administration Fee | `=IF(D13=0, 0, 639)` | $639 flat if loan exists |
| 23 | Flood Certification | `=IF(D13=0, 0, 19)` | $19 flat if loan exists |

---

## Section 1100: Title Charges

| Row | Item | Formula | Logic |
|-----|------|---------|-------|
| 25 | Closing/Escrow Fee | `=IF(D13=0, 0, 25)` | $25 flat |
| 26 | Document Prep Fee | `=IF(closingdate="", "", 100)` | $100 flat |
| 27 | Notary Fee | `=IF(closingdate="", "", 20)` | $20 flat |
| 29 | **Title Insurance** | `=IF(closingdate="", "", L29)` | See below |
| 30 | ALTA Endorsements | `=IF(D13=0, 0, 200)` | $200 flat |
| 31 | CPL Letter | `=IF(D13=0, 0, 125)` | $125 flat |

**Title Insurance calculation (L29)**:
```
=IF(D12 < 500001,
    VLOOKUP(D12, titlechart, 2),
    ((D12 - 500000) / 1000) * 4 + 2904)
```
For prices ≤$500K: looks up in the title chart (Sheet2 columns A:B — purchase price in $1K increments → premium).
For prices >$500K: $2,904 base + $4 per $1K over $500K.

**Title Chart tiers** (Sheet2 A:B):
- $1K–$30K: flat $569, then +$7.41 per $1K
- $31K–$100K: continues +$7.41/1K then +$6.27/1K from $46K
- $100K–$500K: +$5.70/1K
- $500K–$1M: +$4.56/1K
- $1M–$2M: +$3.42/1K

---

## Section 1200: Government Recording & Transfer

| Row | Item | Formula | Logic |
|-----|------|---------|-------|
| 34 | Recording Fees | `=IF(closingdate="", "", 140)` | $140 flat |
| 35 | **Transfer Tax** | `=D12 * G35` | Purchase price × transfer tax rate (default 1%) |
| 36 | PIN Certification | `=IF(closingdate="", "", IF(D13=0, 15, 30))` | $15 cash, $30 with mortgage |

---

## Section 1300: Inspections

| Row | Item | Formula | Fixed Cost |
|-----|------|---------|------------|
| 38 | Structural | `=IF(G38="n", 0, 300)` | $300 |
| 39 | Radon | `=IF(G39="n", 0, 150)` | $150 |
| 40 | Pest | `=IF(G40="n", 0, 100)` | $100 |
| 41 | Septic | `=IF(G41="n", 0, 400)` | $400 |
| 42 | Well | `=IF(G42="n", 0, 100)` | $100 |

---

## Estimated Closing Costs Total

**I44** = `=IF(D12="", "", SUM(I17:I43))`

---

## Section 900: Prepaid Items

### First Payment Date
**L13** = `=VLOOKUP(closingdate, FirstPaymentchart, 2)` — looks up closing month → first payment date (always ~2 months later, 1st of month).

### Per-Diem Interest (Row 46)
- Days of interest: `C46 = (J12 - 30) - closingdate` (days from closing to 30 days before first payment)
- Per-diem rate: `E46 = (D13 * G14) / 360` (daily interest on loan)
- Total: `I46 = E46 * C46`

### Hazard Insurance (Row 47)
```
=IF(G47="yes", "",                     // Skip if land only
  IF(D12="", "",
    IF(D12 < 100000, 550,              // Min $550
      (D12/1000) * 6)))                 // $6 per $1K of purchase price
```

### Flood Insurance (Row 48)
```
=IF(E48="no", 0,
  IF(G48="mandatory", D13 * 0.0175,    // 1.75% of loan amount
    IF(G48="optional", 450)))           // Flat $450
```

---

## Section 1000: Escrow Reserves & Tax Adjustments

The number of months escrowed/adjusted is determined by VLOOKUP on the closing date against the lookup tables in Sheet2.

### Escrow Months Logic (if escrowing = "yes")

| Item | Months Formula | Monthly Rate | Total |
|------|---------------|-------------|-------|
| Hazard Ins Reserve (50) | 2 months if escrowing | I47/12 | months × rate |
| School Tax Reserve (51) | `VLOOKUP(closingdate, EscrowSchoolchart, 2)` | I10/12 | months × rate |
| County/Muni Reserve (52) | `VLOOKUP(closingdate, EscrowCMchart, 2)` | I11/12 | months × rate |
| School Tax Adjustment (53) | `VLOOKUP(closingdate, SchoolAdjustchart, 2)` | I10/12 | months × rate |
| County/Muni Adjustment (54) | `VLOOKUP(closingdate, CMAdjustchart, 2)` | I11/12 | months × rate |

### Lookup Tables (Sheet2, rows 2–14, monthly by closing date Dec 2024–Dec 2025)

**County/Muni Adjustments** (G:H) — months of seller's share based on calendar year (Jan 1–Dec 31):
| Closing Month | Adjustment Months |
|--------------|-------------------|
| Dec 2024 | 0 |
| Jan 2025 | -1 |
| Feb 2025 | -2 |
| Mar 2025 | 9 |
| Apr 2025 | 8 |
| May 2025 | 7 |
| Jun 2025 | 6 |
| Jul 2025 | 5 |
| Aug 2025 | 4 |
| Sep 2025 | 3 |
| Oct 2025 | 2 |
| Nov 2025 | 1 |
| Dec 2025 | 0 |

**School Tax Adjustments** (J:K) — months based on fiscal year (Jul 1–Jun 30):
| Closing Month | Adjustment Months |
|--------------|-------------------|
| Dec 2024 | 6 |
| Jan 2025 | 5 |
| Feb 2025 | 4 |
| Mar 2025 | 3 |
| Apr 2025 | 2 |
| May 2025 | 1 |
| Jun 2025 | 0 |
| Jul 2025 | -1 |
| Aug 2025 | 10 |
| Sep 2025 | 9 |
| Oct 2025 | 8 |
| Nov 2025 | 7 |
| Dec 2025 | 6 |

**Escrow C/M** (M:N) — months to collect into escrow:
| Closing Month | Escrow Months |
|--------------|---------------|
| Dec 2024 | 11 |
| Jan 2025 | 12 |
| Feb 2025 | 13 |
| Mar 2025 | 2 |
| Apr 2025 | 3 |
| May 2025 | 4 |
| Jun 2025 | 5 |
| Jul 2025 | 6 |
| Aug 2025 | 7 |
| Sep 2025 | 8 |
| Oct 2025 | 9 |
| Nov 2025 | 10 |
| Dec 2025 | 11 |

**Escrow School** (P:Q) — months to collect:
| Closing Month | Escrow Months |
|--------------|---------------|
| Dec 2024 | 6 |
| Jan 2025 | 7 |
| Feb 2025 | 8 |
| Mar 2025 | 9 |
| Apr 2025 | 10 |
| May 2025 | 11 |
| Jun 2025 | 12 |
| Jul 2025 | 13 |
| Aug 2025 | 2 |
| Sep 2025 | 3 |
| Oct 2025 | 4 |
| Nov 2025 | 5 |
| Dec 2025 | 6 |

---

## Estimated Prepaid Items Total

**I57** = `=SUM(I46:J56)`

## Total Estimated Settlement Charges

**I59** = `=SUM(I44, I57)` (closing costs + prepaids)

---

## Funds to Close Summary (Left Side, Rows 60–71)

| Row | Item | Formula |
|-----|------|---------|
| 61 | Purchase Price | `=D12` |
| 62 | Loan Amount | `=D13` |
| 63 | UFMIP/Funding Fee | `IF(G15="x", D13*0.0175, IF(I15="x", D13*0.0215, 0))` — FHA=1.75%, VA=2.15% |
| 64 | Final Loan Amount | `=SUM(D62:D63)` — loan + UFMIP/funding fee |
| 65 | Est Closing Costs | `=I44` |
| 66 | Est Prepaid Items | `=I57` |
| 68 | Down Payment & Costs | `=D61 + D63 + D65 + D66 + D67 - D64` |
| 69 | Seller's Assist | `=G13` |
| 70 | Deposit | `=G12` |
| 71 | **Total Est Funds to Close** | `=D68 - D69 - D70` |

---

## Monthly Payment Summary (Right Side, Rows 62–70)

| Row | Item | Formula |
|-----|------|---------|
| 62 | Mortgage Payment | `=-PMT(G14/12, I13, D64)` — standard amortization, 360 months default |
| 63 | Hazard Insurance | `=I47/12` — annual premium ÷ 12 |
| 64 | Flood Insurance | `=IF(G48="optional",0, IF(G48="", 0, I48/12))` |
| 65 | R/E Taxes | `=J10 + J11` — monthly school + county taxes |
| 66 | **Mortgage Insurance** | See below |
| 70 | **Total Monthly** | `=SUM(I62:I68)` |

### Mortgage Insurance (I66)
```
=IF(E15="x",                           // Conventional:
    IF(LTV > 80,                        // Only if LTV > 80%
        (D13 * pmi_rate) / 100 / 12,    // Monthly PMI from pmichart
        ""),
  IF(G15="x",                           // FHA:
    (D64 * 0.0085) / 12,               // 0.85% annual MIP
    0))                                  // VA: no MI
```

**LTV** (`L73`) = `=(D13/D12)*100`

**PMI Rate** looked up from `pmichart` (Sheet2 D:E) — maps LTV ranges to annual PMI rate (0.94% for LTV 80–97%).

---

## Sheet2: Tax Proration Engine (Rows 40–88)

Sheet2 also contains a sophisticated tax proration calculator that computes exact seller/buyer tax shares based on closing date, using chained `IF(closingdate<=date, value, next)` formulas spanning years 1999–2032. This handles both:

- **School taxes** (fiscal year Jul 1–Jun 30)
- **County/Municipal taxes** (calendar year Jan 1–Dec 31)

The proration computes days of seller's share, multiplies by per-diem rate, and compares against taxes already paid to determine amount due to/from seller.

---

## Key Hardcoded Fee Schedule

| Fee | Amount |
|-----|--------|
| Appraisal | $460 |
| Credit Report | $35 |
| Tax Service | $100 |
| Administration | $639 |
| Flood Cert | $19 |
| Closing/Escrow | $25 |
| Doc Prep | $100 |
| Notary | $20 |
| ALTA Endorsements | $200 |
| CPL Letter | $125 |
| Recording Fees | $140 |
| PIN Cert (with mtg) | $30 |
| PIN Cert (cash) | $15 |
| FHA UFMIP | 1.75% of loan |
| VA Funding Fee | 2.15% of loan |
| FHA MIP | 0.85% annual |
| Hazard Ins (≥$100K) | $6 per $1K of price |
| Hazard Ins (<$100K) | $550 flat |
| Transfer Tax default | 1% of purchase price |