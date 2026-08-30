// Asset Origination ports
import { Money } from '@daos/shared-kernel';

import { AssetClass, Finding, ValuationMethodology } from '../value-objects/asset-value-objects';

export interface AssetRepository {
  save(asset: Asset): Promise<void>;
  findById(id: string): Promise<Asset | null>;
  findBySubdomain(subdomain: string): Promise<Asset | null>;
  listByTenant(tenantId: string): Promise<Asset[]>;
}

export interface DueDiligenceReportRepository {
  save(report: DueDiligenceReport): Promise<void>;
  findById(id: string): Promise<DueDiligenceReport | null>;
  findByAssetId(assetId: string): Promise<DueDiligenceReport | null>;
}

export interface CashFlowModelRepository {
  save(model: CashFlowModel): Promise<void>;
  findById(id: string): Promise<CashFlowModel | null>;
  findByAssetId(assetId: string): Promise<CashFlowModel[]>;
}

export interface ValuationEnginePort {
  runAVM(assetId: string, methodology: ValuationMethodology): Promise<Money>;
  runDCF(model: CashFlowModel): Promise<Money>;
  runComparables(asset: Asset, comparableAssets: Asset[]): Promise<Money>;
  validateValuation(assetId: string, amount: Money, methodology: ValuationMethodology): Promise<boolean>;
}
