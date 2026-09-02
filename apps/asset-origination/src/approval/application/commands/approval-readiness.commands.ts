import { ApprovalDecisionType, OriginationCaseId, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  APPROVAL_CASE_REPOSITORY,
  APPROVAL_DECISION_REPOSITORY,
  ENGINEERING_READINESS_REPOSITORY,
  ORIGINATION_CASE_REPOSITORY,
  OUTBOX_PUBLISHER,
} from '../../../domain/repositories/repository.tokens';
import { OriginationCaseRepository } from '../../../origination-case/domain/repositories/origination-case.repository';
import { ApprovalCase } from '../../domain/entities/approval-case.entity';
import { ApprovalDecision } from '../../domain/entities/approval-decision.entity';
import { EngineeringReadinessAssessment } from '../../domain/entities/engineering-readiness-assessment.entity';
import { ApprovalDecisionRecorded } from '../../domain/events/approval-events';
import { ApprovalCompleted } from '../../domain/events/approval-events';
import { AssetEngineeringReady } from '../../domain/events/engineering-readiness-events';
import { EngineeringReadinessAssessed } from '../../domain/events/engineering-readiness-events';
import { ApprovalCaseRepository } from '../../domain/repositories/approval-case.repository';
import { ApprovalDecisionRepository } from '../../domain/repositories/approval-decision.repository';
import { EngineeringReadinessRepository } from '../../domain/repositories/engineering-readiness.repository';
import {
  AssessEngineeringReadinessDto,
  CompleteApprovalDto,
  RecordApprovalDecisionDto,
  RecordEngineeringCheckDto,
  StartApprovalDto,
} from '../dto/approval-readiness.dto';

export class StartApprovalCommand {
  constructor(public readonly caseId: string, public readonly dto: StartApprovalDto) {}
}

export class RecordApprovalDecisionCommand {
  constructor(public readonly caseId: string, public readonly dto: RecordApprovalDecisionDto) {}
}

export class CompleteApprovalCommand {
  constructor(public readonly caseId: string, public readonly dto: CompleteApprovalDto) {}
}

export class AssessEngineeringReadinessCommand {
  constructor(public readonly caseId: string, public readonly dto: AssessEngineeringReadinessDto) {}
}

export class RecordEngineeringCheckCommand {
  constructor(public readonly caseId: string, public readonly dto: RecordEngineeringCheckDto) {}
}

export class CompleteEngineeringReadinessCommand {
  constructor(public readonly caseId: string) {}
}

@CommandHandler(StartApprovalCommand)
export class StartApprovalHandler implements ICommandHandler<StartApprovalCommand, { approvalCaseId: string }> {
  constructor(
    @Inject(APPROVAL_CASE_REPOSITORY) private readonly approvalCases: ApprovalCaseRepository,
    @Inject(ORIGINATION_CASE_REPOSITORY) private readonly cases: OriginationCaseRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: StartApprovalCommand): Promise<{ approvalCaseId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;

    const existing = await this.approvalCases.findByCaseId(tenantId, command.caseId);
    if (existing) throw new Error('Approval case already started for this origination case');

    const approvalCase = ApprovalCase.create({
      tenantId,
      caseId: command.caseId,
      approvalType: command.dto.approvalType as ApprovalCase['approvalType'],
      levels: command.dto.levels ?? ['LEVEL_1'],
      requiredApprovers: new Map(Object.entries(command.dto.requiredApprovers ?? { 'LEVEL_1': [actor] })),
      thresholdAmount: command.dto.thresholdAmount ?? null,
    });
    await this.approvalCases.save(approvalCase);

    const caseAgg = await this.cases.findById(tenantId, OriginationCaseId.create(command.caseId));
    if (caseAgg) {
      caseAgg.startApproval(actor);
      await this.cases.save(caseAgg);
      await this.outbox.publish(caseAgg.pullEvents());
    }

    return { approvalCaseId: approvalCase.id.value };
  }
}

@CommandHandler(RecordApprovalDecisionCommand)
export class RecordApprovalDecisionHandler implements ICommandHandler<RecordApprovalDecisionCommand, { decisionId: string }> {
  constructor(
    @Inject(APPROVAL_CASE_REPOSITORY) private readonly approvalCases: ApprovalCaseRepository,
    @Inject(APPROVAL_DECISION_REPOSITORY) private readonly decisions: ApprovalDecisionRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: RecordApprovalDecisionCommand): Promise<{ decisionId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;

    const approvalCase = await this.approvalCases.findByCaseId(tenantId, command.caseId);
    if (!approvalCase) throw new NotFoundException('Approval case not found');

    const decision = ApprovalDecision.create({
      tenantId,
      caseId: command.caseId,
      approvalCaseId: approvalCase.id.value,
      approver: actor,
      level: command.dto.level as ApprovalDecision['level'],
      decision: command.dto.decision as ApprovalDecision['decision'],
      reason: command.dto.reason ?? null,
      conditions: command.dto.conditions ?? [],
    });
    await this.decisions.save(decision);

    approvalCase.recordDecision(decision.id.value, command.dto.decision, command.dto.level, command.dto.conditions);
    await this.approvalCases.save(approvalCase);

    const event = new ApprovalDecisionRecorded(
      command.caseId,
      tenantId.value,
      decision.id.value,
      command.caseId,
      actor,
      command.dto.decision as ApprovalDecisionType,
      command.dto.level,
      command.dto.reason ?? null,
      command.dto.conditions ?? [],
      false,
    );
    await this.outbox.publish([event]);

    return { decisionId: decision.id.value };
  }
}

@CommandHandler(CompleteApprovalCommand)
export class CompleteApprovalHandler implements ICommandHandler<CompleteApprovalCommand, void> {
  constructor(
    @Inject(APPROVAL_CASE_REPOSITORY) private readonly approvalCases: ApprovalCaseRepository,
    @Inject(ORIGINATION_CASE_REPOSITORY) private readonly cases: OriginationCaseRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: CompleteApprovalCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;

    const approvalCase = await this.approvalCases.findByCaseId(tenantId, command.caseId);
    if (!approvalCase) throw new NotFoundException('Approval case not found');

    const finalDecision = command.dto.finalDecision === 'CONDITIONALLY_APPROVE' ? 'CONDITIONALLY_APPROVED' : command.dto.finalDecision;
    approvalCase.complete(finalDecision, actor, command.dto.reason);
    await this.approvalCases.save(approvalCase);

    const caseAgg = await this.cases.findById(tenantId, OriginationCaseId.create(command.caseId));
    if (caseAgg) {
      if (finalDecision === 'APPROVED' || finalDecision === 'CONDITIONALLY_APPROVED') {
        caseAgg.markEngineeringReady(actor);
      } else {
        caseAgg.reject(command.dto.reason ?? 'Approval rejected', actor);
      }
      await this.cases.save(caseAgg);
      await this.outbox.publish(caseAgg.pullEvents());
    }

    const event = new ApprovalCompleted(
      command.caseId,
      tenantId.value,
      command.caseId,
      approvalCase.status,
      actor,
      new Date().toISOString(),
    );
    await this.outbox.publish([event]);
  }
}

@CommandHandler(AssessEngineeringReadinessCommand)
export class AssessEngineeringReadinessHandler implements ICommandHandler<AssessEngineeringReadinessCommand, { assessmentId: string }> {
  constructor(
    @Inject(ENGINEERING_READINESS_REPOSITORY) private readonly assessments: EngineeringReadinessRepository,
    @Inject(ORIGINATION_CASE_REPOSITORY) private readonly cases: OriginationCaseRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: AssessEngineeringReadinessCommand): Promise<{ assessmentId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;

    const existing = await this.assessments.findByCaseId(tenantId, command.caseId);
    if (existing) throw new Error('Engineering readiness assessment already exists for this case');

    const caseAgg = await this.cases.findById(tenantId, OriginationCaseId.create(command.caseId));
    if (!caseAgg) throw new NotFoundException('Origination case not found');

    const assessment = EngineeringReadinessAssessment.create({
      tenantId,
      caseId: command.caseId,
      assetId: command.dto.assetId,
      assessedBy: actor,
    });

    if (command.dto.checks) {
      for (const [check, result] of Object.entries(command.dto.checks)) {
        assessment.recordCheck(check, result.passed, result.notes);
      }
    }

    await this.assessments.save(assessment);

    const event = new EngineeringReadinessAssessed(
      command.caseId,
      tenantId.value,
      assessment.id.value,
      command.caseId,
      assessment.status,
      Array.from(assessment.checks.values()).filter((c) => c.passed).length,
      assessment.checks.size,
      Array.from(assessment.checks.entries()).filter(([, v]) => !v.passed).map(([k]) => k),
      actor,
    );
    await this.outbox.publish([event]);

    return { assessmentId: assessment.id.value };
  }
}

@CommandHandler(RecordEngineeringCheckCommand)
export class RecordEngineeringCheckHandler implements ICommandHandler<RecordEngineeringCheckCommand, void> {
  constructor(
    @Inject(ENGINEERING_READINESS_REPOSITORY) private readonly assessments: EngineeringReadinessRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: RecordEngineeringCheckCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());

    const assessment = await this.assessments.findByCaseId(tenantId, command.caseId);
    if (!assessment) throw new NotFoundException('Engineering readiness assessment not found');

    assessment.recordCheck(command.dto.check, command.dto.passed, command.dto.notes);
    await this.assessments.save(assessment);

    const event = new EngineeringReadinessAssessed(
      command.caseId,
      tenantId.value,
      assessment.id.value,
      command.caseId,
      assessment.status,
      Array.from(assessment.checks.values()).filter((c) => c.passed).length,
      assessment.checks.size,
      Array.from(assessment.checks.entries()).filter(([, v]) => !v.passed).map(([k]) => k),
      TenantContextHolder.get().userId ?? tenantId.value,
    );
    await this.outbox.publish([event]);
  }
}

@CommandHandler(CompleteEngineeringReadinessCommand)
export class CompleteEngineeringReadinessHandler implements ICommandHandler<CompleteEngineeringReadinessCommand, void> {
  constructor(
    @Inject(ENGINEERING_READINESS_REPOSITORY) private readonly assessments: EngineeringReadinessRepository,
    @Inject(ORIGINATION_CASE_REPOSITORY) private readonly cases: OriginationCaseRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: CompleteEngineeringReadinessCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());

    const assessment = await this.assessments.findByCaseId(tenantId, command.caseId);
    if (!assessment) throw new NotFoundException('Engineering readiness assessment not found');

    const caseAgg = await this.cases.findById(tenantId, OriginationCaseId.create(command.caseId));
    if (!caseAgg) throw new NotFoundException('Origination case not found');

    // Publish AssetEngineeringReady event
    const event = new AssetEngineeringReady(
      command.caseId,
      tenantId.value,
      command.caseId,
      assessment.assetId,
      assessment.status,
      new Date().toISOString(),
    );
    await this.outbox.publish([event]);
  }
}