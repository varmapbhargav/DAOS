import {
  Address,
  ApiKeyId,
  ApiKeyScope,
  ApiKeyStatus,
  BillingCycle,
  BillingPlanType,
  CurrentUsage,
  EntitlementStatus,
  OrganizationProfileStatus,
  PaymentMethod,
  ServiceEntitlementId,
  TenantId,
  TenantProfileId,
  UsageLimits,
} from '@daos/shared-kernel';

import { ApiKey } from '../../../domain/aggregates/api-key.aggregate';
import { ServiceEntitlement } from '../../../domain/aggregates/service-entitlement.aggregate';
import { TenantProfile } from '../../../domain/aggregates/tenant-profile.aggregate';
import {
  ApiKeyOrmEntity,
  ServiceEntitlementOrmEntity,
  TenantProfileOrmEntity,
} from '../entities/organization.orm-entities';

export function tenantProfileToOrm(p: TenantProfile): Partial<TenantProfileOrmEntity> {
  return {
    id: p.id.value,
    tenantId: p.tenantId.value,
    orgName: p.orgName,
    legalName: p.legalName,
    taxId: p.taxId,
    website: p.website,
    contactEmail: p.contactEmail,
    contactPhone: p.contactPhone,
    country: p.country,
    addresses: p.addresses as unknown as object,
    brandColor: p.brandColor,
    logoUrl: p.logoUrl,
    customDomain: p.customDomain,
    featureFlags: p.featureFlags as unknown as object,
    status: p.status,
    version: p.version,
  };
}

export function tenantProfileFromOrm(e: TenantProfileOrmEntity): TenantProfile {
  return TenantProfile.reconstruct({
    id: TenantProfileId.create(e.id),
    tenantId: TenantId.create(e.tenantId),
    orgName: e.orgName,
    legalName: e.legalName,
    taxId: e.taxId,
    website: e.website,
    contactEmail: e.contactEmail,
    contactPhone: e.contactPhone,
    country: e.country,
    addresses: (e.addresses as unknown as Address[]) ?? [],
    brandColor: e.brandColor,
    logoUrl: e.logoUrl ?? null,
    customDomain: e.customDomain ?? null,
    featureFlags: (e.featureFlags as unknown as Record<string, boolean>) ?? {},
    status: e.status as OrganizationProfileStatus,
    version: e.version,
  });
}

export function serviceEntitlementToOrm(s: ServiceEntitlement): Partial<ServiceEntitlementOrmEntity> {
  return {
    id: s.id.value,
    tenantId: s.tenantId.value,
    planType: s.planType,
    billingCycle: s.billingCycle,
    status: s.status,
    pricePerSeat: s.pricePerSeat.toString(),
    paymentMethod: (s.paymentMethod as unknown as object) ?? null,
    usageLimits: s.usageLimits as unknown as object,
    currentUsage: s.currentUsage as unknown as object,
    nextInvoiceDate: s.nextInvoiceDate,
    version: s.version,
  };
}

export function serviceEntitlementFromOrm(e: ServiceEntitlementOrmEntity): ServiceEntitlement {
  return ServiceEntitlement.reconstruct({
    id: ServiceEntitlementId.create(e.id),
    tenantId: TenantId.create(e.tenantId),
    planType: e.planType as BillingPlanType,
    billingCycle: e.billingCycle as BillingCycle,
    status: e.status as EntitlementStatus,
    pricePerSeat: Number(e.pricePerSeat),
    paymentMethod: (e.paymentMethod as unknown as PaymentMethod) ?? null,
    usageLimits: (e.usageLimits as unknown as UsageLimits) ?? { seats: 0, apiCallsPerMonth: 0 },
    currentUsage: (e.currentUsage as unknown as CurrentUsage) ?? { apiCalls: 0, seatsUsed: 0 },
    nextInvoiceDate: e.nextInvoiceDate ?? null,
    version: e.version,
  });
}

export function apiKeyToOrm(k: ApiKey): Partial<ApiKeyOrmEntity> {
  return {
    id: k.id.value,
    tenantId: k.tenantId.value,
    label: k.label,
    keyHash: k.keyHash,
    scope: k.scope,
    status: k.status,
    prefix: k.prefix,
    createdAt: k.createdAt,
    expiresAt: k.expiresAt,
    lastUsedAt: k.lastUsedAt,
    version: k.version,
  };
}

export function apiKeyFromOrm(e: ApiKeyOrmEntity): ApiKey {
  return ApiKey.reconstruct({
    id: ApiKeyId.create(e.id),
    tenantId: TenantId.create(e.tenantId),
    label: e.label,
    keyHash: e.keyHash,
    scope: e.scope as ApiKeyScope,
    status: e.status as ApiKeyStatus,
    expiresAt: e.expiresAt ?? null,
    createdAt: e.createdAt,
    lastUsedAt: e.lastUsedAt ?? null,
    prefix: e.prefix,
    version: e.version,
  });
}
