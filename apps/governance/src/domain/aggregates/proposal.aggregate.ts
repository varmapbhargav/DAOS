import { AggregateRoot, ProposalId, ProposalStatus, ProposalType, TenantId, UserId, VotingMechanism } from '@daos/shared-kernel';

import { ProposalCreated } from '../events/proposal-created.event';
import { ProposalFailed } from '../events/proposal-failed.event';
import { ProposalPassed } from '../events/proposal-passed.event';
import { QuorumReached } from '../events/quorum-reached.event';
import { VotingClosed } from '../events/voting-closed.event';
import { VotingOpened } from '../events/voting-opened.event';

export class Proposal extends AggregateRoot {
  private constructor(
    public readonly id: ProposalId,
    public readonly tenantId: TenantId,
    public readonly createdById: UserId,
    private _title: string,
    private _description: string,
    private _type: ProposalType,
    private _status: ProposalStatus,
    private _votingMechanism: VotingMechanism,
    private _quorumPercentage: number,
    private _votingStartAt: string | null,
    private _votingEndAt: string | null,
    private _voteForCount: number,
    private _voteAgainstCount: number,
    private _voteAbstainCount: number,
    private _totalVotes: number,
    private _sharesVoting: number,
    private _sharesEligible: number,
  ) {
    super();
  }

  static create(params: {
    tenantId: TenantId;
    createdById: UserId;
    title: string;
    description: string;
    type: ProposalType;
    votingMechanism: VotingMechanism;
    quorumPercentage: number;
    sharesEligible: number;
  }): Proposal {
    const proposal = new Proposal(
      ProposalId.create(),
      params.tenantId,
      params.createdById,
      params.title.trim(),
      params.description.trim(),
      params.type,
      'draft',
      params.votingMechanism,
      params.quorumPercentage,
      null,
      null,
      0,
      0,
      0,
      0,
      0,
      params.sharesEligible,
    );
    proposal.raise(new ProposalCreated(proposal.id.value, proposal.tenantId.value, proposal.createdById.value, params.title));
    proposal.incrementVersion();
    return proposal;
  }

  static reconstruct(params: {
    id: ProposalId;
    tenantId: TenantId;
    createdById: UserId;
    title: string;
    description: string;
    type: ProposalType;
    status: ProposalStatus;
    votingMechanism: VotingMechanism;
    quorumPercentage: number;
    votingStartAt: string | null;
    votingEndAt: string | null;
    voteForCount: number;
    voteAgainstCount: number;
    voteAbstainCount: number;
    totalVotes: number;
    sharesVoting: number;
    sharesEligible: number;
    version: number;
  }): Proposal {
    const proposal = new Proposal(
      params.id,
      params.tenantId,
      params.createdById,
      params.title,
      params.description,
      params.type,
      params.status,
      params.votingMechanism,
      params.quorumPercentage,
      params.votingStartAt,
      params.votingEndAt,
      params.voteForCount,
      params.voteAgainstCount,
      params.voteAbstainCount,
      params.totalVotes,
      params.sharesVoting,
      params.sharesEligible,
    );
    proposal._version = params.version;
    return proposal;
  }

  get title(): string {
    return this._title;
  }

  get description(): string {
    return this._description;
  }

  get type(): ProposalType {
    return this._type;
  }

  get status(): ProposalStatus {
    return this._status;
  }

  get votingMechanism(): VotingMechanism {
    return this._votingMechanism;
  }

  get quorumPercentage(): number {
    return this._quorumPercentage;
  }

  get votingStartAt(): string | null {
    return this._votingStartAt;
  }

  get votingEndAt(): string | null {
    return this._votingEndAt;
  }

  get voteForCount(): number {
    return this._voteForCount;
  }

  get voteAgainstCount(): number {
    return this._voteAgainstCount;
  }

  get voteAbstainCount(): number {
    return this._voteAbstainCount;
  }

  get totalVotes(): number {
    return this._totalVotes;
  }

  get sharesVoting(): number {
    return this._sharesVoting;
  }

  get sharesEligible(): number {
    return this._sharesEligible;
  }

  get result(): 'passed' | 'failed' | 'pending' | null {
    if (this._status !== 'votingClosed') return null;
    const totalVotes = this._voteForCount + this._voteAgainstCount + this._voteAbstainCount;
    if (totalVotes === 0) return 'failed';
    const passedPercentage = (this._voteForCount / totalVotes) * 100;
    return passedPercentage > 50 ? 'passed' : 'failed';
  }

  issueNotice(): void {
    if (this._status !== 'draft') throw new Error(`Proposal must be in draft status to issue notice, was: ${this._status}`);
    this._status = 'noticeIssued';
    this.incrementVersion();
  }

  openVoting(startAt: string, endAt: string): void {
    if (this._status !== 'noticeIssued') throw new Error(`Proposal must have notice issued to open voting, was: ${this._status}`);
    this._status = 'votingOpen';
    this._votingStartAt = startAt;
    this._votingEndAt = endAt;
    this.raise(new VotingOpened(this.id.value, this.tenantId.value, startAt, endAt));
    this.incrementVersion();
  }

  closeVoting(): void {
    if (this._status !== 'votingOpen') throw new Error(`Proposal must have voting open to close, was: ${this._status}`);
    this._status = 'votingClosed';
    this.raise(new VotingClosed(this.id.value, this.tenantId.value));
    this.checkResult();
    this.incrementVersion();
  }

  castVote(voteForCount: number, voteAgainstCount: number, voteAbstainCount: number, sharesVoting: number): void {
    if (this._status !== 'votingOpen') throw new Error(`Proposal voting must be open to cast votes, was: ${this._status}`);
    this._voteForCount += voteForCount;
    this._voteAgainstCount += voteAgainstCount;
    this._voteAbstainCount += voteAbstainCount;
    this._totalVotes += voteForCount + voteAgainstCount + voteAbstainCount;
    this._sharesVoting += sharesVoting;
    this.checkQuorum();
    this.incrementVersion();
  }

  checkQuorum(): void {
    if (this._sharesVoting >= this._sharesEligible * (this._quorumPercentage / 100)) {
      this.raise(new QuorumReached(this.id.value, this.tenantId.value, this._sharesVoting));
    }
  }

  private checkResult(): void {
    const totalVotes = this._voteForCount + this._voteAgainstCount + this._voteAbstainCount;
    if (totalVotes === 0) {
      this._status = 'quorumNotMet';
      this.raise(new ProposalFailed(this.id.value, this.tenantId.value, 'No votes cast'));
      return;
    }
    const passedPercentage = (this._voteForCount / totalVotes) * 100;
    if (passedPercentage > 50) {
      this._status = 'passed';
      this.raise(new ProposalPassed(this.id.value, this.tenantId.value));
    } else {
      this._status = 'failed';
      this.raise(new ProposalFailed(this.id.value, this.tenantId.value, 'Did not receive majority vote'));
    }
  }
}
