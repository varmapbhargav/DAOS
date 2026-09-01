import { DealId, EventSourcedRepository, EventStore, SnapshotStore, TenantId } from '@daos/shared-kernel';
import { Inject, Injectable } from '@nestjs/common';

import { Deal } from '../../domain/aggregates/deal.aggregate';
import { DealRepository } from '../../domain/repositories/deal.repository';
import { EVENT_STORE, SNAPSHOT_STORE } from '../../domain/repositories/repository.tokens';
import { DealOrmEntity } from './entities/deal.orm-entity';
import { DealMapper } from './mappers/deal.mapper';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class EventSourcedDealRepository
  extends EventSourcedRepository<Deal>
  implements DealRepository
{
  constructor(
    @Inject(EVENT_STORE) eventStore: EventStore,
    @Inject(SNAPSHOT_STORE) snapshotStore: SnapshotStore,
    @InjectDataSource() private readonly ds: DataSource,
  ) {
    super(eventStore, snapshotStore);
  }

  async save(deal: Deal): Promise<void> {
    await super.save(deal);
  }

  async findById(tenantId: TenantId, id: DealId): Promise<Deal | null> {
    return this.load(id.value, tenantId.value);
  }

  async findAll(tenantId: TenantId, filter?: {
    name?: string;
    status?: string;
    assetId?: string;
    sponsorId?: string;
    dealType?: string;
    assetClass?: string;
    jurisdiction?: string;
    currency?: string;
    ownerId?: string;
    createdAt?: { gte?: string; lte?: string };
  }): Promise<Deal[]> {
    const rows = await this.ds.transaction(async (mgr) => {
      await mgr.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      const qb = mgr
        .getRepository(DealOrmEntity)
        .createQueryBuilder('d')
        .where('d.tenant_id = :tid', { tid: tenantId.value });

      if (filter?.name) qb.andWhere('d.name ILIKE :name', { name: `%${filter.name}%` });
      if (filter?.status) qb.andWhere('d.status = :status', { status: filter.status });
      if (filter?.assetId) qb.andWhere('d.asset_id = :assetId', { assetId: filter.assetId });
      if (filter?.sponsorId) qb.andWhere('d.sponsor_id = :sponsorId', { sponsorId: filter.sponsorId });
      if (filter?.dealType) qb.andWhere(`d.metadata->>'dealType' = :dealType`, { dealType: filter.dealType });
      if (filter?.assetClass) qb.andWhere(`d.metadata->>'assetClass' = :assetClass`, { assetClass: filter.assetClass });
      if (filter?.jurisdiction) qb.andWhere(`d.metadata->>'jurisdiction' = :jurisdiction`, { jurisdiction: filter.jurisdiction });
      if (filter?.currency) qb.andWhere(`d.metadata->>'currency' = :currency`, { currency: filter.currency });
      if (filter?.ownerId) qb.andWhere(`d.metadata->>'dealOwnerId' = :ownerId`, { ownerId: filter.ownerId });
      if (filter?.createdAt) {
        if (filter.createdAt.gte) qb.andWhere('d.created_at >= :gte', { gte: filter.createdAt.gte });
        if (filter.createdAt.lte) qb.andWhere('d.created_at <= :lte', { lte: filter.createdAt.lte });
      }

      return qb.orderBy('d.created_at', 'DESC').getMany();
    });
    return rows.map(DealMapper.toDomain);
  }

  async search(tenantId: TenantId, filters: {
    name?: string;
    dealType?: string;
    status?: string;
    assetClass?: string;
    jurisdiction?: string;
    currency?: string;
    ownerId?: string;
    tag?: string;
    fromDate?: string;
    toDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ deals: Deal[]; total: number }> {
    const result = await this.ds.transaction(async (mgr) => {
      await mgr.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      const qb = mgr
        .getRepository(DealOrmEntity)
        .createQueryBuilder('d')
        .where('d.tenant_id = :tid', { tid: tenantId.value });

      if (filters.name) qb.andWhere('d.name ILIKE :name', { name: `%${filters.name}%` });
      if (filters.status) qb.andWhere('d.status = :status', { status: filters.status });
      if (filters.dealType) qb.andWhere(`d.metadata->>'dealType' = :dealType`, { dealType: filters.dealType });
      if (filters.assetClass) qb.andWhere(`d.metadata->>'assetClass' = :assetClass`, { assetClass: filters.assetClass });
      if (filters.jurisdiction) qb.andWhere(`d.metadata->>'jurisdiction' = :jurisdiction`, { jurisdiction: filters.jurisdiction });
      if (filters.currency) qb.andWhere(`d.metadata->>'currency' = :currency`, { currency: filters.currency });
      if (filters.ownerId) qb.andWhere(`d.metadata->>'dealOwnerId' = :ownerId`, { ownerId: filters.ownerId });
      if (filters.tag) qb.andWhere(`d.metadata->'tags' ? :tag`, { tag: filters.tag });
      if (filters.fromDate) qb.andWhere('d.created_at >= :fromDate', { fromDate: filters.fromDate });
      if (filters.toDate) qb.andWhere('d.created_at <= :toDate', { toDate: filters.toDate });

      const total = await qb.getCount();
      const rows = await qb
        .orderBy('d.created_at', 'DESC')
        .limit(filters.limit ?? 50)
        .offset(filters.offset ?? 0)
        .getMany();

      return { rows, total };
    });

    return {
      deals: result.rows.map(DealMapper.toDomain),
      total: result.total,
    };
  }

  async countByStatus(tenantId: TenantId): Promise<Record<string, number>> {
    const rows = await this.ds.transaction(async (mgr) => {
      await mgr.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return mgr
        .getRepository(DealOrmEntity)
        .createQueryBuilder('d')
        .select('d.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .where('d.tenant_id = :tid', { tid: tenantId.value })
        .groupBy('d.status')
        .getRawMany<{ status: string; count: string }>();
    });
    return Object.fromEntries(rows.map((r) => [r.status, parseInt(r.count, 10)]));
  }

  protected extractAggregateId(aggregate: Deal): string {
    return aggregate.id.value;
  }

  protected extractTenantId(aggregate: Deal): string {
    return aggregate.tenantId.value;
  }

  protected aggregateName(): string {
    return 'Deal';
  }

  protected createEmpty(): Deal {
    return Deal.reconstruct({
      id: DealId.create(),
      tenantId: TenantId.create(),
      name: '',
      assetId: '',
      sponsorId: '',
      status: 'DRAFT',
      metadata: null,
      capitalStack: null,
      economicRights: null,
      governanceTerms: null,
      closingConditions: [],
      economics: null,
      approvedBy: null,
      approvedAt: null,
      rejectedBy: null,
      rejectedAt: null,
      rejectionReason: null,
      closedAt: null,
      holdReason: null,
      previousStatusBeforeHold: null,
      idempotencyKey: null,
      correlationId: null,
      statusHistory: [],
      participants: [],
      documents: [],
      assetReferences: [],
      entityReferences: [],
      opportunityReference: null,
      version: 0,
    });
  }

  protected serializeAggregate(aggregate: Deal): Record<string, unknown> {
    return {
      id: aggregate.id.value,
      tenantId: aggregate.tenantId.value,
      name: aggregate.name,
      assetId: aggregate.assetId,
      sponsorId: aggregate.sponsorId,
      status: aggregate.status,
      metadata: aggregate.metadata,
      capitalStack: aggregate.capitalStack,
      economicRights: aggregate.economicRights,
      governanceTerms: aggregate.governanceTerms,
      closingConditions: aggregate.closingConditions,
      economics: aggregate.economics,
      approvedBy: aggregate.approvedBy,
      approvedAt: aggregate.approvedAt,
      rejectedBy: aggregate.rejectedBy,
      rejectedAt: aggregate.rejectedAt,
      rejectionReason: aggregate.rejectionReason,
      closedAt: aggregate.closedAt,
      holdReason: aggregate.holdReason,
      previousStatusBeforeHold: aggregate.previousStatusBeforeHold,
      idempotencyKey: aggregate.idempotencyKey,
      correlationId: aggregate.correlationId,
      documents: aggregate.documents,
      assetReferences: aggregate.assetReferences,
      entityReferences: aggregate.entityReferences,
      opportunityReference: aggregate.opportunityReference,
    };
  }

  protected hydrateFromSnapshot(state: Record<string, unknown>): Deal {
    return Deal.reconstruct({
      id: DealId.create(state['id'] as string),
      tenantId: TenantId.create(state['tenantId'] as string),
      name: state['name'] as string,
      assetId: state['assetId'] as string,
      sponsorId: state['sponsorId'] as string,
      status: state['status'] as any,
      metadata: state['metadata'] as any,
      capitalStack: state['capitalStack'] as any,
      economicRights: state['economicRights'] as any,
      governanceTerms: state['governanceTerms'] as any,
      closingConditions: (state['closingConditions'] as any[]) ?? [],
      economics: state['economics'] as any,
      approvedBy: state['approvedBy'] as string | null,
      approvedAt: state['approvedAt'] as string | null,
      rejectedBy: state['rejectedBy'] as string | null,
      rejectedAt: state['rejectedAt'] as string | null,
      rejectionReason: state['rejectionReason'] as string | null,
      closedAt: state['closedAt'] as string | null,
      holdReason: state['holdReason'] as string | null,
      previousStatusBeforeHold: state['previousStatusBeforeHold'] as any,
      idempotencyKey: state['idempotencyKey'] as string | null,
      correlationId: state['correlationId'] as string | null,
      statusHistory: [],
      participants: [],
      documents: (state['documents'] as any[]) ?? [],
      assetReferences: (state['assetReferences'] as any[]) ?? [],
      entityReferences: (state['entityReferences'] as any[]) ?? [],
      opportunityReference: state['opportunityReference'] as any,
      version: 0,
    });
  }
}
