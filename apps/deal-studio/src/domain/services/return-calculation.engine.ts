import { CashFlowPeriod, Money } from '@daos/shared-kernel';

export type ReturnMetrics = {
  irr: number | null;       // annualised IRR as decimal (0.12 = 12%)
  moic: number | null;      // total return multiple  (2.0 = 2x)
  npv: Money | null;        // net present value at discount rate
  cashOnCash: number | null; // total cash returned / initial equity
  equityMultiple: number | null;
  yieldPct: number | null;  // annualised yield percentage
};

/**
 * Pure domain service — no I/O, no framework dependencies.
 * All money amounts are treated as minor units (bigint) for precision.
 */
export class ReturnCalculationEngine {
  // ─── IRR via Newton-Raphson ─────────────────────────────────────────────────

  /**
   * Compute IRR from a series of periodic cash flows (same interval).
   * cashFlows[0] is the initial outflow (negative) followed by inflows.
   */
  irr(cashFlows: number[], maxIterations = 1000, tolerance = 1e-7): number | null {
    if (cashFlows.length < 2) return null;

    // Validate: need at least one sign change
    const hasNegative = cashFlows.some((c) => c < 0);
    const hasPositive = cashFlows.some((c) => c > 0);
    if (!hasNegative || !hasPositive) return null;

    let rate = 0.1; // initial guess

    for (let i = 0; i < maxIterations; i++) {
      let npv = 0;
      let dnpv = 0;
      for (let t = 0; t < cashFlows.length; t++) {
        const factor = Math.pow(1 + rate, t);
        npv += cashFlows[t] / factor;
        dnpv -= (t * cashFlows[t]) / (factor * (1 + rate));
      }
      if (Math.abs(dnpv) < 1e-12) break;
      const newRate = rate - npv / dnpv;
      if (Math.abs(newRate - rate) < tolerance) return newRate;
      rate = newRate;
    }
    return Math.abs(rate) > 10 ? null : rate; // sanity-cap extreme values
  }

  /**
   * XIRR — IRR for irregular date-spaced cash flows.
   * dates: ISO date strings matching cashFlows indices.
   */
  xirr(cashFlows: number[], dates: string[], maxIterations = 1000, tolerance = 1e-7): number | null {
    if (cashFlows.length !== dates.length || cashFlows.length < 2) return null;

    const t0 = new Date(dates[0]).getTime();
    const yearFractions = dates.map((d) => (new Date(d).getTime() - t0) / (365.25 * 86_400_000));

    let rate = 0.1;
    for (let i = 0; i < maxIterations; i++) {
      let npv = 0;
      let dnpv = 0;
      for (let t = 0; t < cashFlows.length; t++) {
        const factor = Math.pow(1 + rate, yearFractions[t]);
        npv += cashFlows[t] / factor;
        dnpv -= (yearFractions[t] * cashFlows[t]) / (factor * (1 + rate));
      }
      if (Math.abs(dnpv) < 1e-12) break;
      const newRate = rate - npv / dnpv;
      if (Math.abs(newRate - rate) < tolerance) return newRate;
      rate = newRate;
    }
    return Math.abs(rate) > 10 ? null : rate;
  }

  // ─── MOIC ───────────────────────────────────────────────────────────────────

  /**
   * Multiple of Invested Capital.
   * totalDistributed / totalInvested (both in same minor units).
   */
  moic(totalInvested: bigint, totalDistributed: bigint): number | null {
    if (totalInvested <= 0n) return null;
    return Number((totalDistributed * 10000n) / totalInvested) / 10000;
  }

  // ─── NPV ────────────────────────────────────────────────────────────────────

  /**
   * Net Present Value given a discount rate (decimal) and periodic cash flows.
   * Returns the NPV in the same currency/minor-units as the first non-zero flow.
   */
  npv(cashFlows: number[], discountRate: number, currency: string): Money {
    let result = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      result += cashFlows[t] / Math.pow(1 + discountRate, t);
    }
    return Money.of(BigInt(Math.round(result)), currency);
  }

  // ─── Cash-on-Cash ────────────────────────────────────────────────────────────

  cashOnCash(annualCashFlow: bigint, equityInvested: bigint): number | null {
    if (equityInvested <= 0n) return null;
    return Number((annualCashFlow * 10000n) / equityInvested) / 10000;
  }

  // ─── Equity Multiple ─────────────────────────────────────────────────────────

  equityMultiple(totalEquityDistributed: bigint, equityInvested: bigint): number | null {
    return this.moic(equityInvested, totalEquityDistributed);
  }

  // ─── Yield ───────────────────────────────────────────────────────────────────

  /**
   * Annualised yield = total income / invested capital / years.
   */
  yieldPct(totalIncome: bigint, invested: bigint, holdYears: number): number | null {
    if (invested <= 0n || holdYears <= 0) return null;
    return (Number((totalIncome * 1_000_000n) / invested) / 1_000_000) / holdYears;
  }

  // ─── Aggregate from cash-flow periods ────────────────────────────────────────

  computeMetrics(params: {
    periods: CashFlowPeriod[];
    initialEquity: Money;
    discountRate: number;
    dates?: string[];
  }): ReturnMetrics {
    const { periods, initialEquity, discountRate, dates } = params;

    if (periods.length === 0 || initialEquity.amount <= 0n) {
      return { irr: null, moic: null, npv: null, cashOnCash: null, equityMultiple: null, yieldPct: null };
    }

    const currency = initialEquity.currency;

    // Build numeric cash-flow array: period 0 = -(equity invested)
    const cfs: number[] = [Number(-initialEquity.amount)];
    let totalDistributed = 0n;
    let totalIncome = 0n;

    for (const p of periods) {
      const ndi = Number(p.netDistributableIncome.amount);
      cfs.push(ndi);
      totalDistributed += p.netDistributableIncome.amount;
      totalIncome += p.operatingIncome.amount;
    }

    const irrVal = dates && dates.length === cfs.length
      ? this.xirr(cfs, dates)
      : this.irr(cfs);

    const moicVal = this.moic(initialEquity.amount, totalDistributed);
    const npvVal = this.npv(cfs, discountRate, currency);
    const cocVal = periods.length > 0
      ? this.cashOnCash(periods[0].netDistributableIncome.amount, initialEquity.amount)
      : null;
    const emVal = this.equityMultiple(totalDistributed, initialEquity.amount);
    const holdYears = periods.length; // approximation: 1 period = 1 year
    const yieldVal = this.yieldPct(totalIncome, initialEquity.amount, holdYears);

    return {
      irr: irrVal,
      moic: moicVal,
      npv: npvVal,
      cashOnCash: cocVal,
      equityMultiple: emVal,
      yieldPct: yieldVal,
    };
  }
}
