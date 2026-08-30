# Asset Origination Microservice - Complete Implementation Plan

## Executive Summary

This document provides a comprehensive, prioritized implementation plan for transforming the Asset Origination microservice from its current MVP state into an institutional-grade asset pipeline management system.

### Current State Assessment

**Strengths:**
- Clean domain-driven design foundation with aggregates and entities
- Basic lifecycle states implemented (originated → due diligence → valuation → approval)
- CQRS pattern with command/query separation
- TypeORM persistence layer
- Tenant isolation structure in place
- Domain events for key lifecycle transitions

**Critical Issues:**
1. **`valuationUpdated` is a lifecycle state** - This should be an event/action, not a business state
2. **Hardcoded `BBB` due diligence rating placeholder** - The `_ratingPlaceholder()` method bypasses actual report validation
3. **CashFlowModel aggregate exists but is orphaned** - No persistence, repository, commands, or API integration
4. **InMemoryOutbox is not production-ready** - Events will be lost on crash/restart
5. **No screening or qualification stages** - Assets jump from origination to due diligence
6. **No risk assessment capability** - Critical for institutional investors
7. **Minimal approval workflow** - Single boolean, no conditions or multi-stage review
8. **No asset-to-deal handoff integration** - Missing connection to Deal Studio
9. **StubValuationAdapter** - Placeholder implementation

### Target Architecture

```
ASSET ORIGINATION SERVICE
│
├── Asset Intake & Registration
│   ├── Asset Identity (internal/external references)
│   ├── Source Management (sponsor, broker, portfolio, etc.)
│   └── Counterparty Management (sellers, operators, etc.)
│
├── Screening Engine ⚠️ NEW
│   ├── Eligibility Checks
│   ├── Investment Mandate Fit
│   └── Preliminary Risk Flags
│
├── Qualification Engine ⚠️ NEW
│   ├── Investment Thesis Fit Scoring
│   ├── Risk Appetite Alignment
│   └── Data Completeness Assessment
│
├── Due Diligence Engine
│   ├── Multi-Category Checklists (Commercial, Legal, Financial, ESG, etc.)
│   ├── Findings Management with Severity Tracking
│   ├── Evidence & Document Requirements
│   └── Versioned DD Reports
│
├── Valuation Engine
│   ├── Multiple Methodologies (DCF, Comps, NAV, etc.)
│   ├── Valuation History & Versioning
│   └── External Valuation Provider Integration
│
├── Financial Modeling
│   ├── Cash Flow Modeling (currently orphaned)
│   ├── NPV/IRR/XIRR Calculations
│   └── Scenario Analysis (Base/Bull/Bear/Stress)
│
├── Risk Assessment Engine ⚠️ NEW
│   ├── Multi-Category Risk Register
│   ├── Risk Scoring (Probability × Impact)
│   └── Mitigation Tracking
│
├── Approval Workflow Integration ⚠️ NEW
│   ├── Multi-Stage Review Process
│   ├── Conditional Approvals
│   └── Approval Committee Integration
│
├── Pipeline Management ⚠️ NEW
│   ├── Stage-Based Pipeline Views
│   ├── Pipeline Metrics & Analytics
│   └── Conversion Rate Tracking
│
├── Asset Handoff to Deal Studio ⚠️ NEW
│   ├── Event-Driven Handoff
│   └── Deal Creation Integration
│
└── Infrastructure
    ├── Transactional Outbox (replace InMemory)
    ├── Document Service Integration
    ├── Comprehensive Audit Trail
    └── Multi-Tenant Security
```

---

## Implementation Phases

### Phase 0: Critical Fixes & Foundation (P0 - Immediate)

These issues block institutional adoption and must be fixed before expanding functionality.

#### AO-000: Remove `valuationUpdated` as Lifecycle State

**Problem:** Currently, `valuationUpdated` is an `AssetStatus`, treating an event/action as a business state.

**Solution:**
- Remove `valuationUpdated` from `AssetStatus` enum in shared kernel
- Keep `ValuationUpdated` as a domain event (already exists)
- Update `Asset.updateValuation()` to NOT change status
- Asset status should remain `dueDiligenceCompleted` after valuation
- Approval logic should check for valuation existence, not status

**Files to Change:**
- `libs/shared-kernel/src/value-objects/asset-value-objects.ts`
- `apps/asset-origination/src/domain/aggregates/asset.aggregate.ts`
- `apps/asset-origination/src/application/commands/approve-asset.command.ts`

**Impact:** Breaking change - requires database migration

---

#### AO-001: Fix Hardcoded BBB Rating Placeholder

**Problem:** The `Asset.completeDueDiligence()` method calls `_ratingPlaceholder()` which always returns `'BBB'`.

**Current Code:**
```typescript
completeDueDiligence(completedBy: string): void {
  // ...
  const rating = this._ratingPlaceholder(completedBy);
  // ...
}

private _ratingPlaceholder(_completedBy: string): string {
  return 'BBB';
}
```

**Solution:**
- Remove `_ratingPlaceholder` method entirely
- `CompleteDueDiligenceCommand` should accept `dueDiligenceReportId`
- Command handler must:
  1. Fetch the `DueDiligenceReport` by ID
  2. Validate report exists and belongs to tenant
  3. Validate report status is `'completed'`
  4. Extract the actual `rating` from the report
  5. Pass that rating to the aggregate
- Update aggregate signature: `completeDueDiligence(rating: DDRating, completedBy: string)`

**Files to Change:**
- `apps/asset-origination/src/domain/aggregates/asset.aggregate.ts`
- `apps/asset-origination/src/application/commands/complete-due-diligence.command.ts`

---

#### AO-002: Redesign Asset Lifecycle States

**Current States:**
```typescript
type AssetStatus =
  | 'originated'
  | 'underDueDiligence'
  | 'dueDiligenceCompleted'
  | 'valuationUpdated'  // ❌ This is an action
  | 'approved'
  | 'rejected';
```

**Proposed Lifecycle:**
```typescript
type AssetOriginationStatus =
  | 'DRAFT'                    // Initial creation
  | 'ORIGINATED'               // Formal origination
  | 'SCREENING'                // Eligibility screening
  | 'QUALIFIED'                // Passed screening
  | 'DUE_DILIGENCE'            // DD in progress
  | 'VALUATION'                // Valuation in progress
  | 'RISK_REVIEW'              // Risk assessment
  | 'READY_FOR_APPROVAL'       // Submitted for approval
  | 'APPROVED'                 // Investment committee approved
  | 'REJECTED'                 // Rejected at any stage
  | 'ON_HOLD'                  // Paused
  | 'WITHDRAWN'                // Sponsor withdrew
  | 'HANDED_OFF_TO_DEAL';      // Moved to Deal Studio
```

**Transition Rules:**
```
DRAFT → ORIGINATED
ORIGINATED → SCREENING
SCREENING → QUALIFIED | REJECTED
QUALIFIED → DUE_DILIGENCE
DUE_DILIGENCE → VALUATION | ON_HOLD
VALUATION → RISK_REVIEW
RISK_REVIEW → READY_FOR_APPROVAL
READY_FOR_APPROVAL → APPROVED | REJECTED
APPROVED → HANDED_OFF_TO_DEAL
Any → WITHDRAWN (sponsor decision)
Any → ON_HOLD → Previous State (resume)
```

**Implementation:**
- Create new status enum in shared kernel
- Add state transition validation in aggregate
- Prevent invalid transitions
- Add transition metadata (reason, actor, timestamp)

**Files to Create/Change:**
- `libs/shared-kernel/src/value-objects/asset-value-objects.ts`
- `apps/asset-origination/src/domain/aggregates/asset.aggregate.ts`
- Database migration for status column

---

#### AO-003: Complete CashFlowModel Integration

**Problem:** The `CashFlowModel` aggregate exists but has:
- ❌ No ORM entity
- ❌ No repository implementation
- ❌ No commands/queries
- ❌ No HTTP controller
- ❌ No integration with valuation engine

**Solution - Create Full Stack:**

1. **ORM Entity:**
```typescript
// apps/asset-origination/src/infrastructure/persistence/entities/cash-flow-model.orm-entity.ts

@Entity('cash_flow_models')
export class CashFlowModelOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  tenantId: string;

  @Column('uuid')
  assetId: string;

  @Column('varchar')
  name: string;

  @Column('int')
  termPeriods: number;

  @Column('jsonb')
  cashFlows: Array<{
    period: number;
    amountMinorUnits: string;
    currency: string;
  }>;

  @Column('decimal', { precision: 10, scale: 6 })
  discountRatePercent: number;

  @Column('int')
  version: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

2. **Repository:**
```typescript
// apps/asset-origination/src/infrastructure/persistence/postgres-cash-flow-model.repository.ts

export interface CashFlowModelRepository {
  save(model: CashFlowModel): Promise<void>;
  findById(id: CashFlowModelId, tenantId: TenantId): Promise<CashFlowModel | null>;
  findByAssetId(assetId: string, tenantId: TenantId): Promise<CashFlowModel[]>;
}
```

3. **Commands:**
- `CreateCashFlowModel`
- `UpdateCashFlowModel`
- `AddCashFlow`
- `UpdateCashFlow`
- `SetDiscountRate`

4. **Queries:**
- `GetCashFlowModel`
- `ListCashFlowModelsByAsset`
- `CalculateNPV`
- `CalculateIRR`

5. **HTTP Controller:**
```typescript
POST   /assets/{assetId}/cash-flow-models
GET    /assets/{assetId}/cash-flow-models
GET    /cash-flow-models/{id}
PUT    /cash-flow-models/{id}
POST   /cash-flow-models/{id}/cash-flows
GET    /cash-flow-models/{id}/metrics  // NPV, IRR, etc.
```

---

#### AO-004: Replace InMemoryOutbox with Transactional Outbox

**Problem:** Current `InMemoryOutboxPublisher` loses events on service restart.

**Production Architecture:**
```
PostgreSQL Transaction
      │
      ├── Asset Update (in asset_origination schema)
      │
      └── Outbox Event (in shared outbox table)
             │
             ▼
        Outbox Worker (polls every 100ms)
             │
             ▼
            Kafka
```

**Implementation:**

1. **Outbox ORM Entity:**
```typescript
@Entity('outbox_events')
export class OutboxEventOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('varchar')
  aggregateType: string;

  @Column('uuid')
  aggregateId: string;

  @Column('varchar')
  eventType: string;

  @Column('int')
  eventVersion: number;

  @Column('jsonb')
  payload: object;

  @Column('uuid')
  tenantId: string;

  @Column('timestamp')
  occurredAt: Date;

  @Column('uuid', { nullable: true })
  correlationId: string | null;

  @Column('uuid', { nullable: true })
  causationId: string | null;

  @Column('varchar', { nullable: true })
  actorId: string | null;

  @Column('varchar', { default: 'PENDING' })
  status: 'PENDING' | 'PUBLISHED' | 'FAILED';

  @Column('timestamp', { nullable: true })
  publishedAt: Date | null;

  @Column('int', { default: 0 })
  retryCount: number;

  @Column('text', { nullable: true })
  lastError: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
```

2. **Transactional Repository Pattern:**
```typescript
// Wrap in transaction
await this.dataSource.transaction(async (manager) => {
  // 1. Save aggregate
  await manager.save(AssetOrmEntity, assetOrm);

  // 2. Save events to outbox
  const outboxEvents = asset.getUncommittedEvents().map(event => ({
    id: uuid(),
    aggregateType: 'Asset',
    aggregateId: asset.id.value,
    eventType: event.eventType,
    eventVersion: 1,
    payload: event,
    tenantId: asset.tenantId.value,
    occurredAt: new Date(),
    status: 'PENDING'
  }));
  await manager.save(OutboxEventOrmEntity, outboxEvents);

  // 3. Clear uncommitted events
  asset.commit();
});
```

3. **Outbox Worker:**
```typescript
@Injectable()
export class OutboxWorker implements OnModuleInit {
  private intervalId: NodeJS.Timeout;

  async onModuleInit() {
    this.intervalId = setInterval(() => this.processOutbox(), 100);
  }

  private async processOutbox() {
    const pendingEvents = await this.outboxRepo.find({
      where: { status: 'PENDING' },
      take: 100,
      order: { occurredAt: 'ASC' }
    });

    for (const event of pendingEvents) {
      try {
        await this.kafkaProducer.send({
          topic: this.getTopicForEvent(event.eventType),
          key: event.aggregateId,
          value: JSON.stringify(event.payload)
        });

        event.status = 'PUBLISHED';
        event.publishedAt = new Date();
        await this.outboxRepo.save(event);
      } catch (error) {
        event.retryCount++;
        event.lastError = error.message;
        if (event.retryCount >= 5) {
          event.status = 'FAILED';
          // Send to DLQ
        }
        await this.outboxRepo.save(event);
      }
    }
  }
}
```

---

### Phase 1: Asset Identity & Registration (P0)

#### AO-101: Expand Asset Identity Model

**Current:** Minimal asset properties

**Add:**
```typescript
export class AssetIdentity {
  internalReference: string;        // e.g., "AO-2026-0123"
  externalReference: string | null; // Sponsor's reference
  name: string;
  legalName: string | null;
  assetClass: AssetClass;
  assetSubclass: string | null;     // e.g., "Commercial Office"
  jurisdiction: string;
  country: string;
  primaryCurrency: string;
}
```

**Reference Generation:**
```typescript
generateAssetReference(tenantId: TenantId, year: number, sequence: number): string {
  return `AO-${year}-${String(sequence).padStart(4, '0')}`;
}
```

---

#### AO-102: Asset Class Taxonomy

**Current:** Flat list of 7 asset classes

**Expand to Hierarchical Taxonomy:**

```typescript
type AssetClassHierarchy = {
  primary: AssetClassPrimary;
  secondary: string | null;
  tertiary: string | null;
};

type AssetClassPrimary =
  | 'REAL_ESTATE'
  | 'PRIVATE_CREDIT'
  | 'PRIVATE_EQUITY'
  | 'INFRASTRUCTURE'
  | 'VENTURE_CAPITAL'
  | 'COMMODITIES'
  | 'DIGITAL_ASSETS';

// Example hierarchies:
// REAL_ESTATE → Residential → Multi-Family
// REAL_ESTATE → Commercial → Office → Class A
// PRIVATE_CREDIT → Corporate Loan → Senior Secured
// INFRASTRUCTURE → Energy → Renewable → Solar
```

**Benefits:**
- More granular asset classification
- Better pipeline analytics
- Taxonomy-specific due diligence checklists
- Configurable per tenant

---

#### AO-103: Asset Source & Provenance

**Create:**
```typescript
export class OriginationSource {
  sourceType: 'DIRECT' | 'SPONSOR' | 'BROKER' | 'ADVISOR' | 'MARKETPLACE' | 'PORTFOLIO' | 'REFERRAL' | 'API' | 'PARTNER';
  sourceEntityId: string | null;      // Entity Studio reference
  sourceReference: string | null;     // Their reference
  relationshipManager: string | null; // User ID
  originatedAt: Date;
  submittedBy: string;                // User ID
}
```

---

#### AO-104: Asset Counterparties

**Support Multiple Roles:**
```typescript
export class AssetCounterparty {
  id: string;
  assetId: string;
  tenantId: string;
  role: 'SELLER' | 'BORROWER' | 'OWNER' | 'OPERATOR' | 'GUARANTOR' | 'MANAGER' | 'BROKER' | 'ADVISOR';
  entityId: string;           // Entity Studio reference
  entityName: string;         // Snapshot
  effectiveFrom: Date;
  effectiveTo: Date | null;
}
```

---

### Phase 2: Screening Engine (P0 - NEW)

**Currently Missing - Assets jump from origination to due diligence.**

#### AO-201: Create Screening Aggregate

```typescript
export class AssetScreening {
  id: ScreeningId;
  tenantId: TenantId;
  assetId: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  decision: 'PASS' | 'FAIL' | 'CONDITIONAL' | 'REQUIRES_REVIEW';
  overallScore: number;        // 0-100
  criteriaResults: ScreeningCriteriaResult[];
  screenedBy: string | null;
  screenedAt: Date | null;
  comments: string | null;
}

export type ScreeningCriteriaResult = {
  criterion: ScreeningCriterion;
  result: 'PASS' | 'FAIL' | 'WARNING';
  score: number;
  reason: string | null;
};

export type ScreeningCriterion =
  | 'ASSET_CLASS_ELIGIBLE'
  | 'JURISDICTION_ELIGIBLE'
  | 'MIN_ASSET_VALUE'
  | 'MAX_ASSET_VALUE'
  | 'MIN_EXPECTED_RETURN'
  | 'SPONSOR_ELIGIBLE'
  | 'REGULATORY_COMPLIANT'
  | 'ESG_ALIGNED'
  | 'LIQUIDITY_ACCEPTABLE'
  | 'MANDATE_ALIGNED';
```

**Lifecycle:**
```
Asset Originated
      ↓
Start Screening
      ↓
Evaluate Criteria
      ↓
Calculate Score
      ↓
Make Decision → PASS → Qualified
              → FAIL → Rejected
              → CONDITIONAL → Review
```

---

#### AO-202: Configurable Screening Rules

**Tenant-Specific Investment Mandates:**
```typescript
export class TenantScreeningConfig {
  tenantId: string;
  eligibleAssetClasses: AssetClassPrimary[];
  eligibleJurisdictions: string[];
  minAssetValue: Money;
  maxAssetValue: Money;
  minExpectedReturn: number;        // percent
  requiredSponsorRating: string | null;
  esgMinScore: number | null;
  liquidityRequirements: string | null;
  customCriteria: CustomScreeningRule[];
}
```

---

### Phase 3: Qualification Engine (P0 - NEW)

#### AO-301: Asset Qualification Model

**Purpose:** More detailed assessment than screening - multi-dimensional fit scoring.

```typescript
export class AssetQualification {
  id: QualificationId;
  tenantId: TenantId;
  assetId: string;
  status: 'PENDING' | 'QUALIFIED' | 'NOT_QUALIFIED';
  overallScore: number;              // 0-100
  investmentFitScore: number;        // 0-100
  riskFitScore: number;              // 0-100
  sponsorQualityScore: number;       // 0-100
  liquidityFitScore: number;         // 0-100
  esgScore: number;                  // 0-100
  dataCompletenessScore: number;     // 0-100
  qualifiedBy: string | null;
  qualifiedAt: Date | null;
  reasoning: string | null;
}
```

**Qualification Workflow:**
```
Screening PASS
      ↓
Calculate Multi-Dimensional Scores
      ↓
Weighted Overall Score
      ↓
Score >= Threshold? → QUALIFIED → Due Diligence
                    → NOT_QUALIFIED → Rejected
```

---

### Phase 4: Due Diligence Engine (P1 Enhancement)

#### AO-401: Multi-Category Due Diligence

**Expand from single report to category-based structure:**

```typescript
export enum DueDiligenceCategory {
  COMMERCIAL = 'COMMERCIAL',
  FINANCIAL = 'FINANCIAL',
  LEGAL = 'LEGAL',
  TAX = 'TAX',
  REGULATORY = 'REGULATORY',
  TECHNICAL = 'TECHNICAL',
  OPERATIONAL = 'OPERATIONAL',
  ESG = 'ESG',
  CYBER = 'CYBER',
  INSURANCE = 'INSURANCE',
  MARKET = 'MARKET',
  BLOCKCHAIN = 'BLOCKCHAIN'
}

export class DueDiligenceCategoryReport {
  id: string;
  reportId: string;
  category: DueDiligenceCategory;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'WAIVED';
  assignedTo: string | null;
  reviewer: string | null;
  findings: Finding[];
  completedAt: Date | null;
  mandatory: boolean;
}
```

---

#### AO-402: Due Diligence Checklist Engine

```typescript
export class DueDiligenceChecklist {
  id: string;
  categoryReportId: string;
  items: ChecklistItem[];
}

export class ChecklistItem {
  id: string;
  category: DueDiligenceCategory;
  question: string;
  requirement: string;
  mandatory: boolean;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'WAIVED';
  assignedTo: string | null;
  evidenceRequired: boolean;
  evidenceDocumentIds: string[];     // Document Service references
  response: string | null;
  reviewerComments: string | null;
}
```

---

#### AO-403: Enhanced Finding Model

```typescript
export class DueDiligenceFinding {
  id: string;
  reportId: string;
  category: DueDiligenceCategory;
  title: string;
  description: string;
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  probability: 'LOW' | 'MEDIUM' | 'HIGH';
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  riskScore: number;                  // probability × impact
  recommendation: string | null;
  mitigation: string | null;
  owner: string | null;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'ACCEPTED' | 'WAIVED';
  evidenceDocumentIds: string[];
  createdBy: string;
  createdAt: Date;
  resolvedBy: string | null;
  resolvedAt: Date | null;
}
```

**Business Rule:**
- Cannot complete DD if any `CRITICAL` findings are `OPEN`
- `HIGH` severity findings require explicit waiver or resolution
- Finding resolution history must be audited

---

#### AO-404: Due Diligence Versioning

**Support Multiple DD Cycles:**
```typescript
export class DueDiligenceReport {
  // ... existing fields
  version: number;
  supersedes: string | null;          // Previous report ID
  reopenReason: string | null;
  amendmentHistory: Amendment[];
}
```

**Use Cases:**
- Initial DD completed → Approved → New risk discovered → Re-open DD → Version 2
- Continuous monitoring during holding period

---

### Phase 5: Valuation Engine (P1)

#### AO-501: Replace StubValuationAdapter

**Current:** Simple discounted cash flow stub

**Multi-Provider Architecture:**
```typescript
export interface ValuationProvider {
  readonly providerId: string;
  readonly methodologies: ValuationMethodology[];

  value(input: ValuationInput): Promise<ValuationResult>;
}

// Implementations:
// - InternalModelValuationProvider (DCF, NAV, etc.)
// - ExternalValuerProvider (Cushman & Wakefield, CBRE, etc.)
// - MarketDataProvider (comparable transactions)
// - ManualValuationProvider (user-entered with documentation)
```

---

#### AO-502: Expanded Valuation Methodologies

```typescript
type ValuationMethodology =
  | 'DCF'                    // Discounted Cash Flow
  | 'COMPARABLE_SALES'       // Comparable transactions
  | 'COMPARABLE_COMPANIES'   // Public comps
  | 'INCOME_APPROACH'        // Capitalization of income
  | 'COST_APPROACH'          // Replacement cost
  | 'NAV'                    // Net Asset Value
  | 'CAP_RATE'               // Capitalization rate
  | 'YIELD'                  // Yield-based
  | 'APPRAISAL'              // Third-party appraisal
  | 'MANUAL';                // User-entered
```

---

#### AO-503: Valuation History & Versioning

```typescript
export class AssetValuation {
  id: ValuationId;
  tenantId: TenantId;
  assetId: string;
  version: number;
  methodology: ValuationMethodology;
  fairValue: Money;
  valuationDate: Date;
  effectiveDate: Date;
  valuer: string;                    // Entity or user
  assumptions: ValuationAssumption[];
  confidenceLevel: number;           // 0-100
  confidenceLow: Money;
  confidenceHigh: Money;
  supportingDocumentIds: string[];
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'SUPERSEDED';
  approvedBy: string | null;
  approvedAt: Date | null;
  supersedes: string | null;         // Previous valuation ID
}
```

**Business Rules:**
- Do not overwrite valuations - create new version
- Maintain pointer to "current" valuation
- Historical valuations support mark-to-market tracking

---

### Phase 6: Cash Flow Modeling (P1)

#### AO-601: Enhanced Cash Flow Model

**Expand current model:**
```typescript
export class CashFlowModel extends AggregateRoot {
  // ... existing fields

  // NEW:
  private _scenario: 'BASE_CASE' | 'BULL_CASE' | 'BEAR_CASE' | 'STRESS_CASE';
  private _assumptions: CashFlowAssumption[];
  private _status: 'DRAFT' | 'FINALIZED';

  // Calculations (computed, not stored):
  calculateNPV(): Money;
  calculateIRR(): number;
  calculateXIRR(dates: Date[]): number;
  calculatePaybackPeriod(): number;
  calculateDiscountedPaybackPeriod(): number;
}
```

---

#### AO-602: Scenario Analysis

**Support Multiple Scenarios:**
```typescript
Asset → Valuation → Cash Flow Model
                    ├── Base Case
                    ├── Bull Case
                    ├── Bear Case
                    └── Stress Case
```

**Scenario Assumptions:**
```typescript
export class ScenarioAssumptions {
  revenueGrowthRate: number;
  costInflationRate: number;
  exitMultiple: number;
  terminalGrowthRate: number;
  probabilityWeight: number;         // for expected value calculation
}
```

---

#### AO-603: Financial Calculations

**Implement:**
- **NPV (Net Present Value):** Sum of discounted cash flows
- **IRR (Internal Rate of Return):** Solve for discount rate where NPV = 0
- **XIRR (Extended IRR):** IRR with irregular cash flow dates
- **Yield:** Current income / investment
- **Payback Period:** Time to recover initial investment
- **Discounted Payback:** Payback with discounting
- **Sensitivity Analysis:** Impact of key variable changes

---

### Phase 7: Risk Assessment Engine (P0 - NEW)

**Currently Missing - Critical for institutional investors.**

#### AO-701: Risk Assessment Aggregate

```typescript
export class AssetRiskAssessment {
  id: RiskAssessmentId;
  tenantId: TenantId;
  assetId: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  overallRiskScore: number;          // 0-100 (0 = lowest risk)
  overallRiskRating: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  categoryScores: RiskCategoryScore[];
  risks: Risk[];
  assessedBy: string | null;
  assessedAt: Date | null;
}

export enum RiskCategory {
  MARKET_RISK = 'MARKET_RISK',
  CREDIT_RISK = 'CREDIT_RISK',
  LIQUIDITY_RISK = 'LIQUIDITY_RISK',
  OPERATIONAL_RISK = 'OPERATIONAL_RISK',
  LEGAL_RISK = 'LEGAL_RISK',
  REGULATORY_RISK = 'REGULATORY_RISK',
  SPONSOR_RISK = 'SPONSOR_RISK',
  VALUATION_RISK = 'VALUATION_RISK',
  CONCENTRATION_RISK = 'CONCENTRATION_RISK',
  ESG_RISK = 'ESG_RISK',
  TECHNOLOGY_RISK = 'TECHNOLOGY_RISK'
}

export class Risk {
  id: string;
  category: RiskCategory;
  description: string;
  probability: 'LOW' | 'MEDIUM' | 'HIGH';
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  score: number;                     // probability × impact
  mitigation: string | null;
  owner: string | null;
  status: 'IDENTIFIED' | 'MITIGATING' | 'MITIGATED' | 'ACCEPTED';
}
```

---

#### AO-702: Risk Scoring Matrix

```
              LOW IMPACT   MEDIUM IMPACT   HIGH IMPACT
LOW PROB      1-3          4-6             7-9
MEDIUM PROB   4-6          10-15           16-20
HIGH PROB     7-9          16-20           21-25

Overall Asset Risk Score = Weighted Average of Category Scores
```

---

### Phase 8: Approval Workflow Integration (P0)

#### AO-801: Replace Simple Approval

**Current:**
```typescript
asset.approve(approvedBy: string)  // ❌ Too simplistic
```

**New Architecture:**
```
Asset → Approval Request → Workflow Service
                           ├── Investment Review
                           ├── Risk Review
                           ├── Compliance Review
                           └── Committee Decision
```

---

#### AO-802: Conditional Approvals

```typescript
export class AssetApprovalRequest {
  id: ApprovalRequestId;
  assetId: string;
  tenantId: TenantId;
  status: 'PENDING' | 'IN_REVIEW' | 'CONDITIONALLY_APPROVED' | 'APPROVED' | 'REJECTED';
  submittedBy: string;
  submittedAt: Date;
  conditions: ApprovalCondition[];
  reviewStages: ApprovalReviewStage[];
  finalDecision: 'APPROVED' | 'REJECTED' | null;
  decidedBy: string | null;
  decidedAt: Date | null;
  decisionReason: string | null;
}

export class ApprovalCondition {
  id: string;
  description: string;
  type: 'DOCUMENT_REQUIRED' | 'DD_ITEM' | 'VALUATION_UPDATE' | 'LEGAL_CONFIRMATION' | 'OTHER';
  status: 'PENDING' | 'FULFILLED' | 'WAIVED';
  fulfilledBy: string | null;
  fulfilledAt: Date | null;
  evidence: string | null;
}
```

**Business Rule:**
- Asset status = `APPROVED` only when ALL conditions are fulfilled
- Asset cannot handoff to Deal Studio until unconditional approval

---

### Phase 9: Pipeline Management (P0)

#### AO-901: Pipeline View

```typescript
export class AssetPipeline {
  tenantId: TenantId;
  stages: PipelineStage[];
  totalAssets: number;
  totalValue: Money;
  metrics: PipelineMetrics;
}

export class PipelineStage {
  stage: AssetOriginationStatus;
  assetCount: number;
  totalValue: Money;
  averageDuration: number;           // days
  assets: AssetPipelineItem[];
}

export class PipelineMetrics {
  qualificationRate: number;         // % of originated that qualify
  rejectionRate: number;
  averageDDDuration: number;         // days
  approvalRate: number;
  averageTimeToApproval: number;     // days
  pipelineVelocity: number;          // assets/month
}
```

---

#### AO-902: Pipeline Query API

```http
GET /api/v1/asset-origination/pipeline?tenantId={id}

Response:
{
  "stages": [
    {
      "stage": "ORIGINATED",
      "assetCount": 25,
      "totalValueUSD": "125000000",
      "averageDurationDays": 5.2
    },
    {
      "stage": "SCREENING",
      "assetCount": 12,
      "totalValueUSD": "68000000",
      "averageDurationDays": 2.1
    },
    {
      "stage": "QUALIFIED",
      "assetCount": 8,
      "totalValueUSD": "52000000",
      "averageDurationDays": 3.5
    },
    {
      "stage": "DUE_DILIGENCE",
      "assetCount": 6,
      "totalValueUSD": "45000000",
      "averageDurationDays": 18.7
    },
    {
      "stage": "APPROVED",
      "assetCount": 10,
      "totalValueUSD": "78000000",
      "averageDurationDays": 35.2
    }
  ],
  "metrics": {
    "qualificationRate": 0.68,
    "rejectionRate": 0.15,
    "averageDDDurationDays": 18.7,
    "approvalRate": 0.82,
    "averageTimeToApprovalDays": 35.2
  }
}
```

---

### Phase 10: Asset-to-Deal Handoff (P0)

#### AO-1001: Define AssetApproved Event Contract

**Current Event (Too Minimal):**
```typescript
export class AssetApproved extends DomainEvent {
  constructor(
    public readonly assetId: string,
    public readonly tenantId: string,
    public readonly approvedBy: string,
  ) {
    super();
  }
}
```

**Enhanced Event:**
```typescript
export class AssetApproved extends DomainEvent {
  eventId: string;
  eventVersion: number;
  assetId: string;
  tenantId: string;
  assetClass: AssetClass;
  assetSubclass: string | null;
  sponsorId: string;
  sponsorName: string;                // snapshot
  currentValuation: Money;
  valuationMethodology: ValuationMethodology;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDiligenceRating: DDRating;
  jurisdictions: string[];
  approvalRequestId: string;
  approvedBy: string;
  approvedAt: Date;
  correlationId: string;
  causationId: string | null;
  metadata: Record<string, any>;
}
```

---

#### AO-1002: Handoff Workflow

**Two Supported Patterns:**

**Pattern A - Event-Driven (Automatic Suggestion):**
```
AssetApproved Event
      ↓
    Kafka
      ↓
Deal Studio Listener
      ↓
Create Draft Deal
      ↓
Notify User
```

**Pattern B - Explicit User Action:**
```
User in Asset Origination UI
      ↓
Click "Create Deal"
      ↓
POST /deals (Deal Studio API)
      ↓
Create Deal with Asset Reference
```

**Recommended:** Support BOTH
- Event creates a "suggestion" in Deal Studio
- User explicitly confirms and initiates deal structuring

---

#### AO-1003: Handoff State Management

```typescript
export class AssetHandoff {
  id: string;
  assetId: string;
  tenantId: string;
  dealId: string | null;
  status: 'READY' | 'HANDED_OFF' | 'DEAL_CREATED';
  handedOffAt: Date | null;
  handedOffBy: string | null;
}
```

**Asset Status Transition:**
```
APPROVED → HANDED_OFF_TO_DEAL (terminal state in Asset Origination)
```

**Business Rule:**
- Asset Origination owns the asset until handoff
- Deal Studio owns the asset after handoff
- Asset cannot be modified in Origination after handoff

---

### Phase 11: Document Integration (P1)

#### AO-1101: Asset Document References

**Do NOT store files directly - integrate with Document Service**

```typescript
export class AssetDocumentReference {
  id: string;
  assetId: string;
  tenantId: string;
  documentId: string;                // Document Service ID
  documentType: AssetDocumentType;
  category: string;
  name: string;
  uploadedBy: string;
  uploadedAt: Date;
  required: boolean;
  verified: boolean;
  verifiedBy: string | null;
  verifiedAt: Date | null;
}

export enum AssetDocumentType {
  TEASER = 'TEASER',
  INVESTMENT_MEMO = 'INVESTMENT_MEMO',
  FINANCIAL_STATEMENTS = 'FINANCIAL_STATEMENTS',
  VALUATION_REPORT = 'VALUATION_REPORT',
  LEGAL_DOCUMENT = 'LEGAL_DOCUMENT',
  TITLE_DOCUMENT = 'TITLE_DOCUMENT',
  INSURANCE = 'INSURANCE',
  TECHNICAL_REPORT = 'TECHNICAL_REPORT',
  ESG_REPORT = 'ESG_REPORT',
  DD_EVIDENCE = 'DD_EVIDENCE',
  APPRAISAL = 'APPRAISAL',
  OTHER = 'OTHER'
}
```

---

#### AO-1102: Required Documents by Asset Class

```typescript
export class AssetClassDocumentRequirements {
  assetClass: AssetClass;
  requiredDocuments: AssetDocumentType[];
  conditionalDocuments: ConditionalDocumentRule[];
}

// Example:
{
  assetClass: 'REAL_ESTATE',
  requiredDocuments: [
    'TITLE_DOCUMENT',
    'VALUATION_REPORT',
    'INSURANCE'
  ],
  conditionalDocuments: [
    {
      condition: 'hasLease',
      requiredDocuments: ['LEASE_AGREEMENT']
    }
  ]
}
```

**Validation:**
- Cannot approve asset if required documents are missing
- Can flag missing documents in pipeline view

---

### Phase 12: Lifecycle History & Audit (P0)

#### AO-1201: Asset Lifecycle History

```typescript
export class AssetLifecycleHistory {
  id: string;
  assetId: string;
  tenantId: string;
  previousStatus: AssetOriginationStatus;
  newStatus: AssetOriginationStatus;
  transitionReason: string | null;
  changedBy: string;
  changedAt: Date;
  metadata: Record<string, any>;
}
```

**Query:**
```http
GET /assets/{id}/timeline

Response:
[
  {
    "timestamp": "2026-01-15T10:00:00Z",
    "status": "ORIGINATED",
    "actor": "user-123",
    "action": "Asset originated",
    "details": { "source": "SPONSOR" }
  },
  {
    "timestamp": "2026-01-16T14:30:00Z",
    "status": "SCREENING",
    "actor": "system",
    "action": "Screening started",
    "details": {}
  },
  {
    "timestamp": "2026-01-17T09:15:00Z",
    "status": "QUALIFIED",
    "actor": "user-456",
    "action": "Asset qualified",
    "details": { "score": 87 }
  }
  // ... etc.
]
```

---

#### AO-1202: Comprehensive Audit Trail

**Track ALL changes:**
```typescript
export class AssetAuditLog {
  id: string;
  assetId: string;
  tenantId: string;
  entityType: 'Asset' | 'DueDiligence' | 'Valuation' | 'CashFlowModel' | 'RiskAssessment';
  entityId: string;
  action: 'CREATED' | 'UPDATED' | 'DELETED' | 'APPROVED' | 'REJECTED';
  field: string | null;
  oldValue: any;
  newValue: any;
  changedBy: string;
  changedAt: Date;
  reason: string | null;
  correlationId: string;
}
```

---

### Phase 13: Security & Multi-Tenancy (P0)

#### AO-1301: Tenant Isolation Enforcement

**Repository Pattern:**
```typescript
async findById(id: AssetId, tenantId: TenantId): Promise<Asset | null> {
  const orm = await this.repo.findOne({
    where: {
      id: id.value,
      tenantId: tenantId.value  // ✅ Always filter by tenant
    }
  });
  // ...
}
```

**Database-Level:**
- All tables have `tenantId` column
- All queries include `WHERE tenantId = $1`
- Postgres Row Level Security (optional additional layer)

---

#### AO-1302: Role-Based Access Control

**Suggested Roles:**
```typescript
enum AssetOriginationRole {
  ORIGINATION_ANALYST = 'ORIGINATION_ANALYST',
  ORIGINATION_MANAGER = 'ORIGINATION_MANAGER',
  DUE_DILIGENCE_ANALYST = 'DUE_DILIGENCE_ANALYST',
  RISK_ANALYST = 'RISK_ANALYST',
  VALUATION_ANALYST = 'VALUATION_ANALYST',
  LEGAL_REVIEWER = 'LEGAL_REVIEWER',
  COMPLIANCE_REVIEWER = 'COMPLIANCE_REVIEWER',
  INVESTMENT_COMMITTEE = 'INVESTMENT_COMMITTEE',
  APPROVER = 'APPROVER',
  ADMINISTRATOR = 'ADMINISTRATOR',
  VIEWER = 'VIEWER'
}
```

**Permission Matrix:**
| Role | Create Asset | Screening | DD | Valuation | Risk | Approve | Reject |
|------|--------------|-----------|----|-----------| -----|---------|--------|
| Analyst | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manager | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approver | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

---

### Phase 14: API Completion (P1)

#### AO-1401: Complete Command API

```http
# Asset Lifecycle
POST   /api/v1/assets/drafts
POST   /api/v1/assets
PUT    /api/v1/assets/{id}

# Screening
POST   /api/v1/assets/{id}/screening/start
POST   /api/v1/assets/{id}/screening/complete

# Qualification
POST   /api/v1/assets/{id}/qualify

# Due Diligence
POST   /api/v1/assets/{id}/due-diligence/start
POST   /api/v1/assets/{id}/due-diligence/submit
POST   /api/v1/assets/{id}/due-diligence/complete
POST   /api/v1/assets/{id}/due-diligence/findings
PUT    /api/v1/assets/{id}/due-diligence/findings/{findingId}

# Valuation
POST   /api/v1/assets/{id}/valuation
POST   /api/v1/assets/{id}/valuation/approve

# Risk Assessment
POST   /api/v1/assets/{id}/risk-assessment/start
POST   /api/v1/assets/{id}/risk-assessment/complete
POST   /api/v1/assets/{id}/risk-assessment/risks

# Approval
POST   /api/v1/assets/{id}/approval/submit
POST   /api/v1/assets/{id}/approve
POST   /api/v1/assets/{id}/reject
POST   /api/v1/assets/{id}/approval/conditions/{conditionId}/fulfill

# State Management
POST   /api/v1/assets/{id}/hold
POST   /api/v1/assets/{id}/resume
POST   /api/v1/assets/{id}/withdraw

# Handoff
POST   /api/v1/assets/{id}/handoff-to-deal
```

---

#### AO-1402: Complete Query API

```http
# Asset Queries
GET    /api/v1/assets
GET    /api/v1/assets/{id}
GET    /api/v1/assets/{id}/summary
GET    /api/v1/assets/{id}/timeline

# Screening
GET    /api/v1/assets/{id}/screening

# Qualification
GET    /api/v1/assets/{id}/qualification

# Due Diligence
GET    /api/v1/assets/{id}/due-diligence
GET    /api/v1/assets/{id}/due-diligence/findings
GET    /api/v1/assets/{id}/due-diligence/checklist

# Valuation
GET    /api/v1/assets/{id}/valuations
GET    /api/v1/assets/{id}/valuations/current
GET    /api/v1/assets/{id}/valuations/{valuationId}

# Cash Flow Models
GET    /api/v1/assets/{id}/cash-flow-models
GET    /api/v1/assets/{id}/cash-flow-models/{modelId}
GET    /api/v1/assets/{id}/cash-flow-models/{modelId}/metrics

# Risk Assessment
GET    /api/v1/assets/{id}/risk-assessment
GET    /api/v1/assets/{id}/risk-assessment/risks

# Documents
GET    /api/v1/assets/{id}/documents

# Approval
GET    /api/v1/assets/{id}/approval

# Pipeline
GET    /api/v1/pipeline
GET    /api/v1/pipeline/metrics
```

---

### Phase 15: Advanced Search & Filtering (P1)

```http
GET /api/v1/assets?filters={complex}

Example:
{
  "assetClass": "REAL_ESTATE",
  "assetSubclass": "Commercial Office",
  "jurisdiction": "Spain",
  "valuationMin": { "amount": "10000000", "currency": "EUR" },
  "status": ["QUALIFIED", "DUE_DILIGENCE"],
  "riskRating": ["LOW", "MEDIUM"],
  "originatedFrom": "2026-01-01",
  "originatedTo": "2026-08-31"
}
```

---

### Phase 16: Observability (P1)

#### AO-1601: Structured Logging

**Every log entry must include:**
```typescript
{
  tenantId: string;
  assetId: string;
  commandId: string;
  correlationId: string;
  actorId: string;
  traceId: string;
  timestamp: string;
  level: string;
  message: string;
}
```

---

#### AO-1602: Metrics

**Track:**
- Assets originated (counter)
- Assets qualified (counter)
- Assets rejected (counter)
- Rejection reasons (counter with labels)
- DD duration (histogram)
- Approval duration (histogram)
- Pipeline value by stage (gauge)
- Event publishing failures (counter)
- Command failures (counter)
- Query latency (histogram)

**Dashboards:**
- Origination funnel (originated → qualified → DD → approved)
- Pipeline value over time
- Average time in each stage
- Rejection rate by reason
- Asset class distribution

---

### Phase 17: Testing Strategy (P0)

#### AO-1701: Domain Aggregate Tests

```typescript
describe('Asset Aggregate', () => {
  it('should prevent approval without valuation');
  it('should prevent approval of rejected asset');
  it('should prevent invalid state transitions');
  it('should prevent modification after handoff');
  it('should track version on each change');
  it('should emit domain events');
  it('should enforce business invariants');
});

describe('DueDiligenceReport', () => {
  it('should prevent completion without all mandatory items');
  it('should prevent double completion');
  it('should block approval if critical findings are open');
});
```

---

#### AO-1702: Integration Tests

```typescript
describe('Asset Origination Integration', () => {
  it('should persist asset with transactional outbox');
  it('should publish events to Kafka');
  it('should enforce tenant isolation');
  it('should handle optimistic locking conflicts');
  it('should rollback on event publishing failure');
});
```

---

## Priority Matrix

### P0 - Immediate (Blocks Production)
- ✅ **AO-000:** Remove `valuationUpdated` as lifecycle state
- ✅ **AO-001:** Fix hardcoded BBB rating
- ✅ **AO-002:** Redesign asset lifecycle
- ✅ **AO-003:** Complete CashFlowModel integration
- ✅ **AO-004:** Transactional outbox
- ✅ **AO-101:** Expand asset identity
- ✅ **AO-103:** Asset source model
- ✅ **AO-201-202:** Screening engine
- ✅ **AO-301-302:** Qualification engine
- ✅ **AO-701-702:** Risk assessment engine
- ✅ **AO-801-802:** Approval workflow
- ✅ **AO-901-902:** Pipeline management
- ✅ **AO-1001-1003:** Deal handoff
- ✅ **AO-1201-1202:** Audit trail
- ✅ **AO-1301-1302:** Security
- ✅ **AO-1701:** Domain tests

### P1 - Institutional Grade (3-6 months)
- **AO-102:** Asset class taxonomy
- **AO-104:** Counterparties
- **AO-401-404:** Enhanced DD engine
- **AO-501-503:** Valuation enhancement
- **AO-601-603:** Cash flow modeling
- **AO-1101-1102:** Document integration
- **AO-1401-1402:** Complete APIs
- **AO-1601-1602:** Observability
- **AO-1702:** Integration tests

### P2 - Advanced Intelligence (Future)
- AI-powered asset screening
- Automated document extraction
- AI due diligence assistant
- Automated risk scoring
- Market data integration
- External valuation provider integration
- Comparable asset analysis
- Sponsor intelligence
- Portfolio concentration analysis
- Predictive valuation models

---

## Definition of Done

The Asset Origination microservice is **Production-Ready V1** when:

### ✅ Functional Completeness
- [ ] Complete asset lifecycle from DRAFT → HANDED_OFF_TO_DEAL
- [ ] Multi-stage screening, qualification, DD, valuation, risk assessment
- [ ] No hardcoded placeholders (valuation, DD rating, etc.)
- [ ] CashFlowModel fully integrated with persistence, commands, queries
- [ ] Approval workflow with conditional approval support
- [ ] Asset-to-Deal handoff with event integration

### ✅ Data Integrity
- [ ] Transactional outbox (no InMemoryOutbox)
- [ ] Optimistic locking enforced
- [ ] Tenant isolation at repository level
- [ ] Audit trail for all changes
- [ ] Lifecycle history tracking

### ✅ Integration
- [ ] Publishes events to Kafka
- [ ] Consumes events from Entity Studio (sponsor changes)
- [ ] Integrates with Document Service (references, not storage)
- [ ] Integrates with Compliance OS (regulatory checks)

### ✅ Security
- [ ] Tenant isolation enforced
- [ ] Role-based access control
- [ ] No cross-tenant data leakage
- [ ] Audit trail for compliance

### ✅ Observability
- [ ] Structured logging with correlation IDs
- [ ] Metrics for pipeline health
- [ ] Distributed tracing support
- [ ] Alerting on critical failures

### ✅ Testing
- [ ] Unit tests for all aggregates
- [ ] Integration tests for persistence
- [ ] Event publishing tests
- [ ] Multi-tenancy tests
- [ ] Optimistic locking conflict tests
- [ ] End-to-end lifecycle tests

---

## Migration Strategy

### Phase 0: Preparation
1. **Backup existing data**
2. **Create staging environment**
3. **Run parallel systems during migration**

### Phase 1: Schema Migration
1. **Add new status column** (nullable, default null)
2. **Add lifecycle history table**
3. **Add outbox table**
4. **Add new entity tables** (screening, qualification, risk, etc.)

### Phase 2: Data Migration
1. **Map old statuses to new:**
   - `originated` → `ORIGINATED`
   - `underDueDiligence` → `DUE_DILIGENCE`
   - `dueDiligenceCompleted` → `VALUATION` (if no valuation) or `RISK_REVIEW`
   - `valuationUpdated` → `RISK_REVIEW` (transitional mapping)
   - `approved` → `APPROVED`
   - `rejected` → `REJECTED`

2. **Backfill lifecycle history** from audit logs

### Phase 3: Code Deployment
1. **Deploy new code** (reads both old and new status)
2. **Verify writes go to new status column**
3. **Monitor for errors**

### Phase 4: Cutover
1. **Stop writes to old column**
2. **Remove old status column** (after validation period)
3. **Update all queries to use new status**

---

## Conclusion

This implementation plan transforms Asset Origination from an MVP into an institutional-grade asset pipeline management system. The phased approach ensures:

1. **Critical issues fixed first** (P0)
2. **Production-ready foundation** (P0)
3. **Institutional features added** (P1)
4. **AI-powered intelligence later** (P2)

**Estimated Timeline:**
- **P0 (Critical Fixes):** 6-8 weeks
- **P1 (Institutional Grade):** 3-6 months
- **P2 (Advanced Intelligence):** 12+ months

**Next Steps:**
1. Review and approve this plan
2. Prioritize P0 tasks
3. Create detailed technical specifications for each task
4. Begin implementation with AO-000 through AO-004
5. Establish testing and deployment pipeline
6. Monitor progress with regular checkpoints

---

**Document Version:** 1.0  
**Last Updated:** 2026-08-30  
**Status:** Draft - Pending Approval
