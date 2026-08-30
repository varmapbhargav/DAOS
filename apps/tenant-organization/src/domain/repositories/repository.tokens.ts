import { BillingProviderPort } from '@daos/shared-kernel';

export const TENANT_PROFILE_REPOSITORY = Symbol('TENANT_PROFILE_REPOSITORY');
export const SERVICE_ENTITLEMENT_REPOSITORY = Symbol('SERVICE_ENTITLEMENT_REPOSITORY');
export const API_KEY_REPOSITORY = Symbol('API_KEY_REPOSITORY');
export const OUTBOX_PUBLISHER = Symbol('OUTBOX_PUBLISHER');
export const BILLING_PROVIDER_PORT = Symbol('BILLING_PROVIDER_PORT');

export type { BillingProviderPort };
