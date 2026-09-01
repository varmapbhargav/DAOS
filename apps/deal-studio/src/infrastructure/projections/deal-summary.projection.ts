import { Injectable } from '@nestjs/common';
import { BaseProjectionHandler, DomainEvent } from '@daos/shared-kernel';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { DealApproved } from '../../domain/events/deal-approved.event';
import { DealCreated } from '../../domain/events/deal-created.event';
import { DealSummaryReadModel } from '../persistence/entities/deal-summary-read-model.entity';

@Injectable()
export class DealSummaryProjection extends BaseProjectionHandler {
  constructor(@InjectDataSource() private readonly ds: DataSource) {
    super();
  }

  protected async project(event: DomainEvent): Promise<void> {
    switch (event.eventType) {
      case 'deal.created.v1':
        await this.onDealCreated(event as DealCreated);
        break;
      case 'deal.structuring.started.v1':
        await this.onStatusChanged(event, 'STRUCTURING');
        break;
      case 'deal.submitted-for-legal-review.v1':
        await this.onStatusChanged(event, 'LEGAL_REVIEW');
        break;
      case 'deal.submitted-for-approval.v1':
        await this.onStatusChanged(event, 'READY_FOR_APPROVAL');
        break;
      case 'deal.approved.v1':
        await this.onDealApproved(event as DealApproved);
        break;
      case 'deal.rejected.v1':
        await this.onStatusChanged(event, 'REJECTED');
        break;
      case 'deal.ready-for-closing.v1':
        await this.onStatusChanged(event, 'READY_TO_CLOSE');
        break;
      case 'deal.closing.started.v1':
        await this.onStatusChanged(event, 'CLOSING');
        break;
      case 'deal.closed.v1':
        await this.onStatusChanged(event, 'CLOSED');
        break;
      case 'deal.on-hold.v1':
        await this.onStatusChanged(event, 'ON_HOLD');
        break;
      case 'deal.resumed.v1':
        await this.onResume(event);
        break;
      case 'deal.cancelled.v1':
        await this.onStatusChanged(event, 'CANCELLED');
        break;
      case 'deal.expired.v1':
        await this.onStatusChanged(event, 'EXPIRED');
        break;
    }
  }

  private async onDealCreated(event: DealCreated): Promise<void> {
    const repo = this.ds.getRepository(DealSummaryReadModel);
    const entity = new DealSummaryReadModel();
    entity.id = event.aggregateId;
    entity.tenantId = event.tenantId ?? '';
    entity.name = event.name;
    entity.status = 'DRAFT';
    entity.assetId = event.assetId;
    entity.sponsorId = event.sponsorId;
    entity.metadata = null;
    entity.capitalStack = null;
    entity.approvedBy = null;
    entity.closedAt = null;
    entity.participantCount = 0;
    entity.documentCount = 0;
    entity.version = 1;
    await repo.save(entity);
  }

  private async onStatusChanged(event: DomainEvent, newStatus: string): Promise<void> {
    const repo = this.ds.getRepository(DealSummaryReadModel);
    const entity = await repo.findOne({ where: { id: event.aggregateId, tenantId: event.tenantId ?? '' } });
    if (!entity) return;
    entity.status = newStatus;
    if (newStatus === 'CLOSED') {
      entity.closedAt = event.occurredAt;
    }
    entity.version += 1;
    await repo.save(entity);
  }

  private async onDealApproved(event: DealApproved): Promise<void> {
    const repo = this.ds.getRepository(DealSummaryReadModel);
    const entity = await repo.findOne({ where: { id: event.aggregateId, tenantId: event.tenantId ?? '' } });
    if (!entity) return;
    entity.status = 'APPROVED';
    entity.approvedBy = event.actorId;
    entity.version += 1;
    await repo.save(entity);
  }

  private async onResume(event: DomainEvent): Promise<void> {
    const repo = this.ds.getRepository(DealSummaryReadModel);
    const entity = await repo.findOne({ where: { id: event.aggregateId, tenantId: event.tenantId ?? '' } });
    if (!entity) return;
    entity.status = 'STRUCTURING';
    entity.version += 1;
    await repo.save(entity);
  }
}