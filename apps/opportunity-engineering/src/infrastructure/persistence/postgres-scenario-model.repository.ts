import { ScenarioModelId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { ScenarioModel } from '../../domain/aggregates/scenario-model.aggregate';
import { ScenarioModelRepository } from '../../domain/repositories/scenario-model.repository';
import { ScenarioModelOrmEntity } from './entities/scenario-model.orm-entity';
import { ScenarioModelMapper } from './mappers/scenario-model.mapper';

@Injectable()
export class PostgresScenarioModelRepository implements ScenarioModelRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(model: ScenarioModel): Promise<void> {
    const orm = ScenarioModelMapper.toOrm(model);
    await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${model.tenantId.value}'`);
      await manager
        .getRepository(ScenarioModelOrmEntity)
        .createQueryBuilder()
        .insert()
        .into(ScenarioModelOrmEntity)
        .values(orm)
        .orUpdate(
          [
            'opportunity_id',
            'name',
            'scenario_type',
            'status',
            'key_assumptions',
            'projected_irr_percent',
            'projected_multiple',
            'version',
            'updated_at',
          ],
          ['id'],
        )
        .execute();
    });
  }

  async findById(tenantId: TenantId, id: ScenarioModelId): Promise<ScenarioModel | null> {
    const e = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager
        .getRepository(ScenarioModelOrmEntity)
        .findOne({ where: { tenantId: tenantId.value, id: id.value } });
    });
    return e ? ScenarioModelMapper.toDomain(e) : null;
  }

  async findByOpportunityId(tenantId: TenantId, opportunityId: string): Promise<ScenarioModel[]> {
    const entities = await this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId.value}'`);
      return manager
        .getRepository(ScenarioModelOrmEntity)
        .find({ where: { tenantId: tenantId.value, opportunityId } });
    });
    return entities.map(ScenarioModelMapper.toDomain);
  }
}
