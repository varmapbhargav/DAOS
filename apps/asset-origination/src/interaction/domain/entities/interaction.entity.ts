import { InteractionDirection, InteractionId, InteractionType, TenantId } from '@daos/shared-kernel';

export class Interaction {
  private constructor(
    public readonly id: InteractionId,
    public readonly tenantId: TenantId,
    public readonly caseId: string | null,
    public readonly assetId: string | null,
    public readonly counterpartyId: string | null,
    private _type: InteractionType,
    private _direction: InteractionDirection,
    private _subject: string,
    private _body: string | null,
    private _participants: string[],
    private _occurredAt: string,
    private _recordedBy: string,
    private _recordedAt: string,
    private _metadata: Record<string, unknown>,
  ) {}

  static create(params: {
    tenantId: TenantId;
    caseId?: string | null;
    assetId?: string | null;
    counterpartyId?: string | null;
    type: InteractionType;
    direction: InteractionDirection;
    subject: string;
    body?: string | null;
    participants?: string[];
    occurredAt?: string;
    recordedBy: string;
    metadata?: Record<string, unknown>;
  }): Interaction {
    return new Interaction(
      InteractionId.create(),
      params.tenantId,
      params.caseId ?? null,
      params.assetId ?? null,
      params.counterpartyId ?? null,
      params.type,
      params.direction,
      params.subject,
      params.body ?? null,
      params.participants ?? [],
      params.occurredAt ?? new Date().toISOString(),
      params.recordedBy,
      new Date().toISOString(),
      params.metadata ?? {},
    );
  }

  static reconstruct(params: {
    id: InteractionId;
    tenantId: TenantId;
    caseId: string | null;
    assetId: string | null;
    counterpartyId: string | null;
    type: InteractionType;
    direction: InteractionDirection;
    subject: string;
    body: string | null;
    participants: string[];
    occurredAt: string;
    recordedBy: string;
    recordedAt: string;
    metadata: Record<string, unknown>;
  }): Interaction {
    return new Interaction(
      params.id,
      params.tenantId,
      params.caseId,
      params.assetId,
      params.counterpartyId,
      params.type,
      params.direction,
      params.subject,
      params.body,
      params.participants,
      params.occurredAt,
      params.recordedBy,
      params.recordedAt,
      params.metadata,
    );
  }

  get type(): InteractionType {
    return this._type;
  }
  get direction(): InteractionDirection {
    return this._direction;
  }
  get subject(): string {
    return this._subject;
  }
  get body(): string | null {
    return this._body;
  }
  get participants(): string[] {
    return [...this._participants];
  }
  get occurredAt(): string {
    return this._occurredAt;
  }
  get recordedBy(): string {
    return this._recordedBy;
  }
  get recordedAt(): string {
    return this._recordedAt;
  }
  get metadata(): Record<string, unknown> {
    return { ...this._metadata };
  }

  addParticipant(participant: string): void {
    if (!this._participants.includes(participant)) {
      this._participants.push(participant);
    }
  }

  updateMetadata(key: string, value: unknown): void {
    this._metadata[key] = value;
  }
}