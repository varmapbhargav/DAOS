import { BlockerId, BlockerResolutionStatus, BlockerSeverity, TenantId } from '@daos/shared-kernel';

import { Blocker } from '../../../domain/entities/blocker.entity';
import { BlockerOrmEntity } from '../entities/blocker.orm-entity';

export class BlockerMapper {
  static toDomain(e: BlockerOrmEntity): Blocker {
    return Blocker.reconstruct({
      id: BlockerId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      caseId: e.caseId,
      severity: e.severity as BlockerSeverity,
      category: e.category,
      description: e.description,
      owner: e.owner,
      dueDate: e.dueDate,
      resolutionAction: e.resolutionAction,
      evidenceReferences: e.evidenceReferences ?? [],
      resolutionStatus: e.resolutionStatus as BlockerResolutionStatus,
      resolvedBy: e.resolvedBy,
      resolvedAt: e.resolvedAt,
      resolvedReason: e.resolvedReason,
      raisedAt: e.raisedAt,
    });
  }

  static toOrm(domain: Blocker): BlockerOrmEntity {
    const e = new BlockerOrmEntity();
    e.id = domain.id.value;
    e.tenantId = domain.tenantId.value;
    e.caseId = domain.caseId;
    e.severity = domain.severity;
    e.category = domain.category;
    e.description = domain.description;
    e.owner = domain.owner;
    e.dueDate = domain.dueDate;
    e.resolutionAction = domain.resolutionAction;
    e.evidenceReferences = domain.evidenceReferences;
    e.resolutionStatus = domain.resolutionStatus;
    e.resolvedBy = domain.resolvedBy;
    e.resolvedAt = domain.resolvedAt;
    e.resolvedReason = domain.resolvedReason;
    e.raisedAt = domain.raisedAt;
    return e;
  }
}