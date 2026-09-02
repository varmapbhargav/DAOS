import { OriginationCaseId, OutboxPublisher, TenantContextHolder, TenantId, ValuationCurrency, ValuationMethodology } from '@daos/shared-kernel';
import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  ORIGINATION_CASE_REPOSITORY,
  OUTBOX_PUBLISHER,
  VALUATION_REPOSITORY,
} from '../../../domain/repositories/repository.tokens';
import { OriginationCaseRepository } from '../../../origination-case/domain/repositories/origination-case.repository';
import { Valuation } from '../../domain/entities/valuation.entity';
import { ValuationApproved } from '../../domain/events/valuation-events';
import { ValuationRejected } from '../../domain/events/valuation-events';
import { ValuationRequested } from '../../domain/events/valuation-events';
import { ValuationUploaded } from '../../domain/events/valuation-events';
import { ValuationRepository } from '../../domain/repositories/valuation.repository';
import {
  AssignValuerDto,
  RequestValuationDto,
  RevalueDto,
  ReviewValuationDto,
  UploadValuationDto,
} from '../dto/valuation.dto';

export class RequestValuationCommand {
  constructor(public readonly caseId: string, public readonly dto: RequestValuationDto) {}
}

export class AssignValuerCommand {
  constructor(public readonly caseId: string, public readonly dto: AssignValuerDto) {}
}

export class UploadValuationCommand {
  constructor(public readonly caseId: string, public readonly dto: UploadValuationDto) {}
}

export class SubmitValuationForReviewCommand {
  constructor(public readonly caseId: string) {}
}

export class ApproveValuationCommand {
  constructor(public readonly caseId: string, public readonly dto: ReviewValuationDto) {}
}

export class RejectValuationCommand {
  constructor(public readonly caseId: string, public readonly dto: ReviewValuationDto) {}
}

export class RevalueCommand {
  constructor(public readonly caseId: string, public readonly dto: RevalueDto) {}
}

@CommandHandler(RequestValuationCommand)
export class RequestValuationHandler implements ICommandHandler<RequestValuationCommand, { valuationId: string }> {
  constructor(
    @Inject(VALUATION_REPOSITORY) private readonly valuations: ValuationRepository,
    @Inject(ORIGINATION_CASE_REPOSITORY) private readonly cases: OriginationCaseRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: RequestValuationCommand): Promise<{ valuationId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;

    const existing = await this.valuations.findByCaseId(tenantId, command.caseId);
    if (existing && existing.status !== 'REJECTED') {
      throw new Error('Valuation already exists for this case');
    }

    const valuation = Valuation.create({
      tenantId,
      caseId: command.caseId,
      currency: (command.dto.currency as Valuation['currency']) ?? 'USD',
      valuer: command.dto.valuer ?? null,
    });
    await this.valuations.save(valuation);

    const caseAgg = await this.cases.findById(tenantId, OriginationCaseId.create(command.caseId));
    if (caseAgg) {
      caseAgg.startValuation(actor);
      await this.cases.save(caseAgg);
      await this.outbox.publish(caseAgg.pullEvents());
    }

    const event = new ValuationRequested(command.caseId, tenantId.value, valuation.id.value, actor);
    await this.outbox.publish([event]);

    return { valuationId: valuation.id.value };
  }
}

@CommandHandler(AssignValuerCommand)
export class AssignValuerHandler implements ICommandHandler<AssignValuerCommand, void> {
  constructor(@Inject(VALUATION_REPOSITORY) private readonly valuations: ValuationRepository) {}

  async execute(command: AssignValuerCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const valuation = await this.valuations.findByCaseId(tenantId, command.caseId);
    if (!valuation) throw new NotFoundException('Valuation not found');
    valuation.assign(command.dto.valuer);
    await this.valuations.save(valuation);
  }
}

@CommandHandler(UploadValuationCommand)
export class UploadValuationHandler implements ICommandHandler<UploadValuationCommand, void> {
  constructor(
    @Inject(VALUATION_REPOSITORY) private readonly valuations: ValuationRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: UploadValuationCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;

    const valuation = await this.valuations.findByCaseId(tenantId, command.caseId);
    if (!valuation) throw new NotFoundException('Valuation not found');

    valuation.upload({
      currentMarketValue: command.dto.currentMarketValue ?? null,
      fairValue: command.dto.fairValue ?? null,
      bookValue: command.dto.bookValue ?? null,
      nav: command.dto.nav ?? null,
      faceValue: command.dto.faceValue ?? null,
      outstandingPrincipal: command.dto.outstandingPrincipal ?? null,
      indicativeAcquisitionValue: command.dto.indicativeAcquisitionValue ?? null,
      purchasePrice: command.dto.purchasePrice ?? null,
      valuationDate: command.dto.valuationDate ?? null,
      valuationSource: command.dto.valuationSource ?? null,
      methodology: (command.dto.methodology as Valuation['methodology']) ?? null,
      confidence: command.dto.confidence ?? null,
      currency: (command.dto.currency as ValuationCurrency) ?? valuation.currency,
    });
    await this.valuations.save(valuation);

    const event = new ValuationUploaded(
      command.caseId,
      tenantId.value,
      valuation.id.value,
      valuation.currentMarketValue,
      valuation.fairValue,
      valuation.currency,
      valuation.valuer ?? actor,
      (valuation.methodology ?? 'OTHER') as ValuationMethodology,
      actor,
    );
    await this.outbox.publish([event]);
  }
}

@CommandHandler(SubmitValuationForReviewCommand)
export class SubmitValuationForReviewHandler implements ICommandHandler<SubmitValuationForReviewCommand, void> {
  constructor(@Inject(VALUATION_REPOSITORY) private readonly valuations: ValuationRepository) {}

  async execute(command: SubmitValuationForReviewCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const valuation = await this.valuations.findByCaseId(tenantId, command.caseId);
    if (!valuation) throw new NotFoundException('Valuation not found');
    valuation.submitForReview();
    await this.valuations.save(valuation);
  }
}

@CommandHandler(ApproveValuationCommand)
export class ApproveValuationHandler implements ICommandHandler<ApproveValuationCommand, void> {
  constructor(
    @Inject(VALUATION_REPOSITORY) private readonly valuations: ValuationRepository,
    @Inject(ORIGINATION_CASE_REPOSITORY) private readonly cases: OriginationCaseRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: ApproveValuationCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;

    const valuation = await this.valuations.findByCaseId(tenantId, command.caseId);
    if (!valuation) throw new NotFoundException('Valuation not found');
    valuation.approve(actor, command.dto.approvalReason ?? null);
    await this.valuations.save(valuation);

    const caseAgg = await this.cases.findById(tenantId, OriginationCaseId.create(command.caseId));
    if (caseAgg) {
      caseAgg.startRiskReview(actor);
      await this.cases.save(caseAgg);
      await this.outbox.publish(caseAgg.pullEvents());
    }

    const event = new ValuationApproved(command.caseId, tenantId.value, valuation.id.value, actor);
    await this.outbox.publish([event]);
  }
}

@CommandHandler(RejectValuationCommand)
export class RejectValuationHandler implements ICommandHandler<RejectValuationCommand, void> {
  constructor(
    @Inject(VALUATION_REPOSITORY) private readonly valuations: ValuationRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: RejectValuationCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;

    const valuation = await this.valuations.findByCaseId(tenantId, command.caseId);
    if (!valuation) throw new NotFoundException('Valuation not found');
    valuation.reject(actor, command.dto.rejectionReason ?? 'Valuation rejected');
    await this.valuations.save(valuation);

    const event = new ValuationRejected(command.caseId, tenantId.value, valuation.id.value, actor, command.dto.rejectionReason ?? 'Valuation rejected');
    await this.outbox.publish([event]);
  }
}

@CommandHandler(RevalueCommand)
export class RevalueHandler implements ICommandHandler<RevalueCommand, void> {
  constructor(
    @Inject(VALUATION_REPOSITORY) private readonly valuations: ValuationRepository,
    @Inject(ORIGINATION_CASE_REPOSITORY) private readonly cases: OriginationCaseRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: RevalueCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;

    const valuation = await this.valuations.findByCaseId(tenantId, command.caseId);
    if (!valuation) throw new NotFoundException('Valuation not found');
    valuation.revalue();
    if (command.dto.valuer) {
      valuation.assign(command.dto.valuer);
    }
    await this.valuations.save(valuation);

    const caseAgg = await this.cases.findById(tenantId, OriginationCaseId.create(command.caseId));
    if (caseAgg) {
      caseAgg.startValuation(actor);
      await this.cases.save(caseAgg);
      await this.outbox.publish(caseAgg.pullEvents());
    }

    const event = new ValuationRequested(command.caseId, tenantId.value, valuation.id.value, actor);
    await this.outbox.publish([event]);
  }
}