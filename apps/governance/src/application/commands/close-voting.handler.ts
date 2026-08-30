import { NotFoundException, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Proposal } from '../../domain/aggregates/proposal.aggregate';
import { PROPOSAL_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { ProposalRepository } from '../../domain/repositories/proposal.repository';
import { CloseVotingCommand } from './close-voting.command';

@CommandHandler(CloseVotingCommand)
export class CloseVotingHandler implements ICommandHandler<CloseVotingCommand> {
  constructor(@Inject(PROPOSAL_REPOSITORY) private readonly proposals: ProposalRepository) {}

  async execute(command: CloseVotingCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());

    const proposal = await this.proposals.findById(tenantId, { value: command.proposalId } as any);
    if (!proposal) throw new NotFoundException(`Proposal not found: ${command.proposalId}`);

    proposal.closeVoting();
    await this.proposals.save(proposal);
  }
}
