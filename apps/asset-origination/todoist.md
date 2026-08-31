# Asset Origination - Implementation Todo List

Based on the comprehensive implementation plan and current codebase analysis. Status: in-progress as of 2026-08-31.

---

## Phase 0 — Critical Fixes & Foundation (P0 - Immediate)

### AO-000: Remove `valuationUpdated` as Lifecycle State
- **Problem**: `valuationUpdated` is treated as an `AssetStatus`, but it's an event/action, not a business state
- **Solution**: 
  - Remove `valuationUpdated` from `AssetOriginationStatus` enum (already defined in shared-kernel)
  - Keep `ValuationUpdated` as a domain event (already exists)
  - Update `Asset.updateValuation()` to NOT change status
  - Asset status should remain `dueDiligenceCompleted` after valuation
  - Approval logic should check for valuation existence, not status
- **Files to Change**:
  - `libs/shared-kernel/src/value-objects/asset-value-objects.ts` ✅ (already has full enum)
  - `apps/asset-origination/src/domain/aggregates/asset.aggregate.ts`
  - `apps/asset-origination/src/application/commands/approve-asset.command.ts`
- **Impact**: Breaking change - requires database migration

### AO-001: Fix Hardcoded BBB Rating Placeholder
- **Problem**: `Asset.completeDueDiligence()` calls `_ratingPlaceholder()` which always returns `'BBB'`
- **Solution**:
  - Remove `_ratingPlaceholder` method entirely
  - `CompleteDueDiligenceCommand` should accept `dueDiligenceReportId`
  - Command handler must:
    1. Fetch the `DueDiligenceReport` by ID
    2. Validate report exists and belongs to tenant
    3. Validate report status is `'completed'`
    4. Extract the actual `rating` from the report
    5. Pass that rating to the aggregate
  - Update aggregate signature: `completeDueDiligence(rating: DDRating, completedBy: string)`
- **Files to Change**:
  - `apps/asset-origination/src/domain/aggregates/asset.aggregate.ts`
  - `apps/asset-origination/src/application/commands/complete-due-diligence.command.ts`
  - `apps/asset-origination/src/application/commands/complete-due-diligence.command.handler.ts`

### AO-002: Redesign Asset Lifecycle States
- **Current States** (already updated in shared-kernel):
  ```
  DRAFT | ORIGINATED | SCREENING | QUALIFIED | DUE_DILIGENCE | VALUATION | RISK_REVIEW | READY_FOR_APPROVAL | APPROVED | REJECTED | ON_HOLD | WITHDRAWN | HANDED_OFF_TO_DEAL
  ```
- **Transition Rules** (VALID_TRANSITIONS map already in asset.aggregate.ts):
  ```
  DRAFT → ORIGINATED
  ORIGINATED → SCREENING | REJECTED | WITHDRAWN
  SCREENING → QUALIFIED | REJECTED | WITHDRAWN
  QUALIFIED → DUE_DILIGENCE | REJECTED | WITHDRAWN
  DUE_DILIGENCE → VALUATION | ON_HOLD | REJECTED | WITHDRAWN
  VALUATION → RISK_REVIEW | ON_HOLD | REJECTED | WITHDRAWN
  RISK_REVIEW → READY_FOR_APPROVAL | ON_HOLD | REJECTED | WITHDRAWN
  READY_FOR_APPROVAL → APPROVED | REJECTED | WITHDRAWN
  APPROVED → HANDED_OFF_TO_DEAL
  REJECTED: [] (terminal)
  ON_HOLD → DUE_DILIGENCE | VALUATION | RISK_REVIEW | WITHDRAWN
  WITHDRAWN: [] (terminal)
  HANDED_OFF_TO_DEAL: [] (terminal)
  ```
- **Implementation**: 
  - VALID_TRANSITIONS map already defined in asset.aggregate.ts ✅
  - Add transition validation methods in aggregate
  - Add transition metadata (reason, actor, timestamp)
- **Files to Change**:
  - `apps/asset-origination/src/domain/aggregates/asset.aggregate.ts` ✅ (VALID_TRANSITIONS defined)
  - Add transition validation methods

### AO-003: Implement Lifecycle Commands (Progress Update)
- **Current state**: The aggregate already has a solid foundation for lifecycle management:
  - ✅ `VALID_TRANSITIONS` map defined with all 13 states (DRAFT through HANDED_OFF_TO_DEAL)
  - ✅ `canTransitionTo(newStatus)` method for transition validation
  - ✅ `transitionTo(newStatus, reason, actor)` method that performs transition, raises `AssetStatusChanged` event, and increments version
  - ✅ 7 of 19 lifecycle commands already implemented in aggregate:
    - `startScreening(actor)` - ORIGINATED → SCREENING
    - `qualify(actor)` - QUALIFIED → DUE_DILIGENCE (status check needed)
    - `startDueDiligence(actor)` - QUALIFIED → DUE_DILIGENCE
    - `completeDueDiligence(rating, actor)` - DUE_DILIGENCE → VALUATION with rating
    - `updateValuation(valuation, actor)` - Does NOT change status (AO-000 addressed)
    - `startRiskReview(actor)` - VALUATION → RISK_REVIEW
    - `completeRiskReview(actor)` - RISK_REVIEW → READY_FOR_APPROVAL
    - `submitForApproval(actor)` - READY_FOR_APPROVAL, checks valuation & DD rating exist
  - ⚠️ Remaining 12 commands to add: `createAssetDraft()`, `originateAsset()`, `completeScreening()`, `startValuation()`, `completeValuation()`, `approveAsset()`, `rejectAsset()`, `putAssetOnHold()`, `resumeAsset()`, `withdrawAsset()`, `handoffToDealStudio()`
- **Files to Change**:
  - `apps/asset-origination/src/domain/aggregates/asset.aggregate.ts` - Add remaining transition methods
  - `apps/asset-origination/src/application/commands/` - Update handlers to use new status enum

---

## Phase 1 — Asset Lifecycle Redesign (Already Started)

### AO-101: Replace current AssetStatus lifecycle ✅ (in progress)
- Already defined new `AssetOriginationStatus` enum in shared-kernel
- Already defined `VALID_TRANSITIONS` map in asset.aggregate.ts
- Need to implement all transition methods in aggregate

### AO-102: Create AssetLifecycleHistory ✅ (partially implemented)
- `AssetLifecycleHistory` entity already exists in `src/domain/entities/`
- Fields: id, assetId, tenantId, previousStatus, newStatus, transitionReason, changedBy, changedAt, metadata
- Need to add repository integration and audit queries

### AO-103: Lifecycle commands ✅ (in progress)
- Need to implement all 19 lifecycle commands listed above

---

## Phase 2 — Asset Identity & Registration

### AO-201: Expand Asset identity model
- **Current model is too minimal**
- **Add AssetIdentity with fields**:
  - assetId, tenantId, externalReference, internalReference
  - name, legalName, assetClass, assetSubclass
  - jurisdiction, country, currency, source
- **Tasks**:
  - Internal asset reference generation
  - External reference support
  - Asset class taxonomy
  - Asset subclass taxonomy
  - Country/jurisdiction validation

### AO-202: Asset class taxonomy
- **Current classes**: realEstate, privateEquity, privateCredit, infrastructure, ventureCapital, commodities, digitalAssets
- **Expand taxonomy**:
  - Real Estate: Residential, Commercial, Industrial, Hospitality, Retail, Land, Mixed Use
  - Private Credit: Corporate Loan, Asset-backed Loan, Real Estate Loan, Trade Finance, Receivables Financing
  - Infrastructure: Energy, Transport, Telecom, Utilities, Digital Infrastructure
  - Private Equity: Buyout, Growth, Venture, Secondary
- **Tasks**:
  - Asset taxonomy value objects
  - Validation rules
  - Configurable tenant taxonomy

### AO-203: Asset source model
- **Create OriginationSource type**:
  - Types: DIRECT, SPONSOR, BROKER, ADVISOR, MARKETPLACE, PORTFOLIO, REFERRAL, INBOUND, API, PARTNER
  - Fields: sourceId, sourceType, sourceEntityId, sourceReference, originatedAt, submittedBy, relationshipManager
- **Tasks**: Define source types and integration

---

## Phase 3 — Sponsor & Counterparty Management

### AO-301: Sponsor reference integration
- **Current implementation stores only**: sponsorId
- **Add SponsorReference entity**:
  - entityId, name, jurisdiction, relationshipStatus, riskRating, verificationStatus
- **Tasks**:
  - Entity Studio integration
  - Sponsor existence validation
  - Sponsor status validation
  - Sponsor risk snapshot
  - Event handling for sponsor changes

### AO-302: Asset counterparties
- **Support counterparts**: Seller, Borrower, Owner, Operator, Guarantor, Manager, Broker, Advisor
- **Create AssetCounterparty entity**:
  - Role assignment
  - Entity references
  - Effective dates
  - Counterparty risk reference

---

## Phase 4 — Asset Screening Engine ⚠️ NEW

### AO-401: Create screening aggregate/entity
- **Create AssetScreening entity** with categories:
  - Eligibility, Geography, Asset Class, Size, Sponsor, Liquidity, Regulatory, Preliminary Risk
- **Tasks**:
  - Domain model
  - ORM entity
  - Repository
  - Query endpoint

### AO-402: Screening criteria
- **Support criteria**:
  - Asset class eligibility
  - Jurisdiction eligibility
  - Minimum asset value
  - Maximum asset value
  - Minimum expected return
  - Sponsor eligibility
  - Regulatory restrictions
  - ESG restrictions
  - Liquidity requirements
  - Tenant-specific investment mandates

### AO-403: Screening decision
- **Implement decision enum**: PASS, FAIL, CONDITIONAL, REQUIRES_REVIEW
- **Fields**: screeningId, assetId, criteriaResults, decision, score, comments, reviewedBy, reviewedAt
- **Tasks**: Implement screening decision logic

---

## Phase 5 — Asset Qualification ⚠️ NEW

### AO-501: Qualification model
- **Create AssetQualification entity** with criteria:
  - Investment thesis fit, Asset class fit, Geographic fit, Ticket size fit
  - Expected return fit, Risk appetite fit, Liquidity fit, Sponsor quality fit

### AO-502: Qualification scoring
- **Create scoring framework** with scores 0-100:
  - Investment Fit, Risk Score, Sponsor Score, Liquidity Score, ESG Score, Data Completeness
- **Calculate**: Overall Qualification Score
- **Tasks**:
  - Scoring engine
  - Configurable weights
  - Tenant-specific thresholds
  - Score explanation
  - Score history

---

## Phase 6 — Due Diligence Engine ⚠️ CRITICAL

### AO-601: Due diligence categories
- **Support categories**: Commercial, Financial, Legal, Tax, Regulatory, Technical, Operational, ESG, Cyber, Insurance, Market, Blockchain / Digital Asset
- **Tasks**:
  - Category entity
  - Category status
  - Category owner
  - Category reviewer

### AO-602: Due diligence checklist engine
- **Create DueDiligenceChecklist entity** with items:
  - id, category, question, requirement, mandatory, status, assignedTo, evidenceRequired
- **Statuses**: NOT_STARTED, IN_PROGRESS, SUBMITTED, APPROVED, REJECTED, WAIVED
- **Tasks**:
  - Category entity
  - Category status
  - Category owner
  - Category reviewer

### AO-603: Due diligence findings
- **Expand Finding entity** to DueDiligenceFinding with fields:
  - findingId, category, title, description, severity, probability, impact, recommendation, owner, status, evidence
- **Severity**: INFO, LOW, MEDIUM, HIGH, CRITICAL
- **Tasks**: Expand finding entity and integration

### AO-604: Due diligence workflow
- **Implement workflow**: DRAFT → IN_PROGRESS → SUBMITTED → IN_REVIEW → (CHANGES_REQUESTED → re-loop) → COMPLETED
- **Tasks**: Implement state machine for DD workflow

### AO-605: Fix current Due Diligence domain issue ✅
- **Problem**: `Asset.completeDueDiligence()` uses `_ratingPlaceholder()` returning always 'BBB'
- **Solution**: Already identified in AO-001, need to implement the fix
- **Tasks**:
  - Remove `_ratingPlaceholder`
  - Retrieve actual completed report rating
  - Validate report exists
  - Validate report status is completed
  - Validate mandatory DD categories
  - Validate critical findings resolution
  - Store rating snapshot on Asset

### AO-606: Multiple Due Diligence reports ⚠️ NEW
- **Support versioned DD reports**:
  - Asset → DD Version 1, DD Version 2, DD Version 3
  - Version number, superseded reports, re-open workflow, amendment history, comparison
- **Tasks**: Implement versioning for DD reports

---

## Phase 7 — Valuation Engine ⚠️ CRITICAL

### AO-701: Replace StubValuationAdapter ✅ (partially)
- **Current**: `stub-valuation.adapter.ts` exists as placeholder
- **Solution**: Create ValuationProvider interface
- **Interface**:
  ```
  Asset → Valuation Request
  │
  ├── Internal Model
  ├── External Valuer
  ├── Market Data Provider
  └── Manual Valuation
  ```
- **Files to Change**:
  - Replace/rename `stub-valuation.adapter.ts`
  - Create valuation provider abstraction

### AO-702: Valuation methodologies
- **Support methodologies**: dcf, comps, nav, costApproach, incomeApproach
- **Additional**: comparable transactions, comparable companies, NAV, cap rate, yield based, appraisal

### AO-703: Valuation model ✅ (partially)
- **Expand AssetValuation entity** to include:
  - valuationId, assetId, methodology, fairValue, currency, valuationDate, effectiveDate
  - valuer, assumptions, confidenceLevel, supportingDocuments, status
- **Implementation**: Already has basic structure, needs expansion

### AO-704: Valuation history ✅ (partially)
- **Do not overwrite valuations**
- **Implement**:
  - Asset → Valuation 1, Valuation 2, Valuation 3 → Current Valuation
  - Historical persistence
  - Current valuation pointer
  - Approval
  - Superseding
  - Valuation comparison
- **Tasks**: Implement versioned valuations

---

## Phase 8 — Cash Flow Modeling ⚠️ ORPHANED

### AO-801: Complete CashFlowModel persistence
- **Current**: CashFlowModel aggregate exists but is orphaned
- **Create**:
  - Cash flow ORM entity
  - Cash flow repository
  - Persistence mapper
  - Repository token
  - Database migration

### AO-802: Cash flow model commands ✅ (in progress)
- **Implement commands**:
  - CreateCashFlowModel
  - UpdateCashFlowModel
  - AddCashFlow
  - UpdateCashFlow
  - DeleteCashFlow
  - SetDiscountRate
  - CloneCashFlowModel
  - FinalizeCashFlowModel

### AO-803: Cash flow model validation ✅ (in progress)
- **Validate**:
  - Positive term periods
  - Unique periods
  - Currency consistency
  - No invalid discount rate
  - Period sequence
  - Required initial investment
  - Complete model

### AO-804: Cash flow calculations ✅ (in progress)
- **Implement calculations**:
  - NPV, IRR, XIRR, Yield, Payback period, Discounted payback
  - Sensitivity analysis

### AO-805: Scenario support ✅ (in progress)
- **Add scenarios**: BASE_CASE, BULL_CASE, BEAR_CASE, STRESS_CASE
- **Tasks**:
  - Scenario assumptions
  - Scenario-specific cash flows
  - Scenario comparison
  - Scenario results

---

## Phase 9 — Asset Risk Assessment ⚠️ NEW

### AO-901: Risk Assessment aggregate
- **Create AssetRiskAssessment entity** with categories:
  - Market Risk, Credit Risk, Liquidity Risk, Operational Risk
  - Legal Risk, Regulatory Risk, Sponsor Risk, Valuation Risk
  - Concentration Risk, ESG Risk, Technology Risk

### AO-902: Risk scoring
- **Implement**: Likelihood × Impact = Risk Score
- **Support levels**: LOW, MEDIUM, HIGH, CRITICAL

### AO-903: Risk register ✅ (in progress)
- **Create Risk entity** with fields:
  - Risk ID, Category, Description, Probability, Impact, Score, Mitigation, Owner, Status

---

## Phase 10 — Asset Document Integration ⚠️ NEW

### AO-1001: Asset document references
- **Integrate with Document Service** (do not store files directly)
- **Create AssetDocumentReference entity** with document types:
  - Teaser, Investment Memorandum, Financial Statements, Valuation Report
  - Legal Documents, Asset Title, Insurance, Technical Report, ESG Report, Due Diligence Evidence

### AO-1002: Document requirements ✅ (in progress)
- **Support document rules by asset class**:
  - Real Estate: Title, Valuation, Lease Data, Insurance
  - Private Credit: Borrower Financials, Loan Agreement, Collateral, Credit Assessment
- **Tasks**:
  - Required document templates
  - Missing document validation
  - Document verification status

---

## Phase 11 — Approval Workflow ⚠️ NEW

### AO-1101: Remove simplistic approval model
- **Current**: `asset.approve(approvedBy)` - too simplistic
- **Replace with**: Integration to Approval/Workflow service
- **Structure**:
  - Asset → Approval Request
  - │
  ├── Investment Review
  ├── Risk Review
  ├── Compliance Review
  └── Final Decision

### AO-1102: Asset approval states ✅ (in progress)
- **Support states**: NOT_SUBMITTED, PENDING, IN_REVIEW, CONDITIONALLY_APPROVED, APPROVED, REJECTED

### AO-1103: Conditional approval ✅ (in progress)
- **Allow conditions**: Obtain Document, Complete DD, Update Valuation, Legal Confirmation
- **Rule**: Asset should not move to final handoff until conditions are resolved

---

## Phase 12 — Asset Pipeline Management ⚠️ NEW

### AO-1201: Pipeline stages ✅ (in progress)
- **Create pipeline stages**:
  - LEADS → ORIGINATED → SCREENING → QUALIFIED → DUE_DILIGENCE → VALUATION → RISK_REVIEW → APPROVAL → APPROVED → DEAL_STUDIO

### AO-1202: Pipeline query API ✅ (in progress)
- **Implement**: GET /assets/pipeline
- **Response format**:
  ```
  ORIGINATED: 25
  SCREENING: 12
  QUALIFIED: 8
  DUE_DILIGENCE: 6
  VALUATION: 4
  RISK_REVIEW: 3
  APPROVAL: 2
  APPROVED: 10
  ```

### AO-1203: Pipeline metrics ✅ (in progress)
- **Track metrics**:
  - Assets originated
  - Qualification rate
  - Rejection rate
  - Average DD duration
  - Approval rate
  - Average time to approval
  - Assets by class
  - Assets by jurisdiction
  - Pipeline value

---

## Phase 13 — Deal Studio Handoff ⚠️ NEW

### AO-1301: Create Asset-to-Deal handoff workflow
- **When asset becomes approved**:
  - Asset Origination → Asset Approved → Ready for Deal Structuring → Create Deal Request → Deal Studio

### AO-1302: Define AssetApproved event contract ✅ (in progress)
- **Current event is too minimal**
- **Recommended AssetApproved event**:
  - eventId, eventVersion, assetId, tenantId, assetClass, sponsorId
  - currentValuation, currency, riskRating, dueDiligenceRating
  - jurisdictions, approvedAt, correlationId

### AO-1303: Deal creation handoff ✅ (in progress)
- **Support both architectures**:
  - Option A: Event-driven (AssetApproved → Kafka → Deal Studio → Create Deal)
  - Option B: Explicit command (User clicks "Create Deal" → Deal Studio API)
  - **Recommendation**: Support both automatic suggestion/event and explicit user-controlled deal creation

---

## Phase 14 — Domain Events ⚠️ NEW

### AO-1401: Expand event catalog
- **Add events**:
  - AssetDraftCreated, AssetOriginated
  - AssetScreeningStarted, AssetScreeningCompleted
  - AssetQualified
  - DueDiligenceStarted, DueDiligenceFindingCreated, DueDiligenceCompleted
  - ValuationRequested, ValuationCompleted, ValuationApproved
  - RiskAssessmentStarted, RiskAssessmentCompleted
  - AssetSubmittedForApproval, AssetConditionallyApproved, AssetApproved, AssetRejected
  - AssetPutOnHold, AssetResumed, AssetWithdrawn
  - AssetHandedOffToDealStudio

### AO-1402: Event envelope ✅ (in progress)
- **All events should contain**:
  - eventId, eventType, eventVersion, aggregateId, aggregateType, tenantId
  - occurredAt, correlationId, causationId, actorId, payload

---

## Phase 15 — Transactional Outbox ⚠️ CRITICAL

### AO-1501: Replace InMemoryOutbox ✅ (identified, need implementation)
- **Current**: `InMemoryOutbox` in `src/infrastructure/messaging/` - not production-ready
- **Implement**: PostgreSQL Transactional Outbox
- **Architecture**:
  ```
  Transaction
      │
  ├── Asset Update
  │
  └── Outbox Event
      │
      ▼
  Outbox Worker
      │
      ▼
  Kafka
  ```
- **Tasks**:
  - Outbox ORM entity
  - Event serialization
  - Transactional persistence
  - Publisher worker
  - Retry mechanism
  - Dead letter queue
  - Event idempotency
  - Publishing metrics

---

## Phase 16 — Concurrency ⚠️ NEW

### AO-1601: Enforce optimistic locking
- **Current**: Asset ORM has `version` field
- **Ensure enforcement**:
  - TypeORM version support
  - Expected version validation
  - Concurrent update rejection
  - Conflict response
  - Concurrency tests

---

## Phase 17 — API Completion ⚠️ NEW

### AO-1701: Asset commands ✅ (in progress)
- **POST /assets/drafts** - Create draft
- **POST /assets** - Create asset
- **PUT /assets/{id}** - Update asset
- **POST /assets/{id}/screening/start** - Start screening
- **POST /assets/{id}/screening/complete** - Complete screening
- **POST /assets/{id}/qualify** - Qualify asset
- **POST /assets/{id}/due-diligence/start** - Start DD
- **POST /assets/{id}/due-diligence/submit** - Submit DD
- **POST /assets/{id}/due-diligence/complete** - Complete DD
- **POST /assets/{id}/valuation** - Request valuation
- **POST /assets/{id}/valuation/approve** - Approve valuation
- **POST /assets/{id}/risk-assessment/start** - Start risk assessment
- **POST /assets/{id}/risk-assessment/complete** - Complete risk assessment
- **POST /assets/{id}/approval/submit** - Submit for approval
- **POST /assets/{id}/approve** - Approve asset
- **POST /assets/{id}/reject** - Reject asset
- **POST /assets/{id}/hold** - Put on hold
- **POST /assets/{id}/resume** - Resume from hold
- **POST /assets/{id}/withdraw** - Withdraw asset
- **POST /assets/{id}/handoff-to-deal** - Handoff to deal studio

### AO-1702: Asset query APIs ✅ (in progress)
- **GET /assets** - List assets
- **GET /assets/{id}** - Get asset by ID
- **GET /assets/{id}/summary** - Get asset summary
- **GET /assets/{id}/timeline** - Get asset timeline
- **GET /assets/{id}/screening** - Get screening info
- **GET /assets/{id}/qualification** - Get qualification info
- **GET /assets/{id}/due-diligence** - Get DD info
- **GET /assets/{id}/due-diligence/findings** - Get DD findings
- **GET /assets/{id}/valuations** - Get valuations
- **GET /assets/{id}/valuations/current** - Get current valuation
- **GET /assets/{id}/cash-flow-models** - Get cash flow models
- **GET /assets/{id}/risk-assessment** - Get risk assessment
- **GET /assets/{id}/documents** - Get documents
- **GET /assets/{id}/approval** - Get approval status
- **GET /assets/pipeline** - Get pipeline view

---

## Phase 18 — Search & Filtering ⚠️ NEW

### AO-1801: Asset search ✅ (in progress)
- **Support search criteria**:
  - Asset name
  - Reference number
  - Asset class
  - Asset subclass
  - Sponsor
  - Jurisdiction
  - Status
  - Risk rating
  - Due diligence rating
  - Valuation range
  - Date range

### AO-1802: Advanced filtering ✅ (in progress)
- **Support advanced filtering**:
  - Asset Class = Real Estate AND
  - Jurisdiction = Spain AND
  - Valuation > €10M AND
  - Risk Rating <= Medium AND
  - Status = Qualified

---

## Phase 19 — Audit Trail ⚠️ NEW

### AO-1901: Asset audit log ✅ (in progress)
- **Track**: Who, Did What, On Which Asset, When, Before, After, Reason
- **Audit categories**:
  - Asset changes
  - Sponsor changes
  - Valuation changes
  - DD changes
  - Risk changes
  - Status changes
  - Approval decisions

---

## Phase 20 — Security ⚠️ NEW

### AO-2001: Tenant isolation ✅ (in progress)
- **Ensure**:
  - Tenant filtering at repository level
  - Tenant validation at command level
  - Tenant propagation in events
  - Cross-tenant tests

### AO-2002: RBAC ✅ (in progress)
- **Suggested roles**:
  - OriginationAnalyst, OriginationManager
  - DueDiligenceAnalyst, RiskAnalyst
  - ValuationAnalyst, LegalReviewer
  - ComplianceReviewer, InvestmentCommitteeMember
  - Approver, Administrator, Viewer

---

## Phase 21 — Observability ⚠️ NEW

### AO-2101: Structured logging ✅ (in progress)
- **Every operation should include**:
  - tenantId, assetId, commandId, correlationId, actorId, traceId

### AO-2102: Metrics ✅ (in progress)
- **Track metrics**:
  - Assets originated
  - Assets qualified
  - Assets rejected
  - DD duration
  - Approval duration
  - Pipeline value
  - Assets by class
  - Event publishing failures
  - Command failures

---

## Phase 22 — Testing ⚠️ NEW

### AO-2201: Asset aggregate tests ✅ (in progress)
- **Test**:
  - Cannot approve rejected asset
  - Cannot approve without valuation
  - Cannot approve without DD completion
  - Cannot restart invalid lifecycle stage
  - Cannot handoff unapproved asset
  - Cannot modify finalized asset incorrectly

### AO-2202: Due diligence tests ✅ (in progress)
- **Test**:
  - Cannot complete incomplete mandatory DD
  - Cannot complete twice
  - Critical findings block approval
  - Waived findings require authorization
  - DD rating calculated correctly

### AO-2203: Valuation tests ✅ (in progress)
- **Test**:
  - Invalid valuation rejected
  - Currency consistency
  - Historical valuations preserved
  - Valuation approval workflow

### AO-2204: Cash flow tests ✅ (in progress)
- **Test**:
  - NPV, IRR, XIRR
  - Discount rates
  - Scenario calculations

### AO-2205: Integration tests ✅ (in progress)
- **Test**:
  - PostgreSQL
  - Kafka
  - Outbox
  - Multi-tenancy
  - Optimistic locking
  - Event consumption

---

## Summary & Priorities

### Immediate (P0 - This Sprint):
1. ✅ AO-000: Remove `valuationUpdated` as lifecycle state (already defined in shared-kernel, need to enforce in aggregate)
2. ✅ AO-001: Fix hardcoded BBB rating placeholder in completeDueDiligence
3. ✅ AO-002: Redesign asset lifecycle states (already defined, need to implement transition methods)
4. ✅ AO-003: Implement lifecycle commands in aggregate

### Short-term (P1 - Next 2-3 Sprints):
5. AO-101: Complete lifecycle command implementation
6. AO-201-203: Asset identity & registration expansion
7. AO-301-302: Sponsor & counterparty management
8. AO-401-403: Screening engine implementation

### Medium-term (P2 - Next 4-6 Sprints):
9. AO-501-502: Qualification engine
10. AO-601-606: Due diligence engine (critical - currently broken with BBB placeholder)
11. AO-701-704: Valuation engine (replace stub adapter)
12. AO-801-805: Cash flow modeling (currently orphaned)

### Long-term (P3 - Next 6+ Sprints):
13. AO-901-903: Risk assessment engine
14. AO-1001-1002: Document integration
15. AO-1101-1103: Approval workflow
16. AO-1201-1203: Pipeline management
17. AO-1301-1303: Deal studio handoff
18. AO-1401-1402: Domain events expansion
19. AO-1501: Transactional outbox replacement (critical for production)
20. AO-1601: Optimistic locking enforcement
21. AO-1701-1702: API completion
22. AO-1801-1802: Search & filtering
23. AO-1901: Audit trail
24. AO-2001-2002: Security (tenant isolation & RBAC)
25. AO-2101-2102: Observability
26. AO-2201-2205: Testing suite

**Total Phases**: 22
**Total Tasks**: ~200+ individual implementation items