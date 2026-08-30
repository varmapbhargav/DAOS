import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { InvestorCountEntity } from '../domain/investor-count.entity';

@Injectable()
export class InvestorCountRepository {
  constructor(
    @InjectRepository(InvestorCountEntity, 'compliance')
    private readonly repo: Repository<InvestorCountEntity>,
  ) {}

  async save(count: InvestorCountEntity): Promise<void> {
    await this.repo.save(count);
  }

  async findById(id: string): Promise<InvestorCountEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async listByProductId(productId: string): Promise<InvestorCountEntity[]> {
    return this.repo.find({ where: { productId } });
  }
}
