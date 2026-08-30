import { OrderId, TenantId } from '@daos/shared-kernel';

import { Order } from '../aggregates/order.aggregate';

export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(tenantId: TenantId, id: OrderId): Promise<Order | null>;
  findByListingId(tenantId: TenantId, listingId: string): Promise<Order[]>;
  findByInvestorId(tenantId: TenantId, investorId: string): Promise<Order[]>;
  findOpenByListingId(tenantId: TenantId, listingId: string): Promise<Order[]>;
  findAll(tenantId: TenantId): Promise<Order[]>;
}
