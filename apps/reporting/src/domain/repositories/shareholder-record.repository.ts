import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ShareholderRecordEntity } from '../domain/shareholder-record.entity';

@Injectable()
export class ShareholderRecordRepository {
  constructor(
    @InjectRepository(ShareholderRecordEntity, 'reporting')
    private readonly repo: Repository<ShareholderRecordEntity>,
  ) {}

  async save(record: ShareholderRecordEntity): Promise<void> {
    await this.repo.save(record);
  }

  async findById(id: string): Promise<ShareholderRecordEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async listByCapTable(capTableId: string): Promise<ShareholderRecordEntity[]> {
    return this.repo.find({ where: { capTableId } });
  }
}
