import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ComplianceRuleEntity } from '../domain/compliance-rule.entity';

@Injectable()
export class ComplianceRuleRepository {
  constructor(
    @InjectRepository(ComplianceRuleEntity, 'compliance')
    private readonly repo: Repository<ComplianceRuleEntity>,
  ) {}

  async save(rule: ComplianceRuleEntity): Promise<void> {
    await this.repo.save(rule);
  }

  async findById(id: string): Promise<ComplianceRuleEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async listByTenant(tenantId: string): Promise<ComplianceRuleEntity[]> {
    return this.repo.find({ where: { tenantId } });
  }

  async listByType(ruleType: string): Promise<ComplianceRuleEntity[]> {
    return this.repo.find({ where: { ruleType } });
  }
}
