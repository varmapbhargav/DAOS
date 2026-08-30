import { ApiKey } from '../domain/aggregates/api-key.aggregate';
import { ServiceEntitlement } from '../domain/aggregates/service-entitlement.aggregate';
import { TenantProfile } from '../domain/aggregates/tenant-profile.aggregate';
import { ApiKeyDto, BillingSummaryDto, TenantProfileDto } from './dto/organization.dto';

export function toTenantProfileDto(profile: TenantProfile): TenantProfileDto {
  return {
    profileId: profile.id.value,
    orgName: profile.orgName,
    legalName: profile.legalName,
    taxId: profile.taxId,
    website: profile.website,
    contactEmail: profile.contactEmail,
    contactPhone: profile.contactPhone,
    country: profile.country,
    addresses: profile.addresses,
    brandColor: profile.brandColor,
    logoUrl: profile.logoUrl,
    customDomain: profile.customDomain,
    featureFlags: profile.featureFlags,
    status: profile.status,
  };
}

export function toBillingSummaryDto(entitlement: ServiceEntitlement): BillingSummaryDto {
  return {
    entitlementId: entitlement.id.value,
    planType: entitlement.planType,
    billingCycle: entitlement.billingCycle,
    status: entitlement.status,
    pricePerSeat: entitlement.pricePerSeat.toString(),
    paymentMethod: entitlement.paymentMethod,
    seats: entitlement.usageLimits.seats,
    apiCallsPerMonth: entitlement.usageLimits.apiCallsPerMonth,
    seatsUsed: entitlement.currentUsage.seatsUsed,
    apiCalls: entitlement.currentUsage.apiCalls,
    nextInvoiceDate: entitlement.nextInvoiceDate,
  };
}

export function toApiKeyDto(apiKey: ApiKey): ApiKeyDto {
  return {
    keyId: apiKey.id.value,
    label: apiKey.label,
    prefix: apiKey.prefix,
    scope: apiKey.scope,
    status: apiKey.status,
    createdAt: apiKey.createdAt,
    expiresAt: apiKey.expiresAt,
    lastUsedAt: apiKey.lastUsedAt,
    rawKey: null,
  };
}
