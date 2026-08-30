import { ProposalId, TenantId } from '@daos/shared-kernel';

import { Proposal } from '../aggregates/proposal.aggregate';

export interface ProposalRepository {
  save(proposal: Proposal): Promise<void>;
  findById(tenantId: TenantId, id: ProposalId): Promise<Proposal | null>;
  findByStatus(tenantId: TenantId, status: string): Promise<Proposal[]>;
  findVotingOpen(tenantId: TenantId): Promise<Proposal[]>;
  findAll(tenantId: TenantId): Promise<Proposal[]>;
}
