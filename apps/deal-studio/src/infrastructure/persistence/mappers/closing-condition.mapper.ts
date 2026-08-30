import {
  ClosingConditionCategory,
  ClosingConditionId,
  ClosingConditionStatus,
  ConditionEvidence,
  TenantId,
} from '@daos/shared-kernel';

import { ClosingCondition } from '../../../domain/aggregates/closing-condition.aggregate';
import { ClosingConditionOrmEntity } from '../entities/closing-condition.orm-entity';

export class ClosingConditionMapper {
  static toDomain(e: ClosingConditionOrmEntity): ClosingCondition {
    return ClosingCondition.reconstruct({
      id: ClosingConditionId.create(e.id),
      dealId: e.dealId,
      tenantId: TenantId.create(e.tenantId),
      category: e.category as ClosingConditionCategory,
      conditionType: e.conditionType,
      description: e.description,
      responsibleParty: e.responsibleParty,
      dueDate: e.dueDate,
      status: e.status as ClosingConditionStatus,
      evidence: e.evidence as unknown as ConditionEvidence | null,
      verifiedBy: e.verifiedBy,
      verifiedAt: e.verifiedAt,
      version: e.version,
    });
  }

  static toOrm(domain: ClosingCondition): ClosingConditionOrmEntity {
    const e = new ClosingConditionOrmEntity();
    e.id = domain.id.value;
    e.dealId = domain.dealId;
    e.tenantId = domain.tenantId.value;
    e.category = domain.category;
    e.conditionType = domain.conditionType;
    e.description = domain.description;
    e.responsibleParty = domain.responsibleParty;
    e.dueDate = domain.dueDate;
    e.status = domain.status;
    e.evidence = domain.evidence;
    e.verifiedBy = domain.verifiedBy;
    e.verifiedAt = domain.verifiedAt;
    e.version = domain.version;
    return e;
  }
}
