import { DomainEvent, TaskPriority, TaskStatus, TaskType } from '@daos/shared-kernel';

export class TaskCreated extends DomainEvent {
  get eventType(): string {
    return 'origination-case.task-created.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly taskId: string,
    public readonly caseId: string | null,
    public readonly assetId: string | null,
    public readonly type: TaskType,
    public readonly priority: TaskPriority,
    public readonly dueDate: string | null,
    public readonly createdBy: string,
  ) {
    super(aggregateId, tenantId);
  }
}

export class TaskAssigned extends DomainEvent {
  get eventType(): string {
    return 'origination-case.task-assigned.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly taskId: string,
    public readonly assignee: string,
    public readonly assignedBy: string,
  ) {
    super(aggregateId, tenantId);
  }
}

export class TaskStatusChanged extends DomainEvent {
  get eventType(): string {
    return 'origination-case.task-status-changed.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly taskId: string,
    public readonly oldStatus: TaskStatus,
    public readonly newStatus: TaskStatus,
    public readonly changedBy: string,
  ) {
    super(aggregateId, tenantId);
  }
}

export class TaskCompleted extends DomainEvent {
  get eventType(): string {
    return 'origination-case.task-completed.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly taskId: string,
    public readonly completedBy: string,
    public readonly evidence: string[],
  ) {
    super(aggregateId, tenantId);
  }
}

export class TaskEscalated extends DomainEvent {
  get eventType(): string {
    return 'origination-case.task-escalated.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly taskId: string,
    public readonly escalatedTo: string,
    public readonly escalatedBy: string,
    public readonly reason: string,
  ) {
    super(aggregateId, tenantId);
  }
}