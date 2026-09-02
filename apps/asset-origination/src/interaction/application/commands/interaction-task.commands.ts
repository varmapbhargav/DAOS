import { OutboxPublisher, TaskId, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  INTERACTION_REPOSITORY,
  ORIGINATION_CASE_REPOSITORY,
  OUTBOX_PUBLISHER,
  TASK_REPOSITORY,
} from '../../../domain/repositories/repository.tokens';
import { OriginationCaseRepository } from '../../../origination-case/domain/repositories/origination-case.repository';
import { Interaction } from '../../domain/entities/interaction.entity';
import { Task, TaskDependency } from '../../domain/entities/task.entity';
import { InteractionRecorded } from '../../domain/events/interaction-events';
import { TaskCreated } from '../../domain/events/task-events';
import { TaskAssigned } from '../../domain/events/task-events';
import { TaskCompleted } from '../../domain/events/task-events';
import { TaskEscalated } from '../../domain/events/task-events';
import { InteractionRepository } from '../../domain/repositories/interaction.repository';
import { TaskRepository } from '../../domain/repositories/task.repository';
import {
  AddTaskDependencyDto,
  AssignTaskDto,
  CreateTaskDto,
  EscalateTaskDto,
  RecordInteractionDto,
  UpdateTaskDto,
} from '../dto/interaction-task.dto';

export class RecordInteractionCommand {
  constructor(public readonly dto: RecordInteractionDto) {}
}

export class CreateTaskCommand {
  constructor(public readonly dto: CreateTaskDto) {}
}

export class UpdateTaskCommand {
  constructor(public readonly taskId: string, public readonly dto: UpdateTaskDto) {}
}

export class AssignTaskCommand {
  constructor(public readonly taskId: string, public readonly dto: AssignTaskDto) {}
}

export class AddTaskDependencyCommand {
  constructor(public readonly taskId: string, public readonly dto: AddTaskDependencyDto) {}
}

export class EscalateTaskCommand {
  constructor(public readonly taskId: string, public readonly dto: EscalateTaskDto) {}
}

export class CompleteTaskCommand {
  constructor(public readonly taskId: string, public readonly evidence: string[] = []) {}
}

export class CancelTaskCommand {
  constructor(public readonly taskId: string) {}
}

@CommandHandler(RecordInteractionCommand)
export class RecordInteractionHandler implements ICommandHandler<RecordInteractionCommand, { interactionId: string }> {
  constructor(
    @Inject(INTERACTION_REPOSITORY) private readonly interactions: InteractionRepository,
    @Inject(ORIGINATION_CASE_REPOSITORY) private readonly cases: OriginationCaseRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: RecordInteractionCommand): Promise<{ interactionId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;

    const interaction = Interaction.create({
      tenantId,
      caseId: command.dto.caseId ?? null,
      assetId: command.dto.assetId ?? null,
      counterpartyId: command.dto.counterpartyId ?? null,
      type: command.dto.type as Interaction['type'],
      direction: command.dto.direction as Interaction['direction'],
      subject: command.dto.subject,
      body: command.dto.body ?? null,
      participants: command.dto.participants ?? [],
      occurredAt: command.dto.occurredAt ?? new Date().toISOString(),
      recordedBy: actor,
      metadata: command.dto.metadata ?? {},
    });
    await this.interactions.save(interaction);

    const event = new InteractionRecorded(
      interaction.id.value,
      tenantId.value,
      interaction.id.value,
      interaction.caseId,
      interaction.assetId,
      interaction.counterpartyId,
      interaction.type,
      interaction.direction,
      interaction.subject,
      interaction.occurredAt,
      actor,
    );
    await this.outbox.publish([event]);

    return { interactionId: interaction.id.value };
  }
}

@CommandHandler(CreateTaskCommand)
export class CreateTaskHandler implements ICommandHandler<CreateTaskCommand, { taskId: string }> {
  constructor(
    @Inject(TASK_REPOSITORY) private readonly tasks: TaskRepository,
    @Inject(ORIGINATION_CASE_REPOSITORY) private readonly cases: OriginationCaseRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: CreateTaskCommand): Promise<{ taskId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;

    const task = Task.create({
      tenantId,
      caseId: command.dto.caseId ?? null,
      assetId: command.dto.assetId ?? null,
      type: command.dto.type as Task['type'],
      title: command.dto.title,
      description: command.dto.description ?? null,
      priority: (command.dto.priority as Task['priority']) ?? 'MEDIUM',
      owner: command.dto.owner ?? null,
      assignee: command.dto.assignee ?? null,
      dueDate: command.dto.dueDate ?? null,
      slaHours: command.dto.slaHours ?? null,
      createdBy: actor,
    });
    await this.tasks.save(task);

    const event = new TaskCreated(
      task.id.value,
      tenantId.value,
      task.id.value,
      task.caseId,
      task.assetId,
      task.type,
      task.priority,
      task.dueDate,
      actor,
    );
    await this.outbox.publish([event]);

    return { taskId: task.id.value };
  }
}

@CommandHandler(UpdateTaskCommand)
export class UpdateTaskHandler implements ICommandHandler<UpdateTaskCommand, void> {
  constructor(
    @Inject(TASK_REPOSITORY) private readonly tasks: TaskRepository,
  ) {}

  async execute(command: UpdateTaskCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const task = await this.tasks.findById(tenantId, TaskId.create(command.taskId));
    if (!task) throw new NotFoundException('Task not found');

    const oldStatus = task.status;
    if (command.dto.status) {
      task.updatePriority(command.dto.priority as Task['priority']);
      if (command.dto.status !== oldStatus) {
        switch (command.dto.status) {
          case 'IN_PROGRESS': task.start(); break;
          case 'COMPLETED': task.complete(command.dto.evidence ?? []); break;
          case 'CANCELLED': task.cancel(); break;
          case 'BLOCKED': task.block(); break;
        }
      }
    }
    if (command.dto.assignee) {
      task.assign(command.dto.assignee);
    }
    if (command.dto.dueDate) {
      task.updatePriority(task.priority); // just to update timestamp
    }
    if (command.dto.escalationReason) {
      task.escalate(task.escalatedTo ?? 'SYSTEM', command.dto.escalationReason);
    }

    await this.tasks.save(task);
  }
}

@CommandHandler(AssignTaskCommand)
export class AssignTaskHandler implements ICommandHandler<AssignTaskCommand, void> {
  constructor(
    @Inject(TASK_REPOSITORY) private readonly tasks: TaskRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: AssignTaskCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;
    const task = await this.tasks.findById(tenantId, TaskId.create(command.taskId));
    if (!task) throw new NotFoundException('Task not found');

    task.assign(command.dto.assignee);
    await this.tasks.save(task);

    const event = new TaskAssigned(
      task.id.value,
      tenantId.value,
      task.id.value,
      command.dto.assignee,
      actor,
    );
    await this.outbox.publish([event]);
  }
}

@CommandHandler(AddTaskDependencyCommand)
export class AddTaskDependencyHandler implements ICommandHandler<AddTaskDependencyCommand, void> {
  constructor(
    @Inject(TASK_REPOSITORY) private readonly tasks: TaskRepository,
  ) {}

  async execute(command: AddTaskDependencyCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const task = await this.tasks.findById(tenantId, TaskId.create(command.taskId));
    if (!task) throw new NotFoundException('Task not found');

    task.addDependency(command.dto.taskId, command.dto.type as TaskDependency['type']);
    await this.tasks.save(task);
  }
}

@CommandHandler(EscalateTaskCommand)
export class EscalateTaskHandler implements ICommandHandler<EscalateTaskCommand, void> {
  constructor(
    @Inject(TASK_REPOSITORY) private readonly tasks: TaskRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: EscalateTaskCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;
    const task = await this.tasks.findById(tenantId, TaskId.create(command.taskId));
    if (!task) throw new NotFoundException('Task not found');

    task.escalate(command.dto.escalatedTo, command.dto.reason);
    await this.tasks.save(task);

    const event = new TaskEscalated(
      task.id.value,
      tenantId.value,
      task.id.value,
      command.dto.escalatedTo,
      actor,
      command.dto.reason,
    );
    await this.outbox.publish([event]);
  }
}

@CommandHandler(CompleteTaskCommand)
export class CompleteTaskHandler implements ICommandHandler<CompleteTaskCommand, void> {
  constructor(
    @Inject(TASK_REPOSITORY) private readonly tasks: TaskRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: CompleteTaskCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;
    const task = await this.tasks.findById(tenantId, TaskId.create(command.taskId));
    if (!task) throw new NotFoundException('Task not found');

    task.complete(command.evidence);
    await this.tasks.save(task);

    const event = new TaskCompleted(
      task.id.value,
      tenantId.value,
      task.id.value,
      actor,
      command.evidence,
    );
    await this.outbox.publish([event]);
  }
}

@CommandHandler(CancelTaskCommand)
export class CancelTaskHandler implements ICommandHandler<CancelTaskCommand, void> {
  constructor(
    @Inject(TASK_REPOSITORY) private readonly tasks: TaskRepository,
  ) {}

  async execute(command: CancelTaskCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const task = await this.tasks.findById(tenantId, TaskId.create(command.taskId));
    if (!task) throw new NotFoundException('Task not found');

    task.cancel();
    await this.tasks.save(task);
  }
}