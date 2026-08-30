import { InvestmentProductId, TenantId } from '@daos/shared-kernel';

import { InvestmentProduct } from '../aggregates/investment-product.aggregate';

export interface InvestmentProductRepository {
  save(product: InvestmentProduct): Promise<void>;
  findById(tenantId: TenantId, id: InvestmentProductId): Promise<InvestmentProduct | null>;
  findAll(tenantId: TenantId): Promise<InvestmentProduct[]>;
}
