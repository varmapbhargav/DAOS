import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NavCalculationEntity } from '../domain/nav-calculation.entity';

@Injectable()
export class NavCalculationRepository {
  constructor(
    @InjectRepository(NavCalculationEntity, 'reporting')
    private readonly repo: Repository<NavCalculationEntity>,
  ) {}

  async save(nav: NavCalculationEntity): Promise<void> {
    await this.repo.save(nav);
  }

  async findById(id: string): Promise<NavCalculationEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async listByProductId(productId: string, limit = 10): Promise<NavCalculationEntity[]> {
    return this.repo.find({ where: { productId }, order: { calculationDate: 'DESC' }, take: limit });
  }
}
