import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DocumentVersionEntity } from '../domain/document-version.entity';

@Injectable()
export class DocumentVersionRepository {
  constructor(
    @InjectRepository(DocumentVersionEntity, 'reporting')
    private readonly repo: Repository<DocumentVersionEntity>,
  ) {}

  async save(version: DocumentVersionEntity): Promise<void> {
    await this.repo.save(version);
  }

  async findById(id: string): Promise<DocumentVersionEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async listByDocument(docId: string): Promise<DocumentVersionEntity[]> {
    return this.repo.find({ where: { documentId: docId }, order: { versionNumber: 'DESC' } });
  }
}
