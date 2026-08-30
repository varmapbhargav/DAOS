export type OrganizationProfileStatus = 'active' | 'suspended';

export type Address = {
  type: 'registered' | 'billing' | 'delivery';
  line1: string;
  line2?: string | null;
  city: string;
  region: string;
  postalCode: string;
  country: string;
};

export type BillingCycle = 'monthly' | 'annual';

export type SponsorRelationshipStatus = 'pending' | 'active' | 'completed' | 'terminated';

export type SponsorRiskRating = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'D' | 'NR';

export type SponsorVerificationStatus = 'pending' | 'verified' | 'failed' | 'expired';

export interface SponsorReference {
  entityId: string;
  name: string;
  jurisdiction: string;
  relationshipStatus: SponsorRelationshipStatus;
  riskRating: SponsorRiskRating;
  verificationStatus: SponsorVerificationStatus;
}

export type BillingPlanType = 'trial' | 'starter' | 'growth' | 'enterprise';

export type EntitlementStatus = 'trialing' | 'active' | 'pastDue' | 'canceled';

export type PaymentMethodType = 'card' | 'bankTransfer' | 'ach';

export type PaymentMethod = {
  type: PaymentMethodType;
  last4: string | null;
  expiry: string | null;
  status: 'valid' | 'expired' | 'declined';
};

export type UsageLimits = {
  seats: number;
  apiCallsPerMonth: number;
};

export type CurrentUsage = {
  apiCalls: number;
  seatsUsed: number;
};

export type ApiKeyStatus = 'active' | 'revoked';

export type ApiKeyScope = 'readOnly' | 'readWrite' | 'admin';
