// Governance & Voting ports
export interface ProposalRepository {
  save(proposal: Proposal): Promise<void>;
  findById(id: string): Promise<Proposal | null>;
  listByTenant(tenantId: string): Promise<Proposal[]>;
}

export interface VoteRepository {
  save(vote: Vote): Promise<void>;
  findById(id: string): Promise<Vote | null>;
  listByProposal(proposalId: string): Promise<Vote[]>;
  countByProposal(proposalId: string): Promise<{ for: number; against: number; abstain: number }>;
}

export interface MeetingRepository {
  save(meeting: Meeting): Promise<void>;
  findById(id: string): Promise<Meeting | null>;
  listByProductId(productId: string): Promise<Meeting[]>;
}

export interface BlockchainVotingAdapter {
  recordVote(voteId: string, investorId: string, choice: VoteChoice, votingPower: bigint): Promise<{ txHash: string }>;
  verifyVote(voteId: string, investorId: string): Promise<boolean>;
}

export interface VotingQuorumChecker {
  check(proposal: Proposal): { met: boolean; totalEligibleVotes: bigint; castVotes: bigint };
}

export interface ProposalStateTransition {
  transition(proposal: Proposal, event: string): { valid: boolean; nextStatus: string; error?: string };
}
