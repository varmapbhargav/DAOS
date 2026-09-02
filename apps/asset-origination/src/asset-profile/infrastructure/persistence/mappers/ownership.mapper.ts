import { OwnershipId, OwnershipType, OwnershipVerificationStatus, TenantId } from '@daos/shared-kernel';

import { Ownership } from '../../../domain/entities/ownership.entity';
import { OwnershipOrmEntity } from '../entities/ownership.orm-entity';

export class OwnershipMapper {
  static toDomain(e: OwnershipOrmEntity): Ownership {
    return Ownership.reconstruct({
      id: OwnershipId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      assetId: e.assetId,
      entityId: e.entityId,
      personId: e.personId,
      ownershipType: e.ownershipType as OwnershipType,
      ownershipPercentage: e.ownershipPercentage,
      economicInterestPercentage: e.economicInterestPercentage,
      controlPercentage: e.controlPercentage,
      acquisitionDate: e.acquisitionDate,
      effectiveFrom: e.effectiveFrom,
      effectiveTo: e.effectiveTo,
      evidenceReferences: e.evidenceReferences ?? [],
      verificationStatus: e.verificationStatus as OwnershipVerificationStatus,
      verifiedBy: e.verifiedBy,
      verifiedAt: e.verifiedAt,
      notes: e.notes,
    });
  }

  static toOrm(domain: Ownership): OwnershipOrmEntity {
    const e = new OwnershipOrmEntity();
    e.id = domain.id.value;
    e.tenantId = domain.tenantId.value;
    e.assetId = domain.assetId;
    e.entityId = domain.entityId;
    e.personId = domain.personId;
    e.ownershipType = domain.ownershipType;
    e.ownershipPercentage = domain.ownershipPercentage;
    e.economicInterestPercentage = domain.economicInterestPercentage;
    e.controlPercentage = domain.controlPercentage;
    e.acquisitionDate = domain.acquisitionDate;
    e.effectiveFrom = domain.effectiveFrom;
    e.effectiveTo = domain.effectiveTo;
    e.evidenceReferences = domain.evidenceReferences;
    e.verificationStatus = domain.verificationStatus;
    e.verifiedBy = domain.verifiedBy;
    e.verifiedAt = domain.verifiedAt;
    e.notes = domain.notes;
    e.version = 0;
    return e;
  }
}
