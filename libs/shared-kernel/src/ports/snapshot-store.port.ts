export interface SnapshotData {
  aggregateId: string;
  tenantId: string;
  state: Record<string, unknown>;
  version: number;
  createdAt: string;
}

export interface SnapshotStore {
  save(snapshot: SnapshotData): Promise<void>;
  getLatest(aggregateId: string, tenantId: string): Promise<SnapshotData | null>;
}
