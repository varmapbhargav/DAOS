import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddressDto {
  @ApiProperty({ enum: ['registered', 'billing', 'delivery'] })
  type: 'registered' | 'billing' | 'delivery';

  @ApiProperty()
  line1: string;

  @ApiPropertyOptional()
  line2?: string | null;

  @ApiProperty()
  city: string;

  @ApiProperty()
  region: string;

  @ApiProperty()
  postalCode: string;

  @ApiProperty()
  country: string;
}

export class OnboardTenantDto {
  @ApiProperty()
  orgName: string;
}

export class UpdateTenantProfileDto {
  @ApiPropertyOptional()
  orgName?: string;

  @ApiPropertyOptional()
  legalName?: string;

  @ApiPropertyOptional()
  taxId?: string;

  @ApiPropertyOptional()
  website?: string;

  @ApiPropertyOptional()
  contactEmail?: string;

  @ApiPropertyOptional()
  contactPhone?: string;

  @ApiPropertyOptional()
  country?: string;

  @ApiPropertyOptional({ type: [AddressDto] })
  addresses?: AddressDto[];

  @ApiPropertyOptional()
  brandColor?: string;

  @ApiPropertyOptional()
  logoUrl?: string;

  @ApiPropertyOptional()
  customDomain?: string;

  @ApiPropertyOptional()
  featureFlags?: Record<string, boolean>;
}

export class ChangeBillingPlanDto {
  @ApiProperty({ enum: ['trial', 'starter', 'growth', 'enterprise'] })
  planType: 'trial' | 'starter' | 'growth' | 'enterprise';

  @ApiProperty({ enum: ['monthly', 'annual'] })
  billingCycle: 'monthly' | 'annual';

  @ApiProperty({ description: 'Price per seat in minor units', example: '1500' })
  pricePerSeat: string;

  @ApiProperty()
  seats: number;

  @ApiProperty()
  apiCallsPerMonth: number;

  @ApiPropertyOptional()
  nextInvoiceDate?: string;
}

export class AddPaymentMethodDto {
  @ApiProperty({ enum: ['card', 'bankTransfer', 'ach'] })
  type: 'card' | 'bankTransfer' | 'ach';

  @ApiProperty()
  token: string;
}

export class RecordUsageDto {
  @ApiProperty()
  apiCallsDelta: number;

  @ApiProperty()
  seatsUsed: number;
}

export class IssueApiKeyDto {
  @ApiProperty()
  label: string;

  @ApiProperty({ enum: ['readOnly', 'readWrite', 'admin'] })
  scope: 'readOnly' | 'readWrite' | 'admin';

  @ApiPropertyOptional({ description: 'Days until expiry. Omit for no expiry.' })
  ttlDays?: number;
}

export class RotateApiKeyDto {
  @ApiPropertyOptional({ description: 'Days until expiry. Omit for no expiry.' })
  ttlDays?: number;
}

export class TenantProfileDto {
  @ApiProperty()
  profileId: string;

  @ApiProperty()
  orgName: string;

  @ApiProperty()
  legalName: string;

  @ApiProperty()
  taxId: string;

  @ApiProperty()
  website: string;

  @ApiProperty()
  contactEmail: string;

  @ApiProperty()
  contactPhone: string;

  @ApiProperty()
  country: string;

  @ApiProperty({ type: [AddressDto] })
  addresses: AddressDto[];

  @ApiProperty()
  brandColor: string;

  @ApiProperty()
  logoUrl: string | null;

  @ApiProperty()
  customDomain: string | null;

  @ApiProperty()
  featureFlags: Record<string, boolean>;

  @ApiProperty({ enum: ['active', 'suspended'] })
  status: 'active' | 'suspended';
}

export class PaymentMethodDto {
  @ApiProperty({ enum: ['card', 'bankTransfer', 'ach'] })
  type: 'card' | 'bankTransfer' | 'ach';

  @ApiProperty()
  last4: string | null;

  @ApiProperty()
  expiry: string | null;

  @ApiProperty({ enum: ['valid', 'expired', 'declined'] })
  status: 'valid' | 'expired' | 'declined';
}

export class BillingSummaryDto {
  @ApiProperty()
  entitlementId: string;

  @ApiProperty({ enum: ['trial', 'starter', 'growth', 'enterprise'] })
  planType: 'trial' | 'starter' | 'growth' | 'enterprise';

  @ApiProperty({ enum: ['monthly', 'annual'] })
  billingCycle: 'monthly' | 'annual';

  @ApiProperty({ enum: ['trialing', 'active', 'pastDue', 'canceled'] })
  status: 'trialing' | 'active' | 'pastDue' | 'canceled';

  @ApiProperty({ description: 'Price per seat in minor units', example: '1500' })
  pricePerSeat: string;

  @ApiProperty()
  paymentMethod: PaymentMethodDto | null;

  @ApiProperty()
  seats: number;

  @ApiProperty()
  apiCallsPerMonth: number;

  @ApiProperty()
  seatsUsed: number;

  @ApiProperty()
  apiCalls: number;

  @ApiProperty()
  nextInvoiceDate: string | null;
}

export class ApiKeyDto {
  @ApiProperty()
  keyId: string;

  @ApiProperty()
  label: string;

  @ApiProperty()
  prefix: string;

  @ApiProperty({ enum: ['readOnly', 'readWrite', 'admin'] })
  scope: 'readOnly' | 'readWrite' | 'admin';

  @ApiProperty({ enum: ['active', 'revoked'] })
  status: 'active' | 'revoked';

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  expiresAt: string | null;

  @ApiProperty()
  lastUsedAt: string | null;

  @ApiProperty({ description: 'Raw key value. Returned only once on issue or rotate.' })
  rawKey: string | null;
}

export class IssueApiKeyResultDto {
  @ApiProperty()
  keyId: string;

  @ApiProperty({ description: 'Raw key value. Store this now; it will not be retrievable again.' })
  rawKey: string;

  @ApiProperty()
  expiresAt: string | null;
}
