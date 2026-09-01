import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { VALUATION_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { ValuationRepository } from '../../domain/repositories/valuation.repository';

export class GetValuationByCaseQuery {
  constructor(public readonly caseId: string) {}
}

export class ListValuationsByCaseQuery {
  constructor(public readonly caseId: string) {}
}

@QueryHandler(GetValuationByCaseQuery)
export class GetValuationByCaseHandler implements IQueryHandler<GetValuationByCaseQuery> {
  constructor(@Inject(VALUATION_REPOSITORY) private readonly valuations: ValuationRepository) {}

  async execute(query: GetValuationByCaseQuery) {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const v = await this.valuations.findByCaseId(tenantId, query.caseId);
    if (!v) return null;
    return this.toDto(v);
  }

  private toDto(v: any) {
    return {
      id: v.id.value,
      caseId: v.caseId,
      status: v.status,
      currentMarketValue: v.currentMarketValue,
      fairValue: v.fairValue,
      bookValue: v.bookValue,
      nav: v.nav,
      faceValue: v.faceValue,
      outstandingPrincipal: v.outstandingPrincipal,
      indicativeAcquisitionValue: v.indicativeAcquisitionValue,
      purchasePrice: v.purchasePrice,
      valuationDate: v.valuationDate,
      valuationSource: v.valuationSource,
      valuer: v.valuer,
      methodology: v.methodology,
      confidence: v.confidence,
      currency: v.currency,
      reviewer: v.reviewer,
      reviewedAt: v.reviewedAt,
      approvalReason: v.approvalReason,
      rejectionReason: v.rejectionReason,
      requestedAt: v.requestedAt,
      assignedAt: v.assignedAt,
      uploadedAt: v.uploadedAt,
      approvedAt: v.approvedAt,
      rejectedAt: v.rejectedAt,
    };
  }
}

@QueryHandler(ListValuationsByCaseQuery)
export class ListValuationsByCaseHandler implements IQueryHandler<ListValuationsByCaseQuery> {
  constructor(@Inject(VALUATION_REPOSITORY) private readonly valuations: ValuationRepository) {}

  async execute(query: ListValuationsByCaseQuery) {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const rows = await this.valuations.findAllByCaseId(tenantId, query.caseId);
    return rows.map(this.toDto);
  }

  private toDto(v: any) {
    return {
      id: v.id.value,
      caseId: v.caseId,
      status: v.status,
      currentMarketValue: v.currentMarketValue,
      fairValue: v.fairValue,
      bookValue: v.bookValue,
      nav: v.nav,
      faceValue: v.faceValue,
      outstandingPrincipal: v.outstandingPrincipal,
      indicativeAcquisitionValue: v.indicativeAcquisitionValue,
      purchasePrice: v.purchasePrice,
      valuationDate: v.valuationDate,
      valuationSource: v.valuationSource,
      valuer: v.valuer,
      methodology: v.methodology,
      confidence: v.confidence,
      currency: v.currency,
      reviewer: v.reviewer,
      reviewedAt: v.reviewedAt,
      approvalReason: v.approvalReason,
      rejectionReason: v.rejectionReason,
      requestedAt: v.requestedAt,
      assignedAt: v.assignedAt,
      uploadedAt: v.uploadedAt,
      approvedAt: v.approvedAt,
      rejectedAt: v.rejectedAt,
    };
  }
}