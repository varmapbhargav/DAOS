import { InteractionId, TaskId,TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { InteractionRepository } from '../../domain/repositories/interaction.repository';
import {
  INTERACTION_REPOSITORY,
  TASK_REPOSITORY,
} from '../../domain/repositories/repository.tokens';
import { TaskRepository } from '../../domain/repositories/task.repository';

export class ListInteractionsQuery {
  constructor(
    public readonly caseId?: string,
    public readonly assetId?: string,
    public readonly counterpartyId?: string,
    public readonly from?: string,
    public readonly to?: string,
  ) {}
}

export class GetInteractionQuery {
  constructor(public readonly interactionId: string) {}
}

export class ListTasksQuery {
  constructor(
    public readonly caseId?: string,
    public readonly assetId?: string,
    public readonly assignee?: string,
    public readonly status?: string,
    public readonly type?: string,
    public readonly overdue?: boolean,
  ) {}
}

export class GetTaskQuery {
  constructor(public readonly taskId: string) {}
}

@QueryHandler(ListInteractionsQuery)
export class ListInteractionsHandler implements IQueryHandler<ListInteractionsQuery> {
  constructor(@Inject(INTERACTION_REPOSITORY) private readonly interactions: InteractionRepository) {}

  async execute(query: ListInteractionsQuery) {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    if (query.caseId) return this.interactions.findByCaseId(tenantId, query.caseId);
    if (query.assetId) return this.interactions.findByAssetId(tenantId, query.assetId);
    if (query.counterpartyId) return this.interactions.findByCounterpartyId(tenantId, query.counterpartyId);
    if (query.from && query.to) return this.interactions.findByDateRange(tenantId, query.from, query.to);
    return [];
  }
}

@QueryHandler(GetInteractionQuery)
export class GetInteractionHandler implements IQueryHandler<GetInteractionQuery> {
  constructor(@Inject(INTERACTION_REPOSITORY) private readonly interactions: InteractionRepository) {}

  async execute(query: GetInteractionQuery) {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const i = await this.interactions.findById(tenantId, InteractionId.create(query.interactionId));
    if (!i) return null;
    return this.toDto(i);
  }

  private toDto(i: any) {
    return {
      id: i.id.value,
      caseId: i.caseId,
      assetId: i.assetId,
      counterpartyId: i.counterpartyId,
      type: i.type,
      direction: i.direction,
      subject: i.subject,
      body: i.body,
      participants: i.participants,
      occurredAt: i.occurredAt,
      recordedBy: i.recordedBy,
      recordedAt: i.recordedAt,
      metadata: i.metadata,
    };
  }
}

@QueryHandler(ListTasksQuery)
export class ListTasksHandler implements IQueryHandler<ListTasksQuery> {
  constructor(@Inject(TASK_REPOSITORY) private readonly tasks: TaskRepository) {}

  async execute(query: ListTasksQuery) {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    if (query.overdue) return this.tasks.findOverdue(tenantId);
    if (query.caseId) return this.tasks.findByCaseId(tenantId, query.caseId);
    if (query.assetId) return this.tasks.findByAssetId(tenantId, query.assetId);
    if (query.assignee) return this.tasks.findByAssignee(tenantId, query.assignee);
    if (query.status) return this.tasks.findByStatus(tenantId, query.status);
    if (query.type) return this.tasks.findByType(tenantId, query.type);
    return [];
  }
}

@QueryHandler(GetTaskQuery)
export class GetTaskHandler implements IQueryHandler<GetTaskQuery> {
  constructor(@Inject(TASK_REPOSITORY) private readonly tasks: TaskRepository) {}

  async execute(query: GetTaskQuery) {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const t = await this.tasks.findById(tenantId, TaskId.create(query.taskId));
    if (!t) return null;
    return this.toDto(t);
  }

  private toDto(t: any) {
    return {
      id: t.id.value,
      caseId: t.caseId,
      assetId: t.assetId,
      type: t.type,
      title: t.title,
      description: t.description,
      priority: t.priority,
      status: t.status,
      owner: t.owner,
      assignee: t.assignee,
      dueDate: t.dueDate,
      slaHours: t.slaHours,
      dependencies: t.dependencies,
      evidence: t.evidence,
      startedAt: t.startedAt,
      completedAt: t.completedAt,
      escalated: t.escalated,
      escalatedTo: t.escalatedTo,
      escalatedAt: t.escalatedAt,
      escalationReason: t.escalationReason,
      createdBy: t.createdBy,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    };
  }
}