import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';

import { PROPOSAL_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { ProposalRepository } from '../../domain/repositories/proposal.repository';
import { ListProposalsQuery } from './list-proposals.query';

export class ListProposalsResponse {
  constructor(public readonly proposals: Proposal[]) {}
}

export class ProposalDto {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly type: string,
    public readonly status: string,
    public readonly votingMechanism: string,
  ) {}
}

@QueryHandler(ListProposalsQuery)
export class ListProposalsHandler implements IQueryHandler<ListProposalsQuery, ProposalDto[]> {
  constructor(@Inject(PROPOSAL_REPOSITORY) private readonly proposals: ProposalRepository) {}

  async execute(query: ListProposalsQuery): Promise<ProposalDto[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());

    let proposalList: Proposal[];
    if (query.status) {
      proposalList = await this.proposals.findByStatus(tenantId, query.status);
    } else {
      proposalList = await this.proposals.findAll(tenantId);
    }

    return proposalList.map((p) => new ProposalDto(p.id.value, p.title, p.type, p.status, p.votingMechanism));
  }
}
