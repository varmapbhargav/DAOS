import { SubscriptionId, TenantId } from '@daos/shared-kernel';

import { Subscription } from '../aggregates/subscription.aggregate';

export interface SubscriptionRepository {
  save(subscription: Subscription): Promise<void>;
  findById(tenantId: TenantId, id: SubscriptionId): Promise<Subscription | null>;
  findAll(tenantId: TenantId): Promise<Subscription[]>;
  findByProductId(tenantId: TenantId, productId: string): Promise<Subscription[]>;
  findByInvestorId(tenantId: TenantId, investorId: string): Promise<Subscription[]>;
}