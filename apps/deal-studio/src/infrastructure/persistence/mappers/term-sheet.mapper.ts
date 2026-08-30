import {
  EconomicRights,
  GovernanceTerms,
  TenantId,
  TermSheetId,
  TransferRestriction,
  VestingSchedule,
} from '@daos/shared-kernel';

import { TermSheet, TermSheetStatus, TermSheetVersionSnapshot } from '../../../domain/aggregates/term-sheet.aggregate';
import { TermSheetOrmEntity } from '../entities/term-sheet.orm-entity';

export class TermSheetMapper {
  static toDomain(e: TermSheetOrmEntity): TermSheet {
    return TermSheet.reconstruct({
      id: TermSheetId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      dealId: e.dealId,
      status: e.status as TermSheetStatus,
      currentVersionNumber: e.currentVersionNumber,
      versions: e.versions as unknown as TermSheetVersionSnapshot[],
      economicRights: e.economicRights as unknown as EconomicRights | null,
      governanceTerms: e.governanceTerms as unknown as GovernanceTerms | null,
      vestingSchedule: e.vestingSchedule as unknown as VestingSchedule | null,
      transferRestrictions: e.transferRestrictions as unknown as TransferRestriction[],
      closingConditionIds: e.closingConditionIds as unknown as string[],
      finalizedAt: e.finalizedAt,
      finalizedBy: e.finalizedBy,
      version: e.version,
    });
  }

  static toOrm(domain: TermSheet): TermSheetOrmEntity {
    const e = new TermSheetOrmEntity();
    e.id = domain.id.value;
    e.tenantId = domain.tenantId.value;
    e.dealId = domain.dealId;
    e.status = domain.status;
    e.currentVersionNumber = domain.currentVersionNumber;
    e.versions = domain.versions;
    e.economicRights = domain.economicRights;
    e.governanceTerms = domain.governanceTerms;
    e.vestingSchedule = domain.vestingSchedule;
    e.transferRestrictions = domain.transferRestrictions;
    e.closingConditionIds = domain.closingConditionIds;
    e.finalizedAt = domain.finalizedAt;
    e.finalizedBy = domain.finalizedBy;
    e.version = domain.version;
    return e;
  }
}
