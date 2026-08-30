import { TenantId, WaterfallId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { DistributionWaterfall, WaterfallTierEntry, WaterfallCalculationTrace } from '../../domain/aggregates/distribution-waterfall.aggregate';
import { DistributionWaterfallRepository } from '../../domain/repositories/distribution-waterfall.repository';
import { DistributionWaterfallOrmEntity } from './entities/distribution-waterfall.orm-entity';

@Injectable()
export class PostgresDistributionWaterfallRepository implements DistributionWaterfallRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(wf: DistributionWaterfall): Promise<void> {
    const e = new DistributionWaterfallOrmEntity();
    e.id = wf.id.value;
    e.dealId = wf.dealId;
    e.tenantId = wf.tenantId.value;
    e.tiers = wf.tiers;
    e.lastTrace = wf.lastTrace;
    e.immutable = wf.immutable;
    e.version = wf.version;
    e.updatedAt = new Date();

    await this.ds.transaction(async (mgr) => {
      await mgr.query(`SET LOCAL app.tenant_id = '${wf.tenantId.value}'`);
      await mgr
        .getRepository(DistributionWaterfallOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(DistributionWaterfallOrmEntity)
        .values(e)
        .orUpdate(['tiers', 'last_trace', 'immutable', 'version', 'updated_at'], ['id'])
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: WaterfallId): Promise<DistributionWaterfall | null> {
    const e = await this.ds.transaction(async (mgr) => {
      await mgr.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return mgr
        .getRepository(DistributionWaterfallOrmEntity)
        .findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    if (!e) return null;
    return DistributionWaterfall.reconstruct({
      id: WaterfallId.create(e.id),
      dealId: e.dealId,
      tenantId: TenantId.create(e.tenantId),
      tiers: e.tiers as unknown as WaterfallTierEntry[],
      lastTrace: e.lastTrace as unknown as WaterfallCalculationTrace | null,
      immutable: e.immutable,
      version: e.version,
    });
  }

  async findByDealId(tenantId: TenantId, dealId: string): Promise<DistributionWaterfall | null> {
    const e = await this.ds.transaction(async (mgr) => {
      await mgr.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return mgr
        .getRepository(DistributionWaterfallOrmEntity)
        .findOne({ where: { tenantId: tenantId.value, dealId } });
    });
    if (!e) return null;
    return DistributionWaterfall.reconstruct({
      id: WaterfallId.create(e.id),
      dealId: e.dealId,
      tenantId: TenantId.create(e.tenantId),
      tiers: e.tiers as unknown as WaterfallTierEntry[],
      lastTrace: e.lastTrace as unknown as WaterfallCalculationTrace | null,
      immutable: e.immutable,
      version: e.version,
    });
  }
}
