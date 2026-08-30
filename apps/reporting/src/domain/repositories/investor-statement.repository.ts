import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { InvestorStatementEntity } from '../domain/investor-statement.entity';

@Injectable()
export class InvestorStatementRepository {
  constructor(
    @InjectRepository(InvestorStatementEntity, 'reporting')
    private readonly repo: Repository<InvestorStatementEntity>,
  ) {}

  async save(stmt: InvestorStatementEntity): Promise<void> {
    await this.repo.save(stmt);
  }

  async findById(id: string): Promise<InvestorStatementEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async listByInvestor(investorId: string): Promise<InvestorStatementEntity[]> {
    return this.repo.find({ where: { investorId } });
  }
}
