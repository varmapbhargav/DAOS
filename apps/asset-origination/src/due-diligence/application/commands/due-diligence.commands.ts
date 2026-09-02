import {
  DdFindingId,
  OriginationCaseId,
  OutboxPublisher,
  TenantContextHolder,
  TenantId,
} from '@daos/shared-kernel';
import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  DD_FINDING_REPOSITORY,
  DUE_DILIGENCE_CASE_REPOSITORY,
  ORIGINATION_CASE_REPOSITORY,
  OUTBOX_PUBLISHER,
} from '../../../domain/repositories/repository.tokens';
import { OriginationCaseRepository } from '../../../origination-case/domain/repositories/origination-case.repository';
import { DdFinding } from '../../domain/entities/dd-finding.entity';
import { DueDiligenceCase } from '../../domain/entities/due-diligence-case.entity';
import { DDCompleted } from '../../domain/events/dd-completed.event';
import { DDFindingCreated } from '../../domain/events/dd-finding-created.event';
import { DdFindingRepository } from '../../domain/repositories/dd-finding.repository';
import { DueDiligenceCaseRepository } from '../../domain/repositories/due-diligence-case.repository';
import {
  AddDdFindingDto,
  CompleteDueDiligenceDto,
  StartDueDiligenceDto,
  UpdateDdFindingDto,
} from '../dto/due-diligence.dto';

export class StartDueDiligenceCommand {
  constructor(public readonly caseId: string, public readonly dto: StartDueDiligenceDto) {}
}

export class AddDdFindingCommand {
  constructor(public readonly caseId: string, public readonly dto: AddDdFindingDto) {}
}

export class UpdateDdFindingCommand {
  constructor(public readonly findingId: string, public readonly dto: UpdateDdFindingDto) {}
}

export class CompleteDueDiligenceCommand {
  constructor(public readonly caseId: string, public readonly dto: CompleteDueDiligenceDto) {}
}

@CommandHandler(StartDueDiligenceCommand)
export class StartDueDiligenceHandler implements ICommandHandler<StartDueDiligenceCommand, { ddCaseId: string }> {
  constructor(
    @Inject(DUE_DILIGENCE_CASE_REPOSITORY) private readonly ddCases: DueDiligenceCaseRepository,
    @Inject(ORIGINATION_CASE_REPOSITORY) private readonly cases: OriginationCaseRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: StartDueDiligenceCommand): Promise<{ ddCaseId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;

    const existing = await this.ddCases.findByCaseId(tenantId, command.caseId);
    if (existing) throw new Error('Due diligence case already started for this origination case');

    const ddCase = DueDiligenceCase.create({
      tenantId,
      caseId: command.caseId,
      reviewers: command.dto.reviewers,
      dueDate: command.dto.dueDate ?? null,
    });
    await this.ddCases.save(ddCase);

    const caseAgg = await this.cases.findById(tenantId, OriginationCaseId.create(command.caseId));
    if (caseAgg) {
      caseAgg.startDueDiligence(actor);
      await this.cases.save(caseAgg);
      await this.outbox.publish(caseAgg.pullEvents());
    }

    return { ddCaseId: ddCase.id.value };
  }
}

@CommandHandler(AddDdFindingCommand)
export class AddDdFindingHandler implements ICommandHandler<AddDdFindingCommand, { findingId: string }> {
  constructor(
    @Inject(DD_FINDING_REPOSITORY) private readonly findings: DdFindingRepository,
    @Inject(DUE_DILIGENCE_CASE_REPOSITORY) private readonly ddCases: DueDiligenceCaseRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: AddDdFindingCommand): Promise<{ findingId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());

    const ddCase = await this.ddCases.findByCaseId(tenantId, command.caseId);
    if (!ddCase) throw new NotFoundException('Due diligence case not found for this origination case');
    if (ddCase.status === 'COMPLETED') throw new Error('Cannot add findings to a completed due diligence case');

    const finding = DdFinding.create({
      tenantId,
      ddCaseId: ddCase.id.value,
      caseId: command.caseId,
      category: command.dto.category as DdFinding['category'],
      severity: command.dto.severity as DdFinding['severity'],
      description: command.dto.description,
      evidence: command.dto.evidence,
      impact: command.dto.impact ?? null,
      recommendation: command.dto.recommendation ?? null,
      remediation: command.dto.remediation ?? null,
      owner: command.dto.owner ?? null,
      dueDate: command.dto.dueDate ?? null,
      reviewer: command.dto.reviewer ?? null,
    });
    await this.findings.save(finding);

    const event = new DDFindingCreated(
      command.caseId,
      tenantId.value,
      finding.id.value,
      finding.category,
      finding.severity,
      finding.description,
    );
    await this.outbox.publish([event]);

    return { findingId: finding.id.value };
  }
}

@CommandHandler(UpdateDdFindingCommand)
export class UpdateDdFindingHandler implements ICommandHandler<UpdateDdFindingCommand, void> {
  constructor(@Inject(DD_FINDING_REPOSITORY) private readonly findings: DdFindingRepository) {}

  async execute(command: UpdateDdFindingCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const finding = await this.findings.findById(tenantId, DdFindingId.create(command.findingId));
    if (!finding) throw new NotFoundException('Findings not found');

    if (command.dto.evidence) {
      for (const ref of command.dto.evidence) {
        finding.addEvidence(ref);
      }
    }
    if (command.dto.status !== undefined || command.dto.reviewer !== undefined) {
      finding.updateStatus(
        (command.dto.status as DdFinding['status']) ?? finding.status,
        command.dto.reviewer ?? finding.reviewer,
      );
    }
    if (command.dto.owner !== undefined || command.dto.dueDate !== undefined) {
      finding.assign(command.dto.owner ?? finding.owner, command.dto.dueDate ?? finding.dueDate);
    }
    if (command.dto.remediation !== undefined) {
      finding.updateRemediation(command.dto.remediation);
    }
    await this.findings.save(finding);
  }
}

@CommandHandler(CompleteDueDiligenceCommand)
export class CompleteDueDiligenceHandler implements ICommandHandler<CompleteDueDiligenceCommand, void> {
  constructor(
    @Inject(DUE_DILIGENCE_CASE_REPOSITORY) private readonly ddCases: DueDiligenceCaseRepository,
    @Inject(DD_FINDING_REPOSITORY) private readonly findings: DdFindingRepository,
    @Inject(ORIGINATION_CASE_REPOSITORY) private readonly cases: OriginationCaseRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: CompleteDueDiligenceCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;

    const ddCase = await this.ddCases.findByCaseId(tenantId, command.caseId);
    if (!ddCase) throw new NotFoundException('Due diligence case not found for this origination case');

    const findings = await this.findings.findByDdCaseId(tenantId, ddCase.id.value);
    ddCase.complete(command.dto.summary ?? null);
    await this.ddCases.save(ddCase);

    const caseAgg = await this.cases.findById(tenantId, OriginationCaseId.create(command.caseId));
    if (caseAgg) {
      caseAgg.startValuation(actor);
      await this.cases.save(caseAgg);
      await this.outbox.publish(caseAgg.pullEvents());
    }

    const event = new DDCompleted(command.caseId, tenantId.value, ddCase.id.value, actor, findings.length);
    await this.outbox.publish([event]);
  }
}
