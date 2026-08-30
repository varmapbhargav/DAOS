import { AssetOriginationStatus, DomainEvent } from '@daos/shared-kernel';

export class AssetStatusChanged extends DomainEvent {
  readonly eventType = 'AssetStatusChanged';

  constructor(
    public readonly assetId: string,
    public readonly tenantId: string,
    public readonly previousStatus: AssetOriginationStatus,
    public readonly newStatus: AssetOriginationStatus,
    public readonly reason: string | null,
    public readonly actor: string,
  ) {
    super();
  }
}
