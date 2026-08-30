import { NotFoundException, TenantContextHolder, TenantId, VoteChoice } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Vote } from '../../domain/aggregates/vote.aggregate';
import { PROPOSAL_REPOSITORY, VOTE_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { ProposalRepository } from '../../domain/repositories/proposal.repository';
import { VoteRepository } from '../../domain/repositories/vote.repository';
import { CastVoteCommand } from './cast-vote.command';

@CommandHandler(CastVoteCommand)
export class CastVoteHandler implements ICommandHandler<CastVoteCommand> {
  constructor(
    @Inject(PROPOSAL_REPOSITORY) private readonly proposals: ProposalRepository,
    @Inject(VOTE_REPOSITORY) private readonly votes: VoteRepository,
  ) {}

  async execute(command: CastVoteCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const userId = TenantContextHolder.requireUserId?.() || 'system';

    const proposal = await this.proposals.findById(tenantId, { value: command.proposalId } as any);
    if (!proposal) throw new NotFoundException(`Proposal not found: ${command.proposalId}`);

    const vote = Vote.create({
      tenantId,
      proposalId: proposal.id,
      votedBy: { value: userId } as any,
      choice: command.choice as VoteChoice,
      shares: command.shares,
    });

    proposal.castVote(command.choice === 'for' ? command.shares : 0, command.choice === 'against' ? command.shares : 0, command.choice === 'abstain' ? command.shares : 0, command.shares);

    await this.votes.save(vote);
    await this.proposals.save(proposal);
  }
}
