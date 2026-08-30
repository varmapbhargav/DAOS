import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PerformanceMetricEntity } from '../domain/performance-metric.entity';

@Injectable()
export class PerformanceMetricRepository {
  constructor(
    @InjectRepository(PerformanceMetricEntity, 'reporting')
    private readonly repo: Repository<PerformanceMetricEntity>,
  ) {}

  async save(metric: PerformanceMetricEntity): Promise<void> {
    await this.repo.save(metric);
  }

  async findById(id: string): Promise<PerformanceMetricEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async listByProductId(productId: string): Promise<PerformanceMetricEntity[]> {
    return this.repo.find({ where: { productId } });
  }
}
