import { TaskDependencyType, TaskId, TaskPriority, TaskStatus, TaskType, TenantId } from '@daos/shared-kernel';

export class TaskDependency {
  constructor(
    public readonly taskId: string,
    public readonly type: TaskDependencyType,
  ) {}
}

export class Task {
  private constructor(
    public readonly id: TaskId,
    public readonly tenantId: TenantId,
    public readonly caseId: string | null,
    public readonly assetId: string | null,
    private _type: TaskType,
    private _title: string,
    private _description: string | null,
    private _priority: TaskPriority,
    private _status: TaskStatus,
    private _owner: string | null,
    private _assignee: string | null,
    private _dueDate: string | null,
    private _slaHours: number | null,
    private _dependencies: TaskDependency[],
    private _evidence: string[],
    private _startedAt: string | null,
    private _completedAt: string | null,
    private _escalated: boolean,
    private _escalatedTo: string | null,
    private _escalatedAt: string | null,
    private _escalationReason: string | null,
    private _createdBy: string,
    private _createdAt: string,
    private _updatedAt: string,
  ) {}

  static create(params: {
    tenantId: TenantId;
    caseId?: string | null;
    assetId?: string | null;
    type: TaskType;
    title: string;
    description?: string | null;
    priority?: TaskPriority;
    owner?: string | null;
    assignee?: string | null;
    dueDate?: string | null;
    slaHours?: number | null;
    createdBy: string;
  }): Task {
    return new Task(
      TaskId.create(),
      params.tenantId,
      params.caseId ?? null,
      params.assetId ?? null,
      params.type,
      params.title,
      params.description ?? null,
      params.priority ?? 'MEDIUM',
      'PENDING',
      params.owner ?? null,
      params.assignee ?? null,
      params.dueDate ?? null,
      params.slaHours ?? null,
      [],
      [],
      null,
      null,
      false,
      null,
      null,
      null,
      params.createdBy,
      new Date().toISOString(),
      new Date().toISOString(),
    );
  }

  static reconstruct(params: {
    id: TaskId;
    tenantId: TenantId;
    caseId: string | null;
    assetId: string | null;
    type: TaskType;
    title: string;
    description: string | null;
    priority: TaskPriority;
    status: TaskStatus;
    owner: string | null;
    assignee: string | null;
    dueDate: string | null;
    slaHours: number | null;
    dependencies: TaskDependency[];
    evidence: string[];
    startedAt: string | null;
    completedAt: string | null;
    escalated: boolean;
    escalatedTo: string | null;
    escalatedAt: string | null;
    escalationReason: string | null;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  }): Task {
    return new Task(
      params.id,
      params.tenantId,
      params.caseId,
      params.assetId,
      params.type,
      params.title,
      params.description,
      params.priority,
      params.status,
      params.owner,
      params.assignee,
      params.dueDate,
      params.slaHours,
      params.dependencies,
      params.evidence,
      params.startedAt,
      params.completedAt,
      params.escalated,
      params.escalatedTo,
      params.escalatedAt,
      params.escalationReason,
      params.createdBy,
      params.createdAt,
      params.updatedAt,
    );
  }

  get type(): TaskType {
    return this._type;
  }
  get title(): string {
    return this._title;
  }
  get description(): string | null {
    return this._description;
  }
  get priority(): TaskPriority {
    return this._priority;
  }
  get status(): TaskStatus {
    return this._status;
  }
  get owner(): string | null {
    return this._owner;
  }
  get assignee(): string | null {
    return this._assignee;
  }
  get dueDate(): string | null {
    return this._dueDate;
  }
  get slaHours(): number | null {
    return this._slaHours;
  }
  get dependencies(): TaskDependency[] {
    return [...this._dependencies];
  }
  get evidence(): string[] {
    return [...this._evidence];
  }
  get startedAt(): string | null {
    return this._startedAt;
  }
  get completedAt(): string | null {
    return this._completedAt;
  }
  get escalated(): boolean {
    return this._escalated;
  }
  get escalatedTo(): string | null {
    return this._escalatedTo;
  }
  get escalatedAt(): string | null {
    return this._escalatedAt;
  }
  get escalationReason(): string | null {
    return this._escalationReason;
  }
  get createdBy(): string {
    return this._createdBy;
  }
  get createdAt(): string {
    return this._createdAt;
  }
  get updatedAt(): string {
    return this._updatedAt;
  }

  assign(assignee: string): void {
    this._assignee = assignee;
    this._status = 'ASSIGNED';
    this._updatedAt = new Date().toISOString();
  }

  start(): void {
    if (this._status === 'COMPLETED' || this._status === 'CANCELLED') {
      throw new Error('Cannot start completed or cancelled task');
    }
    this._status = 'IN_PROGRESS';
    this._startedAt = this._startedAt ?? new Date().toISOString();
    this._updatedAt = new Date().toISOString();
  }

  complete(evidence: string[]): void {
    this._status = 'COMPLETED';
    this._completedAt = new Date().toISOString();
    this._evidence.push(...evidence);
    this._updatedAt = new Date().toISOString();
  }

  cancel(): void {
    this._status = 'CANCELLED';
    this._updatedAt = new Date().toISOString();
  }

  block(reason?: string): void {
    this._status = 'BLOCKED';
    this._updatedAt = new Date().toISOString();
  }

  escalate(to: string, reason: string): void {
    this._escalated = true;
    this._escalatedTo = to;
    this._escalatedAt = new Date().toISOString();
    this._escalationReason = reason;
    this._updatedAt = new Date().toISOString();
  }

  addDependency(taskId: string, type: TaskDependencyType): void {
    this._dependencies.push(new TaskDependency(taskId, type));
    this._updatedAt = new Date().toISOString();
  }

  addEvidence(reference: string): void {
    if (!this._evidence.includes(reference)) {
      this._evidence.push(reference);
    }
  }

  updatePriority(priority: TaskPriority): void {
    this._priority = priority;
    this._updatedAt = new Date().toISOString();
  }

  isOverdue(): boolean {
    if (!this._dueDate || this._status === 'COMPLETED' || this._status === 'CANCELLED') return false;
    return new Date(this._dueDate) < new Date();
  }
}