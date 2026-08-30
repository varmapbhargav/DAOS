import { DealId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Deal } from '../../domain/aggregates/deal.aggregate';
import { DealRepository } from '../../domain/repositories/deal.repository';
import { DealOrmEntity } from './entities/deal.orm-entity';
import { DealMapper } from './mappers/deal.mapper';

const UPSERT_COLS = [
  'name', 'asset_id', 'sponsor_id', 'status', 'metadata',
  'capital_stack', 'economic_rights', 'governance_terms',
  'closing_conditions', 'economics',
  'approved_by', 'approved_at',
  'rejected_by', 'rejected_at', 'rejection_reason',
  'closed_at', 'hold_reason', 'previous_status_before_hold',
  'idempotency_key', 'correlation_id',
  'asset_references', 'entity_references', 'opportunity_reference', 'documents',
  'version', 'updated_at',
];

@Injectable()
export class PostgresDealRepository implements DealRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(deal: Deal): Promise<void> {
    const orm = DealMapper.toOrm(deal);
    orm.updatedAt = new Date();
    await this.ds.transaction(async (mgr) => {
      await mgr.query(`SET LOCAL app.tenant_id = '${deal.tenantId.value}'`);
      await mgr
        .getRepository(DealOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(DealOrmEntity)
        .values(orm)
        .orUpdate(UPSERT_COLS, ['id'])
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: DealId): Promise<Deal | null> {
    const e = await this.ds.transaction(async (mgr) => {
      await mgr.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return mgr
        .getRepository(DealOrmEntity)
        .findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? DealMapper.toDomain(e) : null;
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
    const entities = await this.ds.transaction(async (mgr) => {
      await mgr.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      const qb = mgr
        .getRepository(DealOrmEntity)
        .createQueryBuilder('d')
        .where('d.tenant_id = :tid', { tid: tenantId.value });

      if (filter?.name) {
        qb.andWhere('d.name ILIKE :name', { name: `%${filter.name}%` });
      }
      if (filter?.status) {
        qb.andWhere('d.status = :status', { status: filter.status });
      }
      if (filter?.assetId) {
        qb.andWhere('d.asset_id = :assetId', { assetId: filter.assetId });
      }
      if (filter?.sponsorId) {
        qb.andWhere('d.sponsor_id = :sponsorId', { sponsorId: filter.sponsorId });
      }
      if (filter?.dealType) {
        qb.andWhere(`d.metadata->>'dealType' = :dealType`, { dealType: filter.dealType });
      }
      if (filter?.assetClass) {
        qb.andWhere(`d.metadata->>'assetClass' = :assetClass`, { assetClass: filter.assetClass });
      }
      if (filter?.jurisdiction) {
        qb.andWhere(`d.metadata->>'jurisdiction' = :jurisdiction`, { jurisdiction: filter.jurisdiction });
      }
      if (filter?.currency) {
        qb.andWhere(`d.metadata->>'currency' = :currency`, { currency: filter.currency });
      }
      if (filter?.ownerId) {
        qb.andWhere(`d.metadata->>'dealOwnerId' = :ownerId`, { ownerId: filter.ownerId });
      }
      if (filter?.createdAt) {
        const { gte, lte } = filter.createdAt;
        if (gte) qb.andWhere('d.created_at >= :gte', { gte });
        if (lte) qb.andWhere('d.created_at <= :lte', { lte });
      }

      return qb.orderBy('d.created_at', 'DESC').getMany();
    });
    return entities.map(DealMapper.toDomain);
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
    const entities = await this.ds.transaction(async (mgr) => {
      await mgr.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      const qb = mgr
        .getRepository(DealOrmEntity)
        .createQueryBuilder('d')
        .where('d.tenant_id = :tid', { tid: tenantId.value });

      if (filters.name) {
        qb.andWhere('d.name ILIKE :name', { name: `%${filters.name}%` });
      }
      if (filters.status) {
        qb.andWhere('d.status = :status', { status: filters.status });
      }
      if (filters.dealType) {
        qb.andWhere(`d.metadata->>'dealType' = :dealType`, { dealType: filters.dealType });
      }
      if (filters.assetClass) {
        qb.andWhere(`d.metadata->>'assetClass' = :assetClass`, { assetClass: filters.assetClass });
      }
      if (filters.jurisdiction) {
        qb.andWhere(`d.metadata->>'jurisdiction' = :jurisdiction`, { jurisdiction: filters.jurisdiction });
      }
      if (filters.currency) {
        qb.andWhere(`d.metadata->>'currency' = :currency`, { currency: filters.currency });
      }
      if (filters.ownerId) {
        qb.andWhere(`d.metadata->>'dealOwnerId' = :ownerId`, { ownerId: filters.ownerId });
      }
      if (filters.tag) {
        qb.andWhere(`d.metadata->'tags' ? :tag`, { tag: filters.tag });
      }
      if (filters.fromDate) {
        qb.andWhere('d.created_at >= :fromDate', { fromDate: filters.fromDate });
      }
      if (filters.toDate) {
        qb.andWhere('d.created_at <= :toDate', { toDate: filters.toDate });
      }

      const total = await qb.getCount();
      const rows = await qb
        .orderBy('d.created_at', 'DESC')
        .limit(filters.limit ?? 50)
        .offset(filters.offset ?? 0)
        .getMany();

      return { rows, total };
    });

    return {
      deals: entities.rows.map(DealMapper.toDomain),
      total: entities.total,
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
}
