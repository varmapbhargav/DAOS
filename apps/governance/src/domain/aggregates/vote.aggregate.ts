import { AggregateRoot, ProposalId, TenantId, UserId, VoteChoice, VoteId } from '@daos/shared-kernel';

import { VoteCast } from '../events/vote-cast.event';

export class Vote extends AggregateRoot {
  private constructor(
    public readonly id: VoteId,
    public readonly tenantId: TenantId,
    public readonly proposalId: ProposalId,
    public readonly votedBy: UserId,
    private _choice: VoteChoice,
    private _shares: number,
    private _votedAt: string,
  ) {
    super();
  }

  static create(params: {
    tenantId: TenantId;
    proposalId: ProposalId;
    votedBy: UserId;
    choice: VoteChoice;
    shares: number;
  }): Vote {
    const vote = new Vote(
      VoteId.create(),
      params.tenantId,
      params.proposalId,
      params.votedBy,
      params.choice,
      params.shares,
      new Date().toISOString(),
    );
    vote.raise(new VoteCast(vote.id.value, vote.tenantId.value, vote.proposalId.value, vote.votedBy.value, params.choice, params.shares));
    vote.incrementVersion();
    return vote;
  }

  static reconstruct(params: {
    id: VoteId;
    tenantId: TenantId;
    proposalId: ProposalId;
    votedBy: UserId;
    choice: VoteChoice;
    shares: number;
    votedAt: string;
    version: number;
  }): Vote {
    const vote = new Vote(
      params.id,
      params.tenantId,
      params.proposalId,
      params.votedBy,
      params.choice,
      params.shares,
      params.votedAt,
    );
    vote._version = params.version;
    return vote;
  }

  get choice(): VoteChoice {
    return this._choice;
  }

  get shares(): number {
    return this._shares;
  }

  get votedAt(): string {
    return this._votedAt;
  }

  get proposalIdValue(): string {
    return this.proposalId.value;
  }

  get votedByValue(): string {
    return this.votedBy.value;
  }
}
