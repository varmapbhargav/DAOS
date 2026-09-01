import { ApprovalId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { ApprovalCase } from '../../domain/entities/approval-case.entity';
import { ApprovalCaseRepository } from '../../domain/repositories/approval-case.repository';
import { ApprovalCaseOrmEntity } from './entities/approval-case.orm-entity';
import { ApprovalCaseMapper } from './mappers/approval-case.mapper';

@Injectable()
export class PostgresApprovalCaseRepository implements ApprovalCaseRepository {
  constructor(private readonly dataSource: DataSource) {}

  async save(approvalCase: ApprovalCase): Promise<void> {
    const orm = ApprovalCaseMapper.toOrm(approvalCase);
    const row = orm as unknown as Record<string, unknown>;
    await this.dataSource.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${approvalCase.tenantId.value}'`);
      await manager
        .createQueryBuilder()
        .insert()
        .into(ApprovalCaseOrmEntity)
        .values(row)
        .orUpdate(
          [
            'status',
            'approval_type',
            'levels',
            'current_level',
            'threshold_amount',
            'required_approvers',
            'decisions',
            'conditions',
            'conflict_of_interest_checked',
            'started_at',
            'completed_at',
            'final_decided_by',
            'final_reason',
            'updated_at',
          ],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: ApprovalId): Promise<ApprovalCase | null> {
    const orm = await this.dataSource.manager.findOne(ApprovalCaseOrmEntity, {
      where: { id: id.value, tenantId: tenantId.value },
    });
    return orm ? ApprovalCaseMapper.toDomain(orm) : null;
  }

  async findByCaseId(tenantId: TenantId, caseId: string): Promise<ApprovalCase | null> {
    const orm = await this.dataSource.manager.findOne(ApprovalCaseOrmEntity, {
      where: { caseId, tenantId: tenantId.value },
    });
    return orm ? ApprovalCaseMapper.toDomain(orm) : null;
  }
}