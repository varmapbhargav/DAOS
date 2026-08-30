import { ScenarioId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Scenario } from '../../domain/entities/scenario.entity';
import { ScenarioRepository } from '../../domain/repositories/scenario.repository';
import { ScenarioOrmEntity } from './entities/scenario.orm-entity';
import { ScenarioMapper } from './mappers/scenario.mapper';

@Injectable()
export class PostgresScenarioRepository implements ScenarioRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(scenario: Scenario): Promise<void> {
    const orm = ScenarioMapper.toOrm(scenario);
    orm.updatedAt = new Date();

    await this.ds.transaction(async (mgr) => {
      await mgr.query(`SET LOCAL app.tenant_id = '${scenario.tenantId}'`);
      await mgr
        .getRepository(ScenarioOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(ScenarioOrmEntity)
        .values(orm)
        .orUpdate(
          [
            'scenario_type', 'name', 'assumptions', 'cash_flow_periods',
            'result', 'version', 'updated_at',
          ],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: ScenarioId): Promise<Scenario | null> {
    const e = await this.ds.transaction(async (mgr) => {
      await mgr.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return mgr
        .getRepository(ScenarioOrmEntity)
        .findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? ScenarioMapper.toDomain(e) : null;
  }

  async findByDealId(tenantId: TenantId, dealId: string): Promise<Scenario[]> {
    const entities = await this.ds.transaction(async (mgr) => {
      await mgr.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return mgr
        .getRepository(ScenarioOrmEntity)
        .find({ where: { tenantId: tenantId.value, dealId } });
    });
    return entities.map(ScenarioMapper.toDomain);
  }
}
