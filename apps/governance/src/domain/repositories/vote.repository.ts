import { ProposalId, TenantId, VoteId } from '@daos/shared-kernel';

import { Vote } from '../aggregates/vote.aggregate';

export interface VoteRepository {
  save(vote: Vote): Promise<void>;
  findById(tenantId: TenantId, id: VoteId): Promise<Vote | null>;
  findByProposal(tenantId: TenantId, proposalId: ProposalId): Promise<Vote[]>;
  findByVoter(tenantId: TenantId, userId: string): Promise<Vote[]>;
  findTotalVotes(tenantId: TenantId, proposalId: ProposalId): Promise<{ for: number; against: number; abstain: number }>;
  findAll(tenantId: TenantId): Promise<Vote[]>;
}
