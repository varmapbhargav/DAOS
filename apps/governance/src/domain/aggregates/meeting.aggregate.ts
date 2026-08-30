import { AggregateRoot, MeetingId, MeetingStatus, MeetingType, ProposalId, TenantId } from '@daos/shared-kernel';

import { MeetingScheduled } from '../events/meeting-scheduled.event';

export class Meeting extends AggregateRoot {
  private constructor(
    public readonly id: MeetingId,
    public readonly tenantId: TenantId,
    private _title: string,
    private _description: string,
    private _type: MeetingType,
    private _status: MeetingStatus,
    private _scheduledAt: string | null,
    private _location: string | null,
    private readonly _proposalIds: ProposalId[],
  ) {
    super();
  }

  static schedule(params: {
    tenantId: TenantId;
    title: string;
    description: string;
    type: MeetingType;
    scheduledAt?: string;
    location?: string;
  }): Meeting {
    const meeting = new Meeting(
      MeetingId.create(),
      params.tenantId,
      params.title.trim(),
      params.description.trim(),
      params.type,
      'scheduled',
      params.scheduledAt ?? null,
      params.location ?? null,
      [],
    );
    meeting.raise(new MeetingScheduled(meeting.id.value, meeting.tenantId.value, meeting._title, params.type));
    meeting.incrementVersion();
    return meeting;
  }

  static reconstruct(params: {
    id: MeetingId;
    tenantId: TenantId;
    title: string;
    description: string;
    type: MeetingType;
    status: MeetingStatus;
    scheduledAt: string | null;
    location: string | null;
    proposalIds: string[];
    version: number;
  }): Meeting {
    const meeting = new Meeting(
      params.id,
      params.tenantId,
      params.title,
      params.description,
      params.type,
      params.status,
      params.scheduledAt,
      params.location,
      params.proposalIds.map((id) => ProposalId.create(id)),
    );
    meeting._version = params.version;
    return meeting;
  }

  get title(): string {
    return this._title;
  }

  get description(): string {
    return this._description;
  }

  get type(): MeetingType {
    return this._type;
  }

  get status(): MeetingStatus {
    return this._status;
  }

  get scheduledAt(): string | null {
    return this._scheduledAt;
  }

  get location(): string | null {
    return this._location;
  }

  get proposalIds(): ProposalId[] {
    return [...this._proposalIds];
  }

  addProposal(proposalId: ProposalId): void {
    if (this._status !== 'scheduled') throw new Error(`Can only add proposals to scheduled meetings, meeting status: ${this._status}`);
    if (this._proposalIds.some((p) => p.equals(proposalId))) {
      throw new Error(`Proposal ${proposalId.value} already added to meeting`);
    }
    this._proposalIds.push(proposalId);
    this.incrementVersion();
  }

  convene(): void {
    if (this._status !== 'scheduled') throw new Error(`Meeting must be scheduled to convene, was: ${this._status}`);
    this._status = 'convened';
    this.incrementVersion();
  }

  adjourn(): void {
    if (this._status !== 'convened') throw new Error(`Meeting must be convened to adjourn, was: ${this._status}`);
    this._status = 'adjourned';
    this.incrementVersion();
  }

  cancel(): void {
    if (this._status !== 'scheduled' && this._status !== 'convened') {
      throw new Error(`Meeting must be scheduled or convened to cancel, was: ${this._status}`);
    }
    this._status = 'cancelled';
    this.incrementVersion();
  }

  get proposals(): ProposalId[] {
    return [...this._proposalIds];
  }
}
