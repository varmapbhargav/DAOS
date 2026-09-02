import { RiskItemId, TenantId } from '@daos/shared-kernel';

import { RiskItem } from '../../../domain/entities/risk-item.entity';
import { RiskItemOrmEntity } from '../entities/risk-item.orm-entity';

export class RiskItemMapper {
  static toOrm(item: RiskItem): RiskItemOrmEntity {
    const orm = new RiskItemOrmEntity();
    orm.id = item.id.value;
    orm.tenantId = item.tenantId.value;
    orm.assessmentId = item.assessmentId;
    orm.caseId = item.caseId;
    orm.category = item.category;
    orm.description = item.description;
    orm.probability = item.probability;
    orm.impact = item.impact;
    orm.score = item.score;
    orm.mitigation = item.mitigation;
    orm.owner = item.owner;
    orm.dueDate = item.dueDate;
    orm.evidence = item.evidence;
    orm.status = item.status;
    orm.createdAt = item.createdAt;
    orm.updatedAt = new Date();
    return orm;
  }

  static toDomain(orm: RiskItemOrmEntity): RiskItem {
    return RiskItem.reconstruct({
      id: RiskItemId.create(orm.id),
      tenantId: TenantId.create(orm.tenantId),
      assessmentId: orm.assessmentId,
      caseId: orm.caseId,
      category: orm.category as RiskItem['category'],
      description: orm.description,
      probability: orm.probability as RiskItem['probability'],
      impact: orm.impact as RiskItem['impact'],
      score: orm.score,
      mitigation: orm.mitigation,
      owner: orm.owner,
      dueDate: orm.dueDate,
      evidence: orm.evidence,
      status: orm.status as RiskItem['status'],
      createdAt: orm.createdAt,
    });
  }
}