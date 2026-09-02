import { TaskId, TaskPriority, TaskStatus, TaskType, TenantId } from '@daos/shared-kernel';

import { Task, TaskDependency } from '../../../domain/entities/task.entity';
import { TaskOrmEntity } from '../entities/task.orm-entity';

export class TaskMapper {
  static toOrm(task: Task): TaskOrmEntity {
    const orm = new TaskOrmEntity();
    orm.id = task.id.value;
    orm.tenantId = task.tenantId.value;
    orm.caseId = task.caseId;
    orm.assetId = task.assetId;
    orm.type = task.type;
    orm.title = task.title;
    orm.description = task.description;
    orm.priority = task.priority;
    orm.status = task.status;
    orm.owner = task.owner;
    orm.assignee = task.assignee;
    orm.dueDate = task.dueDate;
    orm.slaHours = task.slaHours;
    orm.dependencies = task.dependencies.map((d) => ({
      taskId: d.taskId,
      type: d.type,
    }));
    orm.evidence = task.evidence;
    orm.startedAt = task.startedAt;
    orm.completedAt = task.completedAt;
    orm.escalated = task.escalated;
    orm.escalatedTo = task.escalatedTo;
    orm.escalatedAt = task.escalatedAt;
    orm.escalationReason = task.escalationReason;
    orm.createdBy = task.createdBy;
    orm.createdAt = task.createdAt;
    orm.updatedAt = new Date().toISOString();
    return orm;
  }

  static toDomain(orm: TaskOrmEntity): Task {
    return Task.reconstruct({
      id: TaskId.create(orm.id),
      tenantId: TenantId.create(orm.tenantId),
      caseId: orm.caseId,
      assetId: orm.assetId,
      type: orm.type as TaskType,
      title: orm.title,
      description: orm.description,
      priority: orm.priority as TaskPriority,
      status: orm.status as TaskStatus,
      owner: orm.owner,
      assignee: orm.assignee,
      dueDate: orm.dueDate,
      slaHours: orm.slaHours,
      dependencies: (orm.dependencies ?? []).map((d) => new TaskDependency(d.taskId, d.type)),
      evidence: orm.evidence,
      startedAt: orm.startedAt,
      completedAt: orm.completedAt,
      escalated: orm.escalated,
      escalatedTo: orm.escalatedTo,
      escalatedAt: orm.escalatedAt,
      escalationReason: orm.escalationReason,
      createdBy: orm.createdBy,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }
}