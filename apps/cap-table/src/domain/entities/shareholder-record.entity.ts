import { AggregateRoot, ShareholderRecordId, ShareholderType } from '@daos/shared-kernel';

export type CreateShareholderRecordProps = {
  shareholderId: string;
  name: string;
  shareholderType: ShareholderType;
  walletAddress: string | null;
  shareClassId: string;
  unitsHeld: bigint;
};

export class ShareholderRecord extends AggregateRoot {
  private constructor(
    public readonly id: ShareholderRecordId,
    public readonly shareholderId: string,
    private _name: string,
    private _shareholderType: ShareholderType,
    private _walletAddress: string | null,
    private _shareClassId: string,
    private _unitsHeld: bigint,
  ) {
    super();
  }

  static create(props: CreateShareholderRecordProps): ShareholderRecord {
    if (!props.shareholderId.trim()) throw new Error('Shareholder id is required');
    if (!props.name.trim()) throw new Error('Shareholder name is required');
    if (!props.shareClassId.trim()) throw new Error('Share class id is required');
    if (props.unitsHeld < 0n) throw new Error('Held units cannot be negative');
    const record = new ShareholderRecord(
      ShareholderRecordId.create(),
      props.shareholderId.trim(),
      props.name.trim(),
      props.shareholderType,
      props.walletAddress?.trim() || null,
      props.shareClassId.trim(),
      props.unitsHeld,
    );
    record.incrementVersion();
    return record;
  }

  adjustUnits(delta: bigint): void {
    const next = this._unitsHeld + delta;
    if (next < 0n) throw new Error(`Insufficient units held by ${this.shareholderId}`);
    this._unitsHeld = next;
    this.incrementVersion();
  }

  get name(): string {
    return this._name;
  }

  get shareholderType(): ShareholderType {
    return this._shareholderType;
  }

  get walletAddress(): string | null {
    return this._walletAddress;
  }

  get shareClassId(): string {
    return this._shareClassId;
  }

  get unitsHeld(): bigint {
    return this._unitsHeld;
  }

  get votes(): number {
    return Number(this._unitsHeld);
  }

  toState(): {
    shareholderId: string;
    name: string;
    shareholderType: ShareholderType;
    walletAddress: string | null;
    shareClassId: string;
    unitsHeld: bigint;
    votes: number;
  } {
    return {
      shareholderId: this.shareholderId,
      name: this._name,
      shareholderType: this._shareholderType,
      walletAddress: this._walletAddress,
      shareClassId: this._shareClassId,
      unitsHeld: this._unitsHeld,
      votes: this.votes,
    };
  }

  static reconstruct(props: {
    id: ShareholderRecordId;
    shareholderId: string;
    name: string;
    shareholderType: ShareholderType;
    walletAddress: string | null;
    shareClassId: string;
    unitsHeld: bigint;
    version: number;
  }): ShareholderRecord {
    const record = new ShareholderRecord(
      props.id,
      props.shareholderId,
      props.name,
      props.shareholderType,
      props.walletAddress,
      props.shareClassId,
      props.unitsHeld,
    );
    record._version = props.version;
    return record;
  }
}