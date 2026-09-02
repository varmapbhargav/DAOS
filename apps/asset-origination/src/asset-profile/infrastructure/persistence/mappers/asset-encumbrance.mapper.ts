import { EncumbranceId, EncumbranceStatus, EncumbranceType, TenantId } from '@daos/shared-kernel';

import { AssetEncumbrance } from '../../../domain/entities/asset-encumbrance.entity';
import { AssetEncumbranceOrmEntity } from '../entities/asset-encumbrance.orm-entity';

export class AssetEncumbranceMapper {
  static toDomain(e: AssetEncumbranceOrmEntity): AssetEncumbrance {
    return AssetEncumbrance.reconstruct({
      id: EncumbranceId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      assetId: e.assetId,
      type: e.type as EncumbranceType,
      holderEntityId: e.holderEntityId,
      amountMinorUnits: e.amountMinorUnits,
      currency: e.currency,
      priority: e.priority,
      registrationNumber: e.registrationNumber,
      effectiveFrom: e.effectiveFrom,
      effectiveTo: e.effectiveTo,
      status: e.status as EncumbranceStatus,
      releaseConditions: e.releaseConditions,
      evidenceReferences: e.evidenceReferences ?? [],
      verificationStatus: e.verificationStatus,
    });
  }

  static toOrm(domain: AssetEncumbrance): AssetEncumbranceOrmEntity {
    const e = new AssetEncumbranceOrmEntity();
    e.id = domain.id.value;
    e.tenantId = domain.tenantId.value;
    e.assetId = domain.assetId;
    e.type = domain.type;
    e.holderEntityId = domain.holderEntityId;
    e.amountMinorUnits = domain.amountMinorUnits;
    e.currency = domain.currency;
    e.priority = domain.priority;
    e.registrationNumber = domain.registrationNumber;
    e.effectiveFrom = domain.effectiveFrom;
    e.effectiveTo = domain.effectiveTo;
    e.status = domain.status;
    e.releaseConditions = domain.releaseConditions;
    e.evidenceReferences = domain.evidenceReferences;
    e.verificationStatus = domain.verificationStatus;
    return e;
  }
}
