import { RightsId, RightType, TenantId } from '@daos/shared-kernel';

import { AssetRights } from '../../../domain/entities/asset-rights.entity';
import { AssetRightsOrmEntity } from '../entities/asset-rights.orm-entity';

export class AssetRightsMapper {
  static toDomain(e: AssetRightsOrmEntity): AssetRights {
    return AssetRights.reconstruct({
      id: RightsId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      assetId: e.assetId,
      rightType: e.rightType as RightType,
      holderEntityId: e.holderEntityId,
      holderPersonId: e.holderPersonId,
      percentage: e.percentage,
      priority: e.priority,
      effectiveFrom: e.effectiveFrom,
      effectiveTo: e.effectiveTo,
      transferable: e.transferable,
      assignable: e.assignable,
      evidenceReferences: e.evidenceReferences ?? [],
    });
  }

  static toOrm(domain: AssetRights): AssetRightsOrmEntity {
    const e = new AssetRightsOrmEntity();
    e.id = domain.id.value;
    e.tenantId = domain.tenantId.value;
    e.assetId = domain.assetId;
    e.rightType = domain.rightType;
    e.holderEntityId = domain.holderEntityId;
    e.holderPersonId = domain.holderPersonId;
    e.percentage = domain.percentage;
    e.priority = domain.priority;
    e.effectiveFrom = domain.effectiveFrom;
    e.effectiveTo = domain.effectiveTo;
    e.transferable = domain.transferable;
    e.assignable = domain.assignable;
    e.evidenceReferences = domain.evidenceReferences;
    e.version = 0;
    return e;
  }
}
