import { NotFoundException, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';

import { VOTE_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { VoteRepository } from '../../domain/repositories/vote.repository';
import { GetVoteResultsQuery } from './get-vote-results.query';

export class GetVoteResultsResponse {
  constructor(
    public readonly proposalId: string,
    public readonly voteForCount: number,
    public readonly voteAgainstCount: number,
    public readonly voteAbstainCount: number,
    public readonly totalVotes: number,
  ) {}
}

@QueryHandler(GetVoteResultsQuery)
export class GetVoteResultsHandler implements IQueryHandler<GetVoteResultsQuery, GetVoteResultsResponse> {
  constructor(@Inject(VOTE_REPOSITORY) private readonly votes: VoteRepository) {}

  async execute(query: GetVoteResultsQuery): Promise<GetVoteResultsResponse> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());

    const result = await this.votes.findTotalVotes(tenantId, { value: query.proposalId } as any);
    if (!result) throw new NotFoundException(`No votes found for proposal: ${query.proposalId}`);

    return new GetVoteResultsResponse(query.proposalId, result.for, result.against, result.abstain, result.for + result.against + result.abstain);
  }
}
