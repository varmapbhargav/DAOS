import { NotFoundException, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Proposal } from '../../domain/aggregates/proposal.aggregate';
import { PROPOSAL_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { ProposalRepository } from '../../domain/repositories/proposal.repository';
import { IssueVotingNoticeCommand } from './issue-voting-notice.command';

@CommandHandler(IssueVotingNoticeCommand)
export class IssueVotingNoticeHandler implements ICommandHandler<IssueVotingNoticeCommand> {
  constructor(@Inject(PROPOSAL_REPOSITORY) private readonly proposals: ProposalRepository) {}

  async execute(command: IssueVotingNoticeCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());

    const proposal = await this.proposals.findById(tenantId, { value: command.proposalId } as any);
    if (!proposal) throw new NotFoundException(`Proposal not found: ${command.proposalId}`);

    proposal.issueNotice();
    await this.proposals.save(proposal);
  }
}
