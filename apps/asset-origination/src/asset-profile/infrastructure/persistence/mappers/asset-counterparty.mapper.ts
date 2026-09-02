import { CounterpartyId, CounterpartyRole, CounterpartyVerificationStatus, TenantId } from '@daos/shared-kernel';

import { AssetCounterparty, CounterpartyType } from '../../../domain/entities/asset-counterparty.entity';
import { AssetCounterpartyOrmEntity } from '../entities/asset-counterparty.orm-entity';

export class AssetCounterpartyMapper {
  static toDomain(e: AssetCounterpartyOrmEntity): AssetCounterparty {
    return AssetCounterparty.reconstruct({
      id: CounterpartyId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      assetId: e.assetId,
      entityId: e.entityId,
      personId: e.personId,
      counterpartyType: e.counterpartyType as CounterpartyType,
      role: e.role as CounterpartyRole,
      legalRole: e.legalRole,
      economicRole: e.economicRole,
      ownershipPercentage: e.ownershipPercentage,
      effectiveFrom: e.effectiveFrom,
      effectiveTo: e.effectiveTo,
      verificationStatus: e.verificationStatus as CounterpartyVerificationStatus,
      complianceStatus: e.complianceStatus,
      evidenceReferences: e.evidenceReferences ?? [],
    });
  }

  static toOrm(domain: AssetCounterparty): AssetCounterpartyOrmEntity {
    const e = new AssetCounterpartyOrmEntity();
    e.id = domain.id.value;
    e.tenantId = domain.tenantId.value;
    e.assetId = domain.assetId;
    e.entityId = domain.entityId;
    e.personId = domain.personId;
    e.counterpartyType = domain.counterpartyType;
    e.role = domain.role;
    e.legalRole = domain.legalRole;
    e.economicRole = domain.economicRole;
    e.ownershipPercentage = domain.ownershipPercentage;
    e.effectiveFrom = domain.effectiveFrom;
    e.effectiveTo = domain.effectiveTo;
    e.verificationStatus = domain.verificationStatus;
    e.complianceStatus = domain.complianceStatus;
    e.evidenceReferences = domain.evidenceReferences;
    return e;
  }
}
