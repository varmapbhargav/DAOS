import {
  DdFindingId,
  OriginationCaseId,
  OutboxPublisher,
  RiskItemId,
  TenantContextHolder,
  TenantId,
} from '@daos/shared-kernel';
import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { AssetRiskAssessment } from '../../domain/entities/asset-risk-assessment.entity';
import { DdFinding } from '../../domain/entities/dd-finding.entity';
import { DueDiligenceCase } from '../../domain/entities/due-diligence-case.entity';
import { RiskItem } from '../../domain/entities/risk-item.entity';
import { DDCompleted } from '../../domain/events/dd-completed.event';
import { DDFindingCreated } from '../../domain/events/dd-finding-created.event';
import { RiskAssessmentCompleted } from '../../domain/events/risk-assessment-completed.event';
import { AssetRiskAssessmentRepository } from '../../domain/repositories/asset-risk-assessment.repository';
import { DdFindingRepository } from '../../domain/repositories/dd-finding.repository';
import { DueDiligenceCaseRepository } from '../../domain/repositories/due-diligence-case.repository';
import { OriginationCaseRepository } from '../../domain/repositories/origination-case.repository';
import {
  ASSET_RISK_ASSESSMENT_REPOSITORY,
  DD_FINDING_REPOSITORY,
  DUE_DILIGENCE_CASE_REPOSITORY,
  ORIGINATION_CASE_REPOSITORY,
  OUTBOX_PUBLISHER,
  RISK_ITEM_REPOSITORY,
} from '../../domain/repositories/repository.tokens';
import { RiskItemRepository } from '../../domain/repositories/risk-item.repository';
import {
  AddDdFindingDto,
  AddRiskItemDto,
  CompleteDueDiligenceDto,
  CompleteRiskAssessmentDto,
  CreateRiskAssessmentDto,
  StartDueDiligenceDto,
  UpdateDdFindingDto,
  UpdateRiskItemDto,
} from '../dto/dd-risk.dto';

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

export class CreateRiskAssessmentCommand {
  constructor(public readonly caseId: string, public readonly dto: CreateRiskAssessmentDto) {}
}

export class AddRiskItemCommand {
  constructor(public readonly caseId: string, public readonly dto: AddRiskItemDto) {}
}

export class UpdateRiskItemCommand {
  constructor(public readonly riskItemId: string, public readonly dto: UpdateRiskItemDto) {}
}

export class CompleteRiskAssessmentCommand {
  constructor(public readonly caseId: string, public readonly dto: CompleteRiskAssessmentDto) {}
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
  constructor(
    @Inject(DD_FINDING_REPOSITORY) private readonly findings: DdFindingRepository,
  ) {}

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

    const event = new DDCompleted(
      command.caseId,
      tenantId.value,
      ddCase.id.value,
      actor,
      findings.length,
    );
    await this.outbox.publish([event]);
  }
}

@CommandHandler(CreateRiskAssessmentCommand)
export class CreateRiskAssessmentHandler implements ICommandHandler<CreateRiskAssessmentCommand, { assessmentId: string }> {
  constructor(
    @Inject(ASSET_RISK_ASSESSMENT_REPOSITORY) private readonly assessments: AssetRiskAssessmentRepository,
    @Inject(ORIGINATION_CASE_REPOSITORY) private readonly cases: OriginationCaseRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: CreateRiskAssessmentCommand): Promise<{ assessmentId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;

    const existing = await this.assessments.findByCaseId(tenantId, command.caseId);
    if (existing) throw new Error('Risk assessment already exists for this origination case');

    const assessment = AssetRiskAssessment.create({
      tenantId,
      caseId: command.caseId,
      overallScore: command.dto.overallScore,
      riskLevel: command.dto.riskLevel as AssetRiskAssessment['riskLevel'],
      assessedBy: actor,
      summary: command.dto.summary,
    });
    await this.assessments.save(assessment);

    const caseAgg = await this.cases.findById(tenantId, OriginationCaseId.create(command.caseId));
    if (caseAgg) {
      caseAgg.startRiskReview(actor);
      await this.cases.save(caseAgg);
      await this.outbox.publish(caseAgg.pullEvents());
    }

    return { assessmentId: assessment.id.value };
  }
}

@CommandHandler(AddRiskItemCommand)
export class AddRiskItemHandler implements ICommandHandler<AddRiskItemCommand, { riskItemId: string }> {
  constructor(
    @Inject(ASSET_RISK_ASSESSMENT_REPOSITORY) private readonly assessments: AssetRiskAssessmentRepository,
    @Inject(RISK_ITEM_REPOSITORY) private readonly riskItems: RiskItemRepository,
  ) {}

  async execute(command: AddRiskItemCommand): Promise<{ riskItemId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());

    const assessment = await this.assessments.findByCaseId(tenantId, command.caseId);
    if (!assessment) throw new NotFoundException('Risk assessment not found for this origination case');

    const item = RiskItem.create({
      tenantId,
      assessmentId: assessment.id.value,
      caseId: command.caseId,
      category: command.dto.category as RiskItem['category'],
      description: command.dto.description,
      probability: command.dto.probability as RiskItem['probability'],
      impact: command.dto.impact as RiskItem['impact'],
      score: command.dto.score,
      mitigation: command.dto.mitigation ?? null,
      owner: command.dto.owner ?? null,
      dueDate: command.dto.dueDate ?? null,
      evidence: command.dto.evidence,
    });
    await this.riskItems.save(item);

    return { riskItemId: item.id.value };
  }
}

@CommandHandler(UpdateRiskItemCommand)
export class UpdateRiskItemHandler implements ICommandHandler<UpdateRiskItemCommand, void> {
  constructor(
    @Inject(RISK_ITEM_REPOSITORY) private readonly riskItems: RiskItemRepository,
  ) {}

  async execute(command: UpdateRiskItemCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const item = await this.riskItems.findById(tenantId, RiskItemId.create(command.riskItemId));
    if (!item) throw new NotFoundException('Risk item not found');

    item.update({
      mitigation: command.dto.mitigation,
      owner: command.dto.owner,
      dueDate: command.dto.dueDate,
      status: command.dto.status as RiskItem['status'] | undefined,
    });
    await this.riskItems.save(item);
  }
}

@CommandHandler(CompleteRiskAssessmentCommand)
export class CompleteRiskAssessmentHandler implements ICommandHandler<CompleteRiskAssessmentCommand, void> {
  constructor(
    @Inject(ASSET_RISK_ASSESSMENT_REPOSITORY) private readonly assessments: AssetRiskAssessmentRepository,
    @Inject(ORIGINATION_CASE_REPOSITORY) private readonly cases: OriginationCaseRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: CompleteRiskAssessmentCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;

    const assessment = await this.assessments.findByCaseId(tenantId, command.caseId);
    if (!assessment) throw new NotFoundException('Risk assessment not found for this origination case');

    const caseAgg = await this.cases.findById(tenantId, OriginationCaseId.create(command.caseId));
    if (caseAgg) {
      caseAgg.readyForApproval(actor);
      await this.cases.save(caseAgg);
      await this.outbox.publish(caseAgg.pullEvents());
    }

    const event = new RiskAssessmentCompleted(
      command.caseId,
      tenantId.value,
      assessment.id.value,
      assessment.riskLevel,
      assessment.overallScore,
      actor,
    );
    await this.outbox.publish([event]);
  }
}