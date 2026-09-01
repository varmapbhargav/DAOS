import { Decimal } from './decimal.vo';

export type ModelVersion = {
  version: number;
  modelType: 'financial_model' | 'scenario' | 'assumption_set' | 'valuation' | 'optimization';
  entityId: string;
  entityType: string;
  snapshot: Record<string, unknown>;
  createdBy: string;
  createdAt: Date;
  changeReason: string;
  previousVersionId?: string;
};

export type VersionedModel<T> = {
  current: T;
  versions: ModelVersion[];
};

export class ModelVersioning {
  static createVersion<T>(
    modelType: ModelVersion['modelType'],
    entityId: string,
    entityType: string,
    current: T,
    createdBy: string,
    changeReason: string,
    previousVersionId?: string,
  ): ModelVersion {
    return {
      version: previousVersionId ? 0 : 1, // Will be set by repository
      modelType,
      entityId,
      entityType,
      snapshot: current as unknown as Record<string, unknown>,
      createdBy,
      createdAt: new Date(),
      changeReason,
      previousVersionId,
    };
  }

  static compareVersions(v1: ModelVersion, v2: ModelVersion): Record<string, { old: unknown; new: unknown }> {
    const changes: Record<string, { old: unknown; new: unknown }> = {};
    const allKeys = new Set([...Object.keys(v1.snapshot), ...Object.keys(v2.snapshot)]);

    for (const key of allKeys) {
      const oldVal = v1.snapshot[key];
      const newVal = v2.snapshot[key];
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes[key] = { old: oldVal, new: newVal };
      }
    }

    return changes;
  }
}