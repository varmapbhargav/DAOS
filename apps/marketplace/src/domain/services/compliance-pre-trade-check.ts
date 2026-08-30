import { Injectable } from '@nestjs/common';

import { Listing } from '../aggregates/listing.aggregate';

export type CompliancePreTradeCheckResult = {
  allowed: boolean;
  reasons: string[];
};

export type PreTradeCheckParams = {
  listing: Listing;
  quantity: bigint;
  price: { amount: string; currency: string };
  investorRisk?: {
    flagged?: boolean;
    kycApproved?: boolean;
    isAccredited?: boolean;
  };
};

/**
 * Validates that an order can be placed for a given listing from a
 * compliance perspective. Performs listing availability, quantity and
 * investor-eligibility checks.
 */
@Injectable()
export class CompliancePreTradeCheck {
  check(params: PreTradeCheckParams): CompliancePreTradeCheckResult {
    const reasons: string[] = [];

    if (params.listing.status !== 'active') reasons.push('Listing is not active');
    if (params.quantity <= 0n) reasons.push('Quantity must be positive');
    if (params.quantity > params.listing.totalQuantity) reasons.push('Quantity exceeds listing total quantity');
    if (BigInt(params.price.amount) <= 0n) reasons.push('Price must be positive');

    if (params.investorRisk) {
      if (params.investorRisk.flagged) reasons.push('Investor is flagged');
      if (params.investorRisk.kycApproved === false) reasons.push('Investor KYC is not approved');
      if (params.investorRisk.isAccredited === false) reasons.push('Investor is not accredited');
    }

    return { allowed: reasons.length === 0, reasons };
  }
}
