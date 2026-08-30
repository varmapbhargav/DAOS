import { Money, ShareClassId, TenantId } from '@daos/shared-kernel';

import { ShareClass, ShareClassStatus } from '../../../domain/entities/share-class.aggregate';
import { ShareClassOrmEntity } from '../entities/share-class.orm-entity';

export class ShareClassMapper {
  static toDomain(e: ShareClassOrmEntity): ShareClass {
    return ShareClass.reconstruct({
      id: ShareClassId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      productId: e.productId,
      name: e.name,
      currency: e.currency,
      targetSize: Money.of(BigInt(e.targetSizeAmount), e.targetSizeCurrency),
      minInvestment: Money.of(BigInt(e.minInvestmentAmount), e.minInvestmentCurrency),
      maxInvestors: e.maxInvestors,
      pricePerShare:
        e.pricePerShareAmount !== null && e.pricePerShareCurrency
          ? Money.of(BigInt(e.pricePerShareAmount), e.pricePerShareCurrency)
          : null,
      status: e.status as ShareClassStatus,
      version: e.version,
    });
  }

  static toOrm(domain: ShareClass): ShareClassOrmEntity {
    const e = new ShareClassOrmEntity();
    e.id = domain.id.value;
    e.tenantId = domain.tenantId.value;
    e.productId = domain.productId;
    e.name = domain.name;
    e.currency = domain.currency;
    e.targetSizeAmount = domain.targetSize.amount.toString();
    e.targetSizeCurrency = domain.targetSize.currency;
    e.minInvestmentAmount = domain.minInvestment.amount.toString();
    e.minInvestmentCurrency = domain.minInvestment.currency;
    e.maxInvestors = domain.maxInvestors;
    e.pricePerShareAmount = domain.pricePerShare ? domain.pricePerShare.amount.toString() : null;
    e.pricePerShareCurrency = domain.pricePerShare ? domain.pricePerShare.currency : null;
    e.status = domain.status;
    e.version = domain.version;
    return e;
  }
}
