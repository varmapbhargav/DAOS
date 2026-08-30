import { Injectable } from '@nestjs/common';

import { ProposalRepository } from '../repositories/proposal.repository';

@Injectable()
export class ProposalVotingService {
  constructor(private readonly proposalRepo: ProposalRepository) {}

  async calculateResult(proposalId: string): Promise<{ passed: boolean; voteCount: number; threshold: number } | null> {
    const proposal = await this.proposalRepo.findById({ value: 'default' } as any, { value: proposalId } as any);
    if (!proposal) return null;

    const totalVotes = proposal.voteForCount + proposal.voteAgainstCount + proposal.voteAbstainCount;
    if (totalVotes === 0) return { passed: false, voteCount: 0, threshold: 0 };

    const passedPercentage = (proposal.voteForCount / totalVotes) * 100;
    return {
      passed: passedPercentage > 50,
      voteCount: totalVotes,
      threshold: 50,
    };
  }

  async checkQuorum(proposalId: string): Promise<{ met: boolean; sharesVoting: number; required: number } | null> {
    const proposal = await this.proposalRepo.findById({ value: 'default' } as any, { value: proposalId } as any);
    if (!proposal) return null;

    const required = proposal.sharesEligible * (proposal.quorumPercentage / 100);
    return {
      met: proposal.sharesVoting >= required,
      sharesVoting: proposal.sharesVoting,
      required,
    };
  }
}
