import {
  OriginationCaseId,
  OutboxPublisher,
  RiskItemId,
  TenantContextHolder,
  TenantId,
} from '@daos/shared-kernel';
import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  ASSET_RISK_ASSESSMENT_REPOSITORY,
  ORIGINATION_CASE_REPOSITORY,
  OUTBOX_PUBLISHER,
  RISK_ITEM_REPOSITORY,
} from '../../../domain/repositories/repository.tokens';
import { OriginationCaseRepository } from '../../../origination-case/domain/repositories/origination-case.repository';
import { AssetRiskAssessment } from '../../domain/entities/asset-risk-assessment.entity';
import { RiskItem } from '../../domain/entities/risk-item.entity';
import { RiskAssessmentCompleted } from '../../domain/events/risk-assessment-completed.event';
import { AssetRiskAssessmentRepository } from '../../domain/repositories/asset-risk-assessment.repository';
import { RiskItemRepository } from '../../domain/repositories/risk-item.repository';
import {
  AddRiskItemDto,
  CompleteRiskAssessmentDto,
  CreateRiskAssessmentDto,
  UpdateRiskItemDto,
} from '../dto/risk.dto';

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
  constructor(@Inject(RISK_ITEM_REPOSITORY) private readonly riskItems: RiskItemRepository) {}

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
