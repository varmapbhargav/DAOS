import { TaskId, TenantId } from '@daos/shared-kernel';
import { Task } from '../entities/task.entity';

export interface TaskRepository {
  save(task: Task): Promise<void>;
  findById(tenantId: TenantId, id: TaskId): Promise<Task | null>;
  findByCaseId(tenantId: TenantId, caseId: string): Promise<Task[]>;
  findByAssetId(tenantId: TenantId, assetId: string): Promise<Task[]>;
  findByAssignee(tenantId: TenantId, assignee: string): Promise<Task[]>;
  findByStatus(tenantId: TenantId, status: string): Promise<Task[]>;
  findOverdue(tenantId: TenantId): Promise<Task[]>;
  findByType(tenantId: TenantId, type: string): Promise<Task[]>;
}