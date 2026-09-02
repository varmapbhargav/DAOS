import {
  OriginationCaseId,
  OutboxPublisher,
  TenantContextHolder,
  TenantId,
} from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ORIGINATION_CASE_REPOSITORY,OUTBOX_PUBLISHER } from '../../../domain/repositories/repository.tokens';
import { OriginationCaseWorkflowStarter } from '../../../temporal/workflow-starter.service';
import { OriginationCase } from '../../domain/aggregates/origination-case.aggregate';
import { OriginationCaseRepository } from '../../domain/repositories/origination-case.repository';
import {
  CreateOriginationCaseDto,
  RejectCaseDto,
  ResumeCaseDto,
  UpdateOriginationCaseDto,
} from '../dto/origination-case.dto';

export class CreateOriginationCaseCommand {
  constructor(public readonly dto: CreateOriginationCaseDto) {}
}

export class SubmitCaseCommand {
  constructor(public readonly caseId: string) {}
}

export class CompleteIntakeCommand {
  constructor(public readonly caseId: string) {}
}

export class TransitionCaseCommand {
  constructor(public readonly caseId: string, public readonly action: string) {}
}

export class RejectCaseCommand {
  constructor(public readonly caseId: string, public readonly dto: RejectCaseDto) {}
}

export class PutCaseOnHoldCommand {
  constructor(public readonly caseId: string, public readonly reason: string) {}
}

export class ResumeCaseCommand {
  constructor(public readonly caseId: string, public readonly dto: ResumeCaseDto) {}
}

export class UpdateOriginationCaseCommand {
  constructor(public readonly caseId: string, public readonly dto: UpdateOriginationCaseDto) {}
}

export class WithdrawCaseCommand {
  constructor(public readonly caseId: string, public readonly reason: string) {}
}

const ACTIONS: Record<string, (c: OriginationCase, actor: string) => void> = {
  SCREENING: (c, actor) => c.startScreening(actor),
  QUALIFICATION: (c, actor) => c.startQualification(actor),
  DUE_DILIGENCE: (c, actor) => c.startDueDiligence(actor),
  VALUATION: (c, actor) => c.startValuation(actor),
  ASSET_RISK_REVIEW: (c, actor) => c.startRiskReview(actor),
  READY_FOR_APPROVAL: (c, actor) => c.readyForApproval(actor),
  APPROVAL_IN_PROGRESS: (c, actor) => c.startApproval(actor),
  APPROVED: (c, actor) => c.approve(actor),
};

@CommandHandler(CreateOriginationCaseCommand)
export class CreateOriginationCaseHandler implements ICommandHandler<CreateOriginationCaseCommand, { caseId: string }> {
  constructor(
    @Inject(ORIGINATION_CASE_REPOSITORY) private readonly cases: OriginationCaseRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: CreateOriginationCaseCommand): Promise<{ caseId: string }> {
    const dto = command.dto;
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const c = OriginationCase.create({
      tenantId,
      caseName: dto.caseName,
      caseNumber: dto.caseNumber,
      submissionType: dto.submissionType ?? 'MANUAL',
      submissionChannel: dto.submissionChannel ?? 'INTERNAL',
      sourceId: dto.sourceId,
      submittedBy: dto.submittedBy,
      relationshipManagerId: dto.relationshipManagerId,
      assetClass: dto.assetClass,
      assetSubclass: dto.assetSubclass,
      jurisdictions: dto.jurisdictions ?? [],
      indicativeValueMinorUnits: dto.indicativeValueMinorUnits,
      currency: dto.currency,
      priority: dto.priority ?? 'MEDIUM',
    });
    await this.cases.save(c);
    await this.outbox.publish(c.pullEvents());
    return { caseId: c.id.value };
  }
}

@CommandHandler(SubmitCaseCommand)
export class SubmitCaseHandler implements ICommandHandler<SubmitCaseCommand, void> {
  constructor(
    @Inject(ORIGINATION_CASE_REPOSITORY) private readonly cases: OriginationCaseRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
    private readonly temporal: OriginationCaseWorkflowStarter,
  ) {}

  async execute(command: SubmitCaseCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const c = await this.cases.findById(tenantId, OriginationCaseId.create(command.caseId));
    if (!c) throw new Error('Case not found');
    const actor = TenantContextHolder.get().userId ?? tenantId.value;
    c.submit(actor);
    await this.cases.save(c);
    await this.outbox.publish(c.pullEvents());

    await this.temporal.tryStart({
      tenantId: tenantId.value,
      caseId: c.id.value,
      caseNumber: c.caseNumber,
      assetClass: c.assetClass,
      actor,
    });
  }
}

@CommandHandler(CompleteIntakeCommand)
export class CompleteIntakeHandler implements ICommandHandler<CompleteIntakeCommand, void> {
  constructor(
    @Inject(ORIGINATION_CASE_REPOSITORY) private readonly cases: OriginationCaseRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: CompleteIntakeCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const c = await this.cases.findById(tenantId, OriginationCaseId.create(command.caseId));
    if (!c) throw new Error('Case not found');
    const actor = TenantContextHolder.get().userId ?? tenantId.value;
    c.intake(actor);
    await this.cases.save(c);
    await this.outbox.publish(c.pullEvents());
  }
}

@CommandHandler(TransitionCaseCommand)
export class TransitionCaseHandler implements ICommandHandler<TransitionCaseCommand, void> {
  constructor(
    @Inject(ORIGINATION_CASE_REPOSITORY) private readonly cases: OriginationCaseRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: TransitionCaseCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const c = await this.cases.findById(tenantId, OriginationCaseId.create(command.caseId));
    if (!c) throw new Error('Case not found');
    const fn = ACTIONS[command.action];
    if (!fn) throw new Error(`Unknown action ${command.action}`);
    const actor = TenantContextHolder.get().userId ?? tenantId.value;
    fn(c, actor);
    await this.cases.save(c);
    await this.outbox.publish(c.pullEvents());
  }
}

@CommandHandler(RejectCaseCommand)
export class RejectCaseHandler implements ICommandHandler<RejectCaseCommand, void> {
  constructor(
    @Inject(ORIGINATION_CASE_REPOSITORY) private readonly cases: OriginationCaseRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: RejectCaseCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const c = await this.cases.findById(tenantId, OriginationCaseId.create(command.caseId));
    if (!c) throw new Error('Case not found');
    const actor = TenantContextHolder.get().userId ?? tenantId.value;
    c.reject(command.dto.reason, actor);
    await this.cases.save(c);
    await this.outbox.publish(c.pullEvents());
  }
}

@CommandHandler(PutCaseOnHoldCommand)
export class PutCaseOnHoldHandler implements ICommandHandler<PutCaseOnHoldCommand, void> {
  constructor(
    @Inject(ORIGINATION_CASE_REPOSITORY) private readonly cases: OriginationCaseRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: PutCaseOnHoldCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const c = await this.cases.findById(tenantId, OriginationCaseId.create(command.caseId));
    if (!c) throw new Error('Case not found');
    const actor = TenantContextHolder.get().userId ?? tenantId.value;
    c.putOnHold(command.reason, actor);
    await this.cases.save(c);
    await this.outbox.publish(c.pullEvents());
  }
}

@CommandHandler(ResumeCaseCommand)
export class ResumeCaseHandler implements ICommandHandler<ResumeCaseCommand, void> {
  constructor(
    @Inject(ORIGINATION_CASE_REPOSITORY) private readonly cases: OriginationCaseRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: ResumeCaseCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const c = await this.cases.findById(tenantId, OriginationCaseId.create(command.caseId));
    if (!c) throw new Error('Case not found');
    const actor = TenantContextHolder.get().userId ?? tenantId.value;
    c.resume((command.dto.targetStatus ?? 'INTAKE') as OriginationCase['status'], actor);
    await this.cases.save(c);
    await this.outbox.publish(c.pullEvents());
  }
}

@CommandHandler(UpdateOriginationCaseCommand)
export class UpdateOriginationCaseHandler implements ICommandHandler<UpdateOriginationCaseCommand, void> {
  constructor(@Inject(ORIGINATION_CASE_REPOSITORY) private readonly cases: OriginationCaseRepository) {}

  async execute(command: UpdateOriginationCaseCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const c = await this.cases.findById(tenantId, OriginationCaseId.create(command.caseId));
    if (!c) throw new Error('Case not found');
    const dto = command.dto;
    if (dto.assignedTeamId !== undefined || dto.assignedAnalystId !== undefined || dto.relationshipManagerId !== undefined) {
      c.assign({
        teamId: dto.assignedTeamId ?? c.assignedTeamId,
        analystId: dto.assignedAnalystId ?? c.assignedAnalystId,
        actor: TenantContextHolder.get().userId ?? tenantId.value,
      });
    }
    if (dto.nextAction !== undefined || dto.nextActionDue !== undefined) {
      c.setNextAction(dto.nextAction ?? c.nextAction, dto.nextActionDue ?? c.nextActionDue);
    }
    await this.cases.save(c);
  }
}

@CommandHandler(WithdrawCaseCommand)
export class WithdrawCaseHandler implements ICommandHandler<WithdrawCaseCommand, void> {
  constructor(
    @Inject(ORIGINATION_CASE_REPOSITORY) private readonly cases: OriginationCaseRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: WithdrawCaseCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const c = await this.cases.findById(tenantId, OriginationCaseId.create(command.caseId));
    if (!c) throw new Error('Case not found');
    const actor = TenantContextHolder.get().userId ?? tenantId.value;
    c.withdraw(command.reason, actor);
    await this.cases.save(c);
    await this.outbox.publish(c.pullEvents());
  }
}
