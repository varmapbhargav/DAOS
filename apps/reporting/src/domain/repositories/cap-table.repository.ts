import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CapTableEntity } from '../domain/cap-table.entity';

@Injectable()
export class CapTableRepository {
  constructor(
    @InjectRepository(CapTableEntity, 'reporting')
    private readonly repo: Repository<CapTableEntity>,
  ) {}

  async save(table: CapTableEntity): Promise<void> {
    await this.repo.save(table);
  }

  async findById(id: string): Promise<CapTableEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async listByTenant(tenantId: string): Promise<CapTableEntity[]> {
    return this.repo.find({ where: { tenantId } });
  }
}
