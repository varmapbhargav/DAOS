import { ProposalId, TenantId, VoteId } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Vote } from '../../domain/aggregates/vote.aggregate';
import { VoteRepository } from '../../domain/repositories/vote.repository';

@Injectable()
export class PostgresVoteRepository implements VoteRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async save(vote: Vote): Promise<void> {
    // TODO: Implement actual persistence logic
  }

  async findById(tenantId: TenantId, id: VoteId): Promise<Vote | null> {
    // TODO: Implement actual lookup
    return null;
  }

  async findByProposal(tenantId: TenantId, proposalId: ProposalId): Promise<Vote[]> {
    // TODO: Implement actual lookup
    return [];
  }

  async findByVoter(tenantId: TenantId, userId: string): Promise<Vote[]> {
    // TODO: Implement actual lookup
    return [];
  }

  async findTotalVotes(tenantId: TenantId, proposalId: ProposalId): Promise<{ for: number; against: number; abstain: number }> {
    // TODO: Implement actual lookup
    return { for: 0, against: 0, abstain: 0 };
  }

  async findAll(tenantId: TenantId): Promise<Vote[]> {
    // TODO: Implement actual lookup
    return [];
  }
}
