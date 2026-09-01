import { TenantId, ValuationCurrency, ValuationId, ValuationMethodology, ValuationStatus } from '@daos/shared-kernel';

import { Valuation } from '../../../domain/entities/valuation.entity';
import { ValuationOrmEntity } from '../entities/valuation.orm-entity';

export class ValuationMapper {
  static toOrm(valuation: Valuation): ValuationOrmEntity {
    const orm = new ValuationOrmEntity();
    orm.id = valuation.id.value;
    orm.tenantId = valuation.tenantId.value;
    orm.caseId = valuation.caseId;
    orm.status = valuation.status;
    orm.currentMarketValue = valuation.currentMarketValue;
    orm.fairValue = valuation.fairValue;
    orm.bookValue = valuation.bookValue;
    orm.nav = valuation.nav;
    orm.faceValue = valuation.faceValue;
    orm.outstandingPrincipal = valuation.outstandingPrincipal;
    orm.indicativeAcquisitionValue = valuation.indicativeAcquisitionValue;
    orm.purchasePrice = valuation.purchasePrice;
    orm.valuationDate = valuation.valuationDate;
    orm.valuationSource = valuation.valuationSource;
    orm.valuer = valuation.valuer;
    orm.methodology = valuation.methodology;
    orm.confidence = valuation.confidence;
    orm.currency = valuation.currency;
    orm.reviewer = valuation.reviewer;
    orm.reviewedAt = valuation.reviewedAt;
    orm.approvalReason = valuation.approvalReason;
    orm.rejectionReason = valuation.rejectionReason;
    orm.requestedAt = valuation.requestedAt;
    orm.assignedAt = valuation.assignedAt;
    orm.uploadedAt = valuation.uploadedAt;
    orm.approvedAt = valuation.approvedAt;
    orm.rejectedAt = valuation.rejectedAt;
    orm.updatedAt = new Date();
    return orm;
  }

  static toDomain(orm: ValuationOrmEntity): Valuation {
    return Valuation.reconstruct({
      id: ValuationId.create(orm.id),
      tenantId: TenantId.create(orm.tenantId),
      caseId: orm.caseId,
      status: orm.status as ValuationStatus,
      currentMarketValue: orm.currentMarketValue,
      fairValue: orm.fairValue,
      bookValue: orm.bookValue,
      nav: orm.nav,
      faceValue: orm.faceValue,
      outstandingPrincipal: orm.outstandingPrincipal,
      indicativeAcquisitionValue: orm.indicativeAcquisitionValue,
      purchasePrice: orm.purchasePrice,
      valuationDate: orm.valuationDate,
      valuationSource: orm.valuationSource,
      valuer: orm.valuer,
      methodology: orm.methodology as ValuationMethodology | null,
      confidence: orm.confidence,
      currency: orm.currency as ValuationCurrency,
      reviewer: orm.reviewer,
      reviewedAt: orm.reviewedAt,
      approvalReason: orm.approvalReason,
      rejectionReason: orm.rejectionReason,
      requestedAt: orm.requestedAt,
      assignedAt: orm.assignedAt,
      uploadedAt: orm.uploadedAt,
      approvedAt: orm.approvedAt,
      rejectedAt: orm.rejectedAt,
    });
  }
}