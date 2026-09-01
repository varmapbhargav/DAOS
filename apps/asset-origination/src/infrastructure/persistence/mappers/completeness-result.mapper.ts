import { CompletenessBreakdown, CompletenessId, TenantId } from '@daos/shared-kernel';

import { CompletenessResult } from '../../../domain/entities/completeness-result.entity';
import { CompletenessResultOrmEntity } from '../entities/completeness-result.orm-entity';

export class CompletenessResultMapper {
  static toDomain(e: CompletenessResultOrmEntity): CompletenessResult {
    return CompletenessResult.reconstruct({
      id: CompletenessId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      caseId: e.caseId,
      breakdown: e.breakdown as unknown as CompletenessBreakdown,
      calculatedBy: e.calculatedBy,
      calculatedAt: e.calculatedAt,
    });
  }

  static toOrm(domain: CompletenessResult): CompletenessResultOrmEntity {
    const e = new CompletenessResultOrmEntity();
    e.id = domain.id.value;
    e.tenantId = domain.tenantId.value;
    e.caseId = domain.caseId;
    e.breakdown = domain.breakdown as unknown as Record<string, unknown>;
    e.calculatedBy = domain.calculatedBy;
    e.calculatedAt = domain.calculatedAt;
    return e;
  }
}