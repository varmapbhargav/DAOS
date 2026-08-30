// Reporting ports
export interface NavCalculationRepository {
  save(nav: NavCalculation): Promise<void>;
  findById(id: string): Promise<NavCalculation | null>;
  listByProductId(productId: string, limit?: number): Promise<NavCalculation[]>;
}

export interface PerformanceMetricRepository {
  save(metric: PerformanceMetric): Promise<void>;
  findById(id: string): Promise<PerformanceMetric | null>;
  listByProductId(productId: string, period?: string): Promise<PerformanceMetric[]>;
}

export interface InvestorStatementRepository {
  save(stmt: InvestorStatement): Promise<void>;
  findById(id: string): Promise<InvestorStatement | null>;
  listByInvestor(investorId: string, period?: string): Promise<InvestorStatement[]>;
}

export interface DocumentRepository {
  save(doc: Document): Promise<void>;
  findById(id: string): Promise<Document | null>;
  listByTenant(tenantId: string): Promise<Document[]>;
}

export interface DocumentVersionRepository {
  save(version: DocumentVersion): Promise<void>;
  findById(id: string): Promise<DocumentVersion | null>;
  listByDocument(docId: string): Promise<DocumentVersion[]>;
}

export interface CapTableRepository {
  save(table: CapTable): Promise<void>;
  findById(id: string): Promise<CapTable | null>;
  listByTenant(tenantId: string): Promise<CapTable[]>;
}

export interface ShareholderRecordRepository {
  save(record: ShareholderRecord): Promise<void>;
  findById(id: string): Promise<ShareholderRecord | null>;
  listByCapTable(capTableId: string): Promise<ShareholderRecord[]>;
}

export interface DocumentStoragePort {
  upload(file: Buffer, mimeType: string, metadata: Record<string, string>): Promise<{ fileRef: string; checksum: string }>;
  download(fileRef: string): Promise<Buffer>;
  delete(fileRef: string): Promise<void>;
  generateSignedUrl(fileRef: string, ttlSeconds: number): Promise<string>;
}
