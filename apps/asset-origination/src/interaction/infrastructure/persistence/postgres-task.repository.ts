import { TaskId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Task } from '../../domain/entities/task.entity';
import { TaskRepository } from '../../domain/repositories/task.repository';
import { TaskOrmEntity } from './entities/task.orm-entity';
import { TaskMapper } from './mappers/task.mapper';

@Injectable()
export class PostgresTaskRepository implements TaskRepository {
  constructor(private readonly dataSource: DataSource) {}

  async save(task: Task): Promise<void> {
    const orm = TaskMapper.toOrm(task);
    const row = orm as unknown as Record<string, unknown>;
    await this.dataSource.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${task.tenantId.value}'`);
      await manager
        .createQueryBuilder()
        .insert()
        .into(TaskOrmEntity)
        .values(row)
        .orUpdate(
          [
            'case_id',
            'asset_id',
            'type',
            'title',
            'description',
            'priority',
            'status',
            'owner',
            'assignee',
            'due_date',
            'sla_hours',
            'dependencies',
            'evidence',
            'started_at',
            'completed_at',
            'escalated',
            'escalated_to',
            'escalated_at',
            'escalation_reason',
            'updated_at',
          ],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: TaskId): Promise<Task | null> {
    const orm = await this.dataSource.manager.findOne(TaskOrmEntity, {
      where: { id: id.value, tenantId: tenantId.value },
    });
    return orm ? TaskMapper.toDomain(orm) : null;
  }

  async findByCaseId(tenantId: TenantId, caseId: string): Promise<Task[]> {
    const orms = await this.dataSource.manager.find(TaskOrmEntity, {
      where: { caseId, tenantId: tenantId.value },
      order: { createdAt: 'DESC' } as any,
    });
    return orms.map(TaskMapper.toDomain);
  }

  async findByAssetId(tenantId: TenantId, assetId: string): Promise<Task[]> {
    const orms = await this.dataSource.manager.find(TaskOrmEntity, {
      where: { assetId, tenantId: tenantId.value },
      order: { createdAt: 'DESC' } as any,
    });
    return orms.map(TaskMapper.toDomain);
  }

  async findByAssignee(tenantId: TenantId, assignee: string): Promise<Task[]> {
    const orms = await this.dataSource.manager.find(TaskOrmEntity, {
      where: { assignee, tenantId: tenantId.value },
      order: { dueDate: 'ASC' } as any,
    });
    return orms.map(TaskMapper.toDomain);
  }

  async findByStatus(tenantId: TenantId, status: string): Promise<Task[]> {
    const orms = await this.dataSource.manager.find(TaskOrmEntity, {
      where: { status, tenantId: tenantId.value },
      order: { createdAt: 'DESC' } as any,
    });
    return orms.map(TaskMapper.toDomain);
  }

  async findOverdue(tenantId: TenantId): Promise<Task[]> {
    const now = new Date().toISOString();
    const orms = await this.dataSource.manager.find(TaskOrmEntity, {
      where: {
        tenantId: tenantId.value,
        status: { $nin: ['COMPLETED', 'CANCELLED'] } as any,
        dueDate: { $lt: now } as any,
      },
      order: { dueDate: 'ASC' } as any,
    });
    return orms.map(TaskMapper.toDomain);
  }

  async findByType(tenantId: TenantId, type: string): Promise<Task[]> {
    const orms = await this.dataSource.manager.find(TaskOrmEntity, {
      where: { type, tenantId: tenantId.value },
      order: { createdAt: 'DESC' } as any,
    });
    return orms.map(TaskMapper.toDomain);
  }
}