import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DocumentEntity } from '../domain/document.entity';

@Injectable()
export class DocumentRepository {
  constructor(
    @InjectRepository(DocumentEntity, 'reporting')
    private readonly repo: Repository<DocumentEntity>,
  ) {}

  async save(doc: DocumentEntity): Promise<void> {
    await this.repo.save(doc);
  }

  async findById(id: string): Promise<DocumentEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async listByTenant(tenantId: string): Promise<DocumentEntity[]> {
    return this.repo.find({ where: { tenantId } });
  }
}
