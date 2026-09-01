import { DdFindingId, TenantId } from '@daos/shared-kernel';

import { DdFinding } from '../../../domain/entities/dd-finding.entity';
import { DdFindingOrmEntity } from '../entities/dd-finding.orm-entity';

export class DdFindingMapper {
  static toOrm(finding: DdFinding): DdFindingOrmEntity {
    const orm = new DdFindingOrmEntity();
    orm.id = finding.id.value;
    orm.tenantId = finding.tenantId.value;
    orm.ddCaseId = finding.ddCaseId;
    orm.caseId = finding.caseId;
    orm.category = finding.category;
    orm.severity = finding.severity;
    orm.description = finding.description;
    orm.evidence = finding.evidence;
    orm.impact = finding.impact;
    orm.recommendation = finding.recommendation;
    orm.remediation = finding.remediation;
    orm.owner = finding.owner;
    orm.dueDate = finding.dueDate;
    orm.status = finding.status;
    orm.reviewer = finding.reviewer;
    orm.createdAt = finding.createdAt;
    orm.updatedAt = new Date();
    return orm;
  }

  static toDomain(orm: DdFindingOrmEntity): DdFinding {
    return DdFinding.reconstruct({
      id: DdFindingId.create(orm.id),
      tenantId: TenantId.create(orm.tenantId),
      ddCaseId: orm.ddCaseId,
      caseId: orm.caseId,
      category: orm.category as DdFinding['category'],
      severity: orm.severity as DdFinding['severity'],
      description: orm.description,
      evidence: orm.evidence,
      impact: orm.impact,
      recommendation: orm.recommendation,
      remediation: orm.remediation,
      owner: orm.owner,
      dueDate: orm.dueDate,
      status: orm.status as DdFinding['status'],
      reviewer: orm.reviewer,
      createdAt: orm.createdAt,
    });
  }
}