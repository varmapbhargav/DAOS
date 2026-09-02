import { DueDiligenceCaseId, TenantId } from '@daos/shared-kernel';

import { DueDiligenceCase } from '../../../domain/entities/due-diligence-case.entity';
import { DueDiligenceCaseOrmEntity } from '../entities/due-diligence-case.orm-entity';

export class DueDiligenceCaseMapper {
  static toOrm(ddCase: DueDiligenceCase): DueDiligenceCaseOrmEntity {
    const orm = new DueDiligenceCaseOrmEntity();
    orm.id = ddCase.id.value;
    orm.tenantId = ddCase.tenantId.value;
    orm.caseId = ddCase.caseId;
    orm.status = ddCase.status;
    orm.checklist = ddCase.checklist;
    orm.reviewers = ddCase.reviewers;
    orm.dueDate = ddCase.dueDate;
    orm.startedAt = ddCase.startedAt;
    orm.completedAt = ddCase.completedAt;
    orm.summary = ddCase.summary;
    orm.updatedAt = new Date();
    return orm;
  }

  static toDomain(orm: DueDiligenceCaseOrmEntity): DueDiligenceCase {
    return DueDiligenceCase.reconstruct({
      id: DueDiligenceCaseId.create(orm.id),
      tenantId: TenantId.create(orm.tenantId),
      caseId: orm.caseId,
      status: orm.status as DueDiligenceCase['status'],
      checklist: orm.checklist,
      reviewers: orm.reviewers,
      dueDate: orm.dueDate,
      startedAt: orm.startedAt,
      completedAt: orm.completedAt,
      summary: orm.summary,
    });
  }
}