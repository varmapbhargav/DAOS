import { ProposalId, TenantId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Proposal } from '../../domain/aggregates/proposal.aggregate';
import { ProposalRepository } from '../../domain/repositories/proposal.repository';

@Injectable()
export class PostgresProposalRepository implements ProposalRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(proposal: Proposal): Promise<void> {
    // TODO: Implement actual persistence logic
  }

  async findById(tenantId: TenantId, id: ProposalId): Promise<Proposal | null> {
    // TODO: Implement actual lookup
    return null;
  }

  async findByStatus(tenantId: TenantId, status: string): Promise<Proposal[]> {
    // TODO: Implement actual lookup
    return [];
  }

  async findVotingOpen(tenantId: TenantId): Promise<Proposal[]> {
    // TODO: Implement actual lookup
    return [];
  }

  async findAll(tenantId: TenantId): Promise<Proposal[]> {
    // TODO: Implement actual lookup
    return [];
  }
}
