import { OriginationCaseId, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { QualificationResult } from '../../domain/entities/qualification-result.entity';
import { ScreeningResult } from '../../domain/entities/screening-result.entity';
import { QualificationCompleted } from '../../domain/events/qualification-completed.event';
import { ScreeningCompleted } from '../../domain/events/screening-completed.event';
import { OriginationCaseRepository } from '../../domain/repositories/origination-case.repository';
import { QualificationResultRepository } from '../../domain/repositories/qualification-result.repository';
import {
  ORIGINATION_CASE_REPOSITORY,
  OUTBOX_PUBLISHER,
  QUALIFICATION_RESULT_REPOSITORY,
  SCREENING_RESULT_REPOSITORY,
} from '../../domain/repositories/repository.tokens';
import { ScreeningResultRepository } from '../../domain/repositories/screening-result.repository';
import {
  OverrideScreeningDto,
  RunQualificationDto,
  RunScreeningDto,
} from '../dto/screening-qualification.dto';

export class RunScreeningCommand {
  constructor(public readonly caseId: string, public readonly dto: RunScreeningDto) {}
}

export class OverrideScreeningCommand {
  constructor(public readonly caseId: string, public readonly dto: OverrideScreeningDto) {}
}

export class RunQualificationCommand {
  constructor(public readonly caseId: string, public readonly dto: RunQualificationDto) {}
}

@CommandHandler(RunScreeningCommand)
export class RunScreeningHandler implements ICommandHandler<RunScreeningCommand, { screeningId: string }> {
  constructor(
    @Inject(SCREENING_RESULT_REPOSITORY) private readonly screenings: ScreeningResultRepository,
    @Inject(ORIGINATION_CASE_REPOSITORY) private readonly cases: OriginationCaseRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: RunScreeningCommand): Promise<{ screeningId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;
    const dto = command.dto;

    const screening = ScreeningResult.create({
      tenantId,
      caseId: command.caseId,
      decision: dto.decision as ScreeningResult['decision'],
      score: dto.score,
      maxScore: dto.maxScore,
      criteria: (dto.criteria ?? []).map((c) => ({
        rule: c.rule,
        result: c.result as ScreeningResult['criteria'][number]['result'],
        severity: c.severity as ScreeningResult['criteria'][number]['severity'],
        evidence: c.evidence ?? null,
        explanation: c.explanation ?? null,
        overrideBy: null,
        overrideReason: null,
      })),
      comments: dto.comments ?? null,
      reviewer: actor,
    });

    await this.screenings.save(screening);

    const caseAgg = await this.cases.findById(tenantId, OriginationCaseId.create(command.caseId));
    if (caseAgg) {
      if (screening.decision === 'PASS' || screening.decision === 'CONDITIONAL') {
        caseAgg.startQualification(actor);
      } else {
        caseAgg.reject('Failed screening', actor);
      }
      await this.cases.save(caseAgg);
      await this.outbox.publish(caseAgg.pullEvents());
    }

    const event = new ScreeningCompleted(
      command.caseId,
      tenantId.value,
      screening.id.value,
      screening.decision,
      screening.score,
      screening.maxScore,
      actor,
    );
    await this.outbox.publish([event]);

    return { screeningId: screening.id.value };
  }
}

@CommandHandler(OverrideScreeningCommand)
export class OverrideScreeningHandler implements ICommandHandler<OverrideScreeningCommand, void> {
  constructor(@Inject(SCREENING_RESULT_REPOSITORY) private readonly screenings: ScreeningResultRepository) {}

  async execute(command: OverrideScreeningCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;
    const screening = await this.screenings.findByCaseId(tenantId, command.caseId);
    if (!screening) throw new Error('Screening result not found');
    screening.override(command.dto.decision as ScreeningResult['decision'], actor, command.dto.reason);
    await this.screenings.save(screening);
  }
}

@CommandHandler(RunQualificationCommand)
export class RunQualificationHandler implements ICommandHandler<RunQualificationCommand, { qualificationId: string }> {
  constructor(
    @Inject(QUALIFICATION_RESULT_REPOSITORY) private readonly qualifications: QualificationResultRepository,
    @Inject(ORIGINATION_CASE_REPOSITORY) private readonly cases: OriginationCaseRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: RunQualificationCommand): Promise<{ qualificationId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;
    const dto = command.dto;

    const qualification = QualificationResult.create({
      tenantId,
      caseId: command.caseId,
      decision: dto.decision as QualificationResult['decision'],
      score: {
        identityComplete: dto.score.identityComplete,
        ownershipComplete: dto.score.ownershipComplete,
        legalComplete: dto.score.legalComplete,
        evidenceComplete: dto.score.evidenceComplete,
        complianceComplete: dto.score.complianceComplete,
        ddComplete: dto.score.ddComplete,
        valuationComplete: dto.score.valuationComplete,
        transferabilityComplete: dto.score.transferabilityComplete,
        dataQualityScore: dto.score.dataQualityScore,
        riskScore: dto.score.riskScore,
        overallScore: dto.score.overallScore,
      },
      blockers: (dto.blockers ?? []).map((b) => ({
        category: b.category,
        description: b.description,
        severity: b.severity as QualificationResult['blockers'][number]['severity'],
        resolution: b.resolution ?? null,
      })),
      missingEvidence: dto.missingEvidence ?? [],
      explanation: dto.explanation ?? null,
      qualifiedBy: actor,
    });

    await this.qualifications.save(qualification);

    const caseAgg = await this.cases.findById(tenantId, OriginationCaseId.create(command.caseId));
    if (caseAgg) {
      if (qualification.decision === 'QUALIFIED' || qualification.decision === 'CONDITIONAL') {
        caseAgg.startDueDiligence(actor);
      } else {
        caseAgg.reject('Failed qualification', actor);
      }
      await this.cases.save(caseAgg);
      await this.outbox.publish(caseAgg.pullEvents());
    }

    const event = new QualificationCompleted(
      command.caseId,
      tenantId.value,
      qualification.id.value,
      qualification.decision,
      qualification.score.overallScore,
      actor,
    );
    await this.outbox.publish([event]);

    return { qualificationId: qualification.id.value };
  }
}
