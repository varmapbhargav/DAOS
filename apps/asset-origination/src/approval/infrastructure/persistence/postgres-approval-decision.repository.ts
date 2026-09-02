import { ApprovalDecisionId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { ApprovalDecision } from '../../domain/entities/approval-decision.entity';
import { ApprovalDecisionRepository } from '../../domain/repositories/approval-decision.repository';
import { ApprovalDecisionOrmEntity } from './entities/approval-decision.orm-entity';
import { ApprovalDecisionMapper } from './mappers/approval-decision.mapper';

@Injectable()
export class PostgresApprovalDecisionRepository implements ApprovalDecisionRepository {
  constructor(private readonly dataSource: DataSource) {}

  async save(decision: ApprovalDecision): Promise<void> {
    const orm = ApprovalDecisionMapper.toOrm(decision);
    const row = orm as unknown as Record<string, unknown>;
    await this.dataSource.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${decision.tenantId.value}'`);
      await manager
        .createQueryBuilder()
        .insert()
        .into(ApprovalDecisionOrmEntity)
        .values(row)
        .orUpdate(
          ['approver', 'level', 'decision', 'reason', 'conditions', 'updated_at'],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: ApprovalDecisionId): Promise<ApprovalDecision | null> {
    const orm = await this.dataSource.manager.findOne(ApprovalDecisionOrmEntity, {
      where: { id: id.value, tenantId: tenantId.value },
    });
    return orm ? ApprovalDecisionMapper.toDomain(orm) : null;
  }

  async findByCaseId(tenantId: TenantId, caseId: string): Promise<ApprovalDecision[]> {
    const orms = await this.dataSource.manager.find(ApprovalDecisionOrmEntity, {
      where: { caseId, tenantId: tenantId.value },
      order: { decidedAt: 'ASC' } as any,
    });
    return orms.map(ApprovalDecisionMapper.toDomain);
  }

  async findByApprovalCaseId(tenantId: TenantId, approvalCaseId: string): Promise<ApprovalDecision[]> {
    const orms = await this.dataSource.manager.find(ApprovalDecisionOrmEntity, {
      where: { approvalCaseId, tenantId: tenantId.value },
      order: { decidedAt: 'ASC' } as any,
    });
    return orms.map(ApprovalDecisionMapper.toDomain);
  }
}