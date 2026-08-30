import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RegulatoryFilingEntity } from '../domain/regulatory-filing.entity';

@Injectable()
export class RegulatoryFilingRepository {
  constructor(
    @InjectRepository(RegulatoryFilingEntity, 'compliance')
    private readonly repo: Repository<RegulatoryFilingEntity>,
  ) {}

  async save(filing: RegulatoryFilingEntity): Promise<void> {
    await this.repo.save(filing);
  }

  async findById(id: string): Promise<RegulatoryFilingEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async listByTenant(tenantId: string): Promise<RegulatoryFilingEntity[]> {
    return this.repo.find({ where: { tenantId } });
  }
}
