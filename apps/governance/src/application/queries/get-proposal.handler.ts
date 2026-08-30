import { NotFoundException, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';

import { Proposal } from '../../domain/aggregates/proposal.aggregate';
import { PROPOSAL_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { ProposalRepository } from '../../domain/repositories/proposal.repository';
import { GetProposalQuery } from './get-proposal.query';

export class GetProposalResponse {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly title: string,
    public readonly description: string,
    public readonly type: string,
    public readonly status: string,
    public readonly votingMechanism: string,
    public readonly quorumPercentage: number,
    public readonly voteForCount: number,
    public readonly voteAgainstCount: number,
    public readonly voteAbstainCount: number,
    public readonly totalVotes: number,
    public readonly sharesVoting: number,
    public readonly sharesEligible: number,
    public readonly result: string | null,
  ) {}
}

@QueryHandler(GetProposalQuery)
export class GetProposalHandler implements IQueryHandler<GetProposalQuery, GetProposalResponse> {
  constructor(@Inject(PROPOSAL_REPOSITORY) private readonly proposals: ProposalRepository) {}

  async execute(query: GetProposalQuery): Promise<GetProposalResponse> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());

    const proposal = await this.proposals.findById(tenantId, { value: query.proposalId } as any);
    if (!proposal) throw new NotFoundException(`Proposal not found: ${query.proposalId}`);

    return new GetProposalResponse(
      proposal.id.value,
      proposal.tenantId.value,
      proposal.title,
      proposal.description,
      proposal.type,
      proposal.status,
      proposal.votingMechanism,
      proposal.quorumPercentage,
      proposal.voteForCount,
      proposal.voteAgainstCount,
      proposal.voteAbstainCount,
      proposal.totalVotes,
      proposal.sharesVoting,
      proposal.sharesEligible,
      proposal.result,
    );
  }
}
