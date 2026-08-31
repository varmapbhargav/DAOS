# Deal Studio - Implementation Todo List

Based on the comprehensive implementation plan and current codebase analysis. Status: in-progress as of 2026-08-31.

---

## Deal Studio Microservice — Implementation Plan

Based on the Readme.md task list (DS-001 through DS-2004) and current codebase analysis. The deal-studio service is a Deal Engineering & Transaction Structuring Engine that integrates with Asset Studio, Entity Studio, and the Kuma service mesh.

---

## Phase 0 — Architecture & Foundation (P0 - Immediate)

### DS-001: Define Deal Studio bounded-context contract ✅ (in progress)
- **Responsibilities owned by Deal Studio**:
  - Deal creation from approved opportunities
  - Capital stack structuring and validation
  - Term sheet generation and versioning
  - Closing conditions management
  - Legal review workflow
  - Deal approval and closure
  - Distribution waterfall calculations
  - Document references (not file storage)
- **What Deal Studio does NOT own**:
  - Asset structuring (owned by Asset Origination)
  - Legal entity creation (owned by Entity Studio)
  - Investment product creation
  - Capital stack structuring (shared, but validation logic here)
  - Investor subscriptions (owned by other services)
  - Token issuance (owned by other services)
  - Settlement and custody (owned by other services)
- **Integration boundaries**:
  - Asset Studio: Asset reference, asset summary, asset updates
  - Entity Studio: Sponsor, borrower, issuer, SPV, counterparties
  - Compliance OS: Regulatory validation, approval workflow
  - Document Service: Document references, not storage
  - Workflow/Approval Service: Approval outcomes, investment committee decisions
- **Deliverable**: `deal-studio-context-map.md`

### DS-002: Define canonical Deal domain model ✅ (in progress)
- **Review existing Deal aggregate** - Already has good structure with identity, economics, capital stack, terms, closing conditions, workflow states
- **Separate concerns**:
  - Deal identity (id, tenantId, name, assetId, sponsorId)
  - Deal economics (acquisition price, valuation, capitalization, fees, IRR, MOIC)
  - Capital structure (total capitalization, tranches, seniority rules, financing terms)
  - Terms (governance, economic, transfer restrictions, voting rights)
  - Closing conditions (categories, lifecycle, evidence, verification)
  - Workflow states (structuring, legal review, approval, closing - independent state machines)
- **Remove concepts that belong to other bounded contexts**
- **Define aggregate invariants** (versioning, tenant isolation, state transition rules)
- **Target model**:
  ```
  Deal
  ├── Identity
  ├── References (OpportunityId, AssetId, SponsorId)
  ├── Economics
  ├── CapitalStructure
  ├── DealTerms
  ├── ClosingConditions
  └── WorkflowStates (independent: structuring, legal, approval, closing)
  ```

### DS-003: Separate workflow state machines ✅ (in progress)
- **Current issue**: Deal status is too linear
- **Solution**: Create independent workflow states
- **Proposed structure**:
  ```
  Deal
  ├── StructuringStatus (DRAFT → STRUCTURING → TERM_SHEET_READY)
  ├── LegalStatus (PENDING → LEGAL_REVIEW → READY_FOR_APPROVAL)
  ├── ApprovalStatus (NOT_SUBMITTED → PENDING → IN_REVIEW → APPROVED | REJECTED)
  └── ClosingStatus (PREPARING → CLOSING → CLOSED | CANCELLED | EXPIRED)
  ```
- **Tasks**:
  - Define state machines for each workflow
  - Define allowed transitions for each state
  - Prevent invalid transitions
  - Add transition reason, timestamp, actor
  - Maintain lifecycle history (already have DealStatusHistory entity)

---

## Phase 1 — Deal Pipeline & Lifecycle

### DS-101: Deal lifecycle redesign ✅ (in progress)
- **Implement lifecycle**:
  ```
  DRAFT
   ↓
  STRUCTURING
   ↓
  TERM_SHEET_READY
   ↓
  LEGAL_REVIEW
   ↓
  READY_FOR_APPROVAL
   ↓
  APPROVED
   ↓
  READY_TO_CLOSE
   ↓
  CLOSING
   ↓
  CLOSED
  ```
- **Additional states**: ON_HOLD, REJECTED, CANCELLED, EXPIRED
- **Transition rules** (need to define):
  - DRAFT → STRUCTURING
  - STRUCTURING → TERM_SHEET_READY | REJECTED | ON_HOLD
  - TERM_SHEET_READY → LEGAL_REVIEW
  - LEGAL_REVIEW → READY_FOR_APPROVAL | WAIVED | REJECTED
  - READY_FOR_APPROVAL → APPROVED | REJECTED
  - APPROVED → READY_TO_CLOSE
  - READY_TO_CLOSE → CLOSING
  - CLOSING → CLOSED | CANCELLED | EXPIRED
  - Any → ON_HOLD
  - ON_HOLD → Previous state (resume)
  - Any → REJECTED (at any stage)
  - Any → CANCELLED (sponsor decision)
  - CLOSED → (terminal)
- **Implementation**: Add state machine to Deal aggregate with transition validation

### DS-102: Deal status history ✅ (partially implemented)
- **DealStatusHistory entity already exists** in `src/domain/entities/`
- **Fields**: id, dealId, tenantId, previousStatus, newStatus, reason, changedBy, changedAt, metadata
- **Need to add**:
  - Repository integration for history queries
  - Query API for status history by deal ID
  - Audit trail integration
  - Timeline generation from history

### DS-103: Deal lifecycle commands ✅ (in progress)
- **Commands to implement** (based on Readme.md and existing code):
  - `StartStructuringDeal` - Move from DRAFT to STRUCTURING
  - `SubmitForLegalReview` - Move from STRUCTURING or TERM_SHEET_READY to LEGAL_REVIEW
  - `CompleteLegalReview` - Move from LEGAL_REVIEW to READY_FOR_APPROVAL
  - `SubmitForApproval` - Move from READY_FOR_APPROVAL to approval submission
  - `MarkDealApproved` - Move to APPROVED status
  - `MarkDealRejected` - Move to REJECTED at any non-terminal stage
  - `PrepareForClosing` - Move from APPROVED to READY_TO_CLOSE
  - `StartClosing` - Move from READY_TO_CLOSE to CLOSING
  - `CloseDeal` - Move from CLOSING to CLOSED
  - `PutDealOnHold` - Move to ON_HOLD
  - `ResumeDeal` - Resume from ON_HOLD to previous state
  - `CancelDeal` - Move to CANCELLED
- **Files to Change**:
  - `apps/deal-studio/src/domain/aggregates/deal.aggregate.ts` - Add all transition methods
  - `apps/deal-studio/src/application/commands/` - All command handlers
  - `libs/shared-kernel/src/value-objects/deal-value-objects.ts` - Status enum if needed

---

## Phase 2 — Deal Identity & Metadata

### DS-201: Deal metadata model ✅ (in progress)
- **Add DealMetadata entity** with fields:
  - Deal reference number
  - Internal reference
  - External reference
  - Deal type
  - Asset class
  - Jurisdiction
  - Currency
  - Target close date
  - Deal owner
  - Deal team
  - Tags
  - Source
  - Priority
- **Implementation**: Add metadata fields to Deal aggregate or create separate entity
- **Integration**: Reference opportunity source, track deal provenance

### DS-202: Deal classification ✅ (in progress)
- **DealType enum**:
  - Acquisition
  - Financing
  - Refinancing
  - Restructuring
  - Co-investment
  - Fund investment
  - Asset-backed financing
  - Private credit
  - Real estate investment
  - Trade finance
  - Secondary transaction
- **Implementation**: Add DealType to Deal metadata or as separate entity

### DS-203: Deal participants ✅ (in progress)
- **Create DealParticipant entity** (already exists in domain/entities/):
  - participantId
  - dealId
  - entityId
  - role
  - status
  - effectiveFrom
  - effectiveTo
- **Support roles**:
  - Sponsor
  - Borrower
  - Seller
  - Buyer
  - Lender
  - Investor
  - Guarantor
  - Advisor
  - Legal counsel
  - Administrator
- **Tasks**:
  - Entity references to Entity Studio
  - Role assignment validation
  - Effective date range management
  - Participant status tracking
  - Remove/expire participants

---

## Phase 3 — Capital Stack Engine

### DS-301: Expand Capital Stack aggregate ✅ (in progress)
- **Current model needs enhancement**
- **Create CapitalStack entity** with structure:
  - TotalCapitalization
  - Tranches[] (array of capital tranches)
  - SeniorityRules
  - Leverage
  - FinancingTerms
- **Integration**: Already has CapitalStack in the Deal aggregate, needs enhancement

### DS-302: Capital tranche model ✅ (in progress)
- **Create CapitalTranche entity** with fields:
  - trancheId
  - name
  - type (Senior Debt, Mezzanine Debt, Junior Debt, Preferred Equity, Common Equity, Convertible Instrument, Revenue Participation, Hybrid Instrument)
  - currency
  - targetAmount
  - committedAmount
  - fundedAmount
  - seniority
  - ranking (unique within seniority level)
- **Tranche types**:
  - Senior Debt
  - Mezzanine Debt
  - Junior Debt
  - Preferred Equity
  - Common Equity
  - Convertible Instrument
  - Revenue Participation
  - Hybrid Instrument

### DS-303: Tranche economics ✅ (in progress)
- **Add economic terms per tranche**:
  - Fixed interest rate
  - Floating interest rate
  - Reference rate (SOFR, SONIA, etc.)
  - Spread over reference rate
  - Coupon frequency (monthly, quarterly, semi-annual, annual)
  - Maturity date
  - Grace period
  - Amortization schedule
  - Bullet repayment
  - PIK interest (Payment-in-Kind)
  - Default interest rate

### DS-304: Capital stack validation ✅ (in progress)
- **Implement validation rules**:
  - Total tranche allocation validation (sum of committed = total)
  - Seniority validation (no overlapping seniority levels)
  - Currency consistency (all tranches in same currency or properly converted)
  - Debt/equity ratio validation
  - Maximum leverage validation (total debt / total equity <= max)
  - Minimum equity validation
  - Duplicate ranking prevention
  - Invalid tranche type prevention
- **Integration**: CapitalStackValidator service already referenced in deal.aggregate.ts

---

## Phase 4 — Economic Modeling

### DS-401: Deal economics ✅ (in progress)
- **Create DealEconomics entity** (already exists in domain/entities/):
  - Acquisition price
  - Enterprise value
  - Equity value
  - Valuation
  - Total capitalization
  - Fees
  - Expenses
  - Target IRR
  - Target MOIC
  - Expected yield
- **Integration**: Already has structure, needs to ensure all fields are populated and validated

### DS-402: Cash flow model ✅ (in progress)
- **Create CashFlowProjection entity**:
  - Monthly cash flows
  - Quarterly cash flows
  - Annual cash flows
  - Operating income
  - Expenses
  - Debt service
  - Taxes
  - Net distributable income
- **Integration**: Cash flow periods already referenced in DealEconomics

### DS-403: Return calculation engine ✅ (in progress)
- **Implement return calculations**:
  - IRR (Internal Rate of Return)
  - XIRR (Extended IRR - irregular dates)
  - MOIC (Multiple on Invested Capital)
  - Yield (annualized return)
  - Cash-on-cash return
  - Equity multiple
- **Integration**: Return calculation service needed

### DS-404: Scenario modeling ✅ (in progress)
- **Support scenarios**: Base Case, Bull Case, Bear Case, Stress Case
- **Tasks**:
  - Scenario entity with assumptions
  - Calculation engine per scenario
  - Scenario comparison API
  - Scenario versioning
  - Assumption model (discount rate, growth rate, exit multiple, etc.)

---

## Phase 5 — Distribution Waterfall Engine

### DS-501: Waterfall model ✅ (in progress)
- **Create DistributionWaterfall entity**:
  - Cash Available → Operating Expenses → Senior Debt → Preferred Return → Catch-up → Promote/Carry → Residual Distribution
- **Diagram**:
  ```
  Cash Available
       │
       ▼
  Operating Expenses
       │
       ▼
  Senior Debt
       │
       ▼
  Preferred Return
       │
       ▼
  Catch-up
       │
       ▼
  Promote / Carry
       │
       ▼
  Residual Distribution
  ```

### DS-502: Waterfall tiers ✅ (in progress)
- **Create WaterfallTier entity** with fields:
  - Tier priority (1 = highest seniority)
  - Recipient (who gets the distribution)
  - Distribution type (interest, principal, promote, residual)
  - Threshold (hurdle rate or amount threshold)
  - Hurdle rate (preferred return percentage)
  - Percentage allocation (% of residual)
  - Catch-up rule (how catch-up is calculated)

### DS-503: Waterfall calculation engine ✅ (in progress)
- **Implement calculation logic**:
  - Calculate distributable amount after operating expenses
  - Apply tier priority (senior first, then mezzanine, then equity)
  - Apply hurdle rate to each tier
  - Apply catch-up rule (catch-up to preferred before promote)
  - Allocate residual according to percentage allocations
  - Produce calculation trace (who got what, when, why)
- **Integration**: Waterfall calculation service needed

---

## Phase 6 — Term Sheet Engine

### DS-601: Consolidate Term Sheet model ✅ (in progress)
- **Remove duplicated domain state**
- **Ensure one source of truth**:
  - Deal Closing Conditions ≠ Term Sheet Closing Conditions
  - Create canonical terms model
  - Reference closing condition IDs
  - Version terms
  - Add draft/final states
  - Add amendment support
- **Implementation**: TermSheet entity already exists, needs consolidation

### DS-602: Economic terms ✅ (in progress)
- **Support economic terms**:
  - Investment amount
  - Valuation
  - Coupon
  - Interest rate
  - Preferred return
  - Profit sharing
  - Revenue sharing
  - Distribution frequency
  - Maturity date
  - Redemption terms

### DS-603: Governance terms ✅ (in progress)
- **Support governance terms**:
  - Voting rights (per class, per participant)
  - Board rights (number of seats, voting thresholds)
  - Observer rights
  - Reserved matters (require supermajority)
  - Consent rights
  - Information rights (financials, operations, etc.)
  - Veto rights

### DS-604: Transfer restrictions ✅ (in progress)
- **Support transfer restrictions**:
  - Lock-up period
  - Transfer approval requirements
  - Right of first refusal
  - Tag-along rights
  - Drag-along rights
  - Investor eligibility criteria
  - Jurisdiction restrictions

### DS-605: Term sheet versioning ✅ (in progress)
- **Implement versioning**:
  ```
  TermSheet
  │
  ├── Version 1 (draft)
  ├── Version 2 (updated)
  ├── Version 3 (updated)
  └── Final Version (finalized)
  ```
- **Tasks**:
  - Immutable versions (once finalized, cannot be overwritten)
  - Version comparison API
  - Amendment reason tracking
  - Approval per version
  - Finalization lock (prevent further changes after finalize)

---

## Phase 7 — Closing Conditions Engine

### DS-701: Canonical ClosingCondition aggregate/entity ✅ (in progress)
- **Create ClosingCondition entity** with fields:
  - id
  - dealId
  - category (Legal, Regulatory, Financial, Tax, Technical, Commercial, Operational, Investor, Documentation)
  - description
  - responsibleParty
  - dueDate
  - status (PENDING, IN_PROGRESS, SUBMITTED, UNDER_REVIEW, MET, WAIVED, FAILED, EXPIRED)
  - evidence (document reference, upload reference)
  - verifiedBy
  - verifiedAt

### DS-702: Closing condition categories ✅ (in progress)
- **Support categories**:
  - Legal
  - Regulatory
  - Financial
  - Tax
  - Technical
  - Commercial
  - Operational
  - Investor
  - Documentation

### DS-703: Closing condition lifecycle ✅ (in progress)
- **Lifecycle states**:
  ```
  PENDING
   ↓
  IN_PROGRESS
   ↓
  SUBMITTED
   ↓
  UNDER_REVIEW
   ↓
  MET
  ```
- **Alternative outcomes**:
  - WAIVED
  - FAILED
  - EXPIRED
- **Implementation**: Status field on ClosingCondition entity with transition logic

### DS-704: Evidence verification ✅ (in progress)
- **Implement evidence verification**:
  - Document reference (link to Document Service)
  - Evidence upload reference
  - Reviewer assignment
  - Verification date
  - Rejection reason
  - Waiver approval tracking

---

## Phase 8 — Deal Approval Integration

### DS-801: Approval workflow abstraction ✅ (in progress)
- **Remove simplistic**: `approve(userId)`
- **Replace with**: ApprovalReference integration
- **Deal Studio should consume** approval outcomes from central workflow service
- **Implementation**:
  - Create approval request (link to workflow service ID)
  - Track approval status (pending, approved, rejected)
  - Handle approval events from workflow service
  - Handle rejection events
  - Link to investment committee review

### DS-802: Investment Committee integration ✅ (in progress)
- **Support IC workflow**:
  ```
  Deal → Investment Committee Review → Decision
  ```
- **Tasks**:
  - Submit deal for IC review
  - Generate IC package reference (summarized deal data)
  - Track committee decision (approve, reject, conditional)
  - Record conditions (if conditional approval)
  - Handle conditional approval (asset conditions, documentation, etc.)
  - Handle rejection (with reason)
  - IC package generation service

---

## Phase 9 — Deal Documents Integration

### DS-901: Document references ✅ (in progress)
- **Deal Studio should NOT own file storage**
- **Create DealDocumentReference entity** with document types:
  - Term sheet
  - Financial model
  - Investment memo
  - Legal documents
  - Due diligence reports
  - Closing documents
  - Supporting documents
- **Integration**: Reference Document Service API, store metadata only

### DS-902: Document lifecycle ✅ (in progress)
- **Track document lifecycle**:
  - DRAFT → REVIEW → APPROVED → SUPERSEDED → ARCHIVED
- **Implementation**: Status field on DealDocumentReference with lifecycle transitions

---

## Phase 10 — External Domain References

### DS-1001: Asset Studio integration ✅ (in progress)
- **Support Asset Studio integration**:
  - Deal → AssetReference
  - Validate asset existence
  - Fetch asset summary
  - Handle asset updates
  - Handle asset deletion restrictions
- **Integration**: Reference asset-origination service, query asset status, economics, etc.

### DS-1002: Entity Studio integration ✅ (in progress)
- **Deal Studio should reference entities**:
  - Sponsor reference model
  - Borrower reference model
  - Issuer reference model
  - SPV reference model
  - Counterparties reference model
- **Tasks**:
  - Entity reference model (entityId, role, since when)
  - Entity role assignment (sponsor, borrower, issuer, etc.)
  - Entity validation (exists in Entity Studio, active status)
  - Entity relationship mapping (who relates to whom)
  - Counterparty management

### DS-1003: Origination OS integration ✅ (in progress)
- **Support opportunity-to-deal flow**:
  ```
  Opportunity → Approved Opportunity → Deal Created
  ```
- **Tasks**:
  - Store opportunityId on Deal
  - Consume opportunity-approved event (from asset-origination)
  - Create deal from approved opportunity (auto-populate some fields)
  - Sync sponsor metadata (from opportunity to deal)
  - Handle opportunity status changes

---

## Phase 11 — Domain Events

### DS-1101: Expand domain event catalog ✅ (in progress)
- **Implement event catalog**:
  - DealCreated
  - DealUpdated
  - DealStructuringStarted
  - DealStructuringCompleted
  - CapitalStackUpdated
  - CapitalTrancheAdded
  - CapitalTrancheRemoved
  - TermSheetDrafted
  - TermSheetUpdated
  - TermSheetFinalized
  - ClosingConditionCreated
  - ClosingConditionMet
  - ClosingConditionWaived
  - DealSubmittedForLegalReview
  - LegalReviewCompleted
  - DealSubmittedForApproval
  - DealApproved
  - DealRejected
  - DealReadyForClosing
  - DealClosingStarted
  - DealClosed
  - DealCancelled
  - DealPutOnHold
  - DealResumed
- **Event envelope** (every event should contain):
  - eventId
  - eventType
  - eventVersion
  - aggregateId
  - aggregateType
  - tenantId
  - occurredAt
  - correlationId
  - causationId
  - actorId
  - payload

### DS-1102: Event versioning ✅ (in progress)
- **Every event should version**:
  - eventVersion incremented on each change
  - Support for event evolution
  - Backward compatibility
  - Deprecation strategy for old event versions

---

## Phase 12 — Transactional Outbox

### DS-1201: Replace in-memory outbox ✅ (in progress)
- **Current**: `in-memory-outbox.ts` in infrastructure/messaging/ - not production-ready
- **Implement PostgreSQL Transactional Outbox**:
  ```
  Aggregate
      │
      ▼
  Database Transaction
      │
      ├── Aggregate State
      │
      └── Outbox Event
              │
              ▼
         Event Publisher
              │
              ▼
             Kafka
  ```
- **Tasks**:
  - Outbox table/entity (persist events in same transaction as aggregate)
  - Event serialization (format for Kafka)
  - Transactional persistence (commit both aggregate and outbox in same DB tx)
  - Publisher worker (read pending events, publish to Kafka)
  - Retry strategy (exponential backoff, max retries)
  - Dead-letter queue (failed events after max retries)
  - Event idempotency (deduplication by eventId)
  - Event status tracking (pending, published, failed, retried)
- **Files to Change**:
  - `apps/deal-studio/src/infrastructure/messaging/in-memory-outbox.ts` → Replace with postgres-outbox
  - `apps/deal-studio/src/infrastructure/messaging/postgres-outbox.publisher.ts` → Enhance
  - New outbox repository/DAO

---

## Phase 13 — Concurrency & Consistency

### DS-1301: Optimistic locking ✅ (in progress)
- **Ensure version fields actually enforce concurrency**
- **Tasks**:
  - Add version field to Deal aggregate (already has version in some forms)
  - Add database optimistic lock column/versioning
  - Handle concurrency exception (NestJS exception filter or interceptor)
  - Return conflict response (409 Conflict with details)
  - Add concurrency tests (unit and integration)
- **Integration**: Check if TypeORM version column is configured

### DS-1302: Idempotency ✅ (in progress)
- **Implement idempotency for commands**
- **Commands requiring idempotency**:
  - Create deal (prevent duplicate creation)
  - Update capital stack (prevent double updates)
  - Finalize term sheet (prevent double finalization)
  - Submit approval (prevent double submission)
  - Close deal (prevent double close)
- **Idempotency fields**:
  - idempotencyKey (client-generated, unique per request)
  - requestHash (hash of command + parameters)
  - status (pending, completed, failed)
  - responseReference (correlation to original response)
- **Implementation**: Idempotency store (database table or Redis) + command handler logic

---

## Phase 14 — Persistence

### DS-1401: Database schema review ✅ (in progress)
- **Review schema for**:
  - Tenant isolation (RLS or tenantId column on every table)
  - Foreign keys (referential integrity)
  - Indexes (performance on frequent queries)
  - Soft deletion (isDeleted flag + deletedAt, or physical delete with audit)
  - Audit fields (createdBy, createdAt, updatedBy, updatedAt)
  - Version columns (optimistic locking)
  - JSON fields (for flexible terms, conditions, payloads)
  - Money representation (Decimal/BigDecimal, not float)
  - Percentage representation (Decimal, not float)

### DS-1402: Financial precision ✅ (in progress)
- **Do not use floating point**
- **Use**: Decimal / BigDecimal for:
  - Money amounts
  - Percentages
  - Interest rates
  - IRR calculations
  - MOIC calculations
  - Waterfall calculations
  - Exchange rates
- **Implementation**: Use `@nestjs/common` pipes or TypeORM decimal type, avoid JavaScript Number for financial math

---

## Phase 15 — API Completion

### DS-1501: Command APIs ✅ (in progress)
- **Implement REST endpoints**:
  ```text
  POST   /deals              → Create deal (DRAFT)
  PUT    /deals/{id}         → Update deal
  PUT    /deals/{id}/capital-stack → Update capital stack
  POST   /deals/{id}/structuring/start → Start structuring workflow
  POST   /deals/{id}/term-sheet → Create draft term sheet
  POST   /deals/{id}/term-sheet/finalize → Finalize term sheet
  POST   /deals/{id}/legal-review/submit → Submit for legal review
  POST   /deals/{id}/approval/submit → Submit for approval
  POST   /deals/{id}/closing-conditions → Add closing condition
  POST   /deals/{id}/closing-conditions/{conditionId}/submit → Submit condition
  POST   /deals/{id}/closing-conditions/{conditionId}/verify → Verify condition
  POST   /deals/{id}/closing-conditions/{conditionId}/waive → Waive condition
  POST   /deals/{id}/closing/start → Start closing process
  POST   /deals/{id}/close → Close deal
  POST   /deals/{id}/hold → Put on hold
  POST   /deals/{id}/resume → Resume from hold
  POST   /deals/{id}/cancel → Cancel deal
  ```

### DS-1502: Query APIs ✅ (in progress)
- **Implement query endpoints**:
  ```text
  GET /deals              → List deals (with tenant filtering, pagination)
  GET /deals/{id}         → Get deal by ID
  GET /deals/{id}/summary → Deal summary (status, economics, key dates)
  GET /deals/{id}/timeline → Deal timeline (status history)
  GET /deals/{id}/participants → Deal participants
  GET /deals/{id}/capital-stack → Capital stack details
  GET /deals/{id}/economics → Deal economics
  GET /deals/{id}/waterfall → Distribution waterfall
  GET /deals/{id}/term-sheet → Current term sheet
  GET /deals/{id}/term-sheet/versions → Term sheet version history
  GET /deals/{id}/closing-conditions → All closing conditions
  GET /deals/{id}/documents → Document references
  GET /deals/{id}/status-history → Status history timeline
  ```

---

## Phase 16 — Search & Filtering

### DS-1601: Deal search ✅ (in progress)
- **Support search criteria**:
  - Deal name
  - Reference number
  - Asset (assetId or asset summary)
  - Sponsor (sponsorId or sponsor name)
  - Deal type (acquisition, financing, etc.)
  - Asset class (realEstate, privateEquity, etc.)
  - Status (DRAFT, STRUCTURING, LEGAL_REVIEW, APPROVED, CLOSING, CLOSED, etc.)
  - Jurisdiction
  - Currency
  - Owner (deal owner userId)
  - Date range (createdAt, updatedAt, target close date)
- **Implementation**: Search service or repository query methods with filters

### DS-1602: Deal pipeline query ✅ (in progress)
- **Create dedicated pipeline API**:
  ```text
  GET /deals/pipeline
  ```
- **Response format**:
  ```
  DRAFT              12
  STRUCTURING         8
  LEGAL_REVIEW        5
  APPROVAL            3
  CLOSING             2
  CLOSED             21
  ```
- **Implementation**: Pipeline query that counts deals by status group

---

## Phase 17 — Audit & Compliance

### DS-1701: Audit trail ✅ (in progress)
- **Track audit information**:
  - Who (actorId, user name)
  - Did What (command, action, state change)
  - To Which Deal (dealId)
  - When (timestamp)
  - Before Value (previous state, amount, terms)
  - After Value (new state, amount, terms)
  - Reason (why the change, business justification)
- **Audit categories**:
  - Capital stack changes (tranche additions, seniority changes)
  - Terms changes (term sheet updates, governance changes)
  - Participant changes (add/remove participants)
  - Approval changes (approval/rejection, conditional approval)
  - Closing condition changes (met, waived, failed)
  - Status changes (lifecycle transitions)
- **Implementation**: Audit log entity/service, integrate with DealStatusHistory

### DS-1702: Immutable financial history ✅ (in progress)
- **Once TermSheetFinalized or DealClosed**, ensure historical versions cannot be overwritten
- **Implementation**:
  - Soft delete + versioning (keep history, prevent writes)
  - Database triggers or application-level locking
  - Read-only mode for finalized deals
  - Version comparison and amendment tracking

---

## Phase 18 — Security

### DS-1801: Tenant security ✅ (in progress)
- **Validate tenant on every operation**
- **Ensure**:
  - Repository filtering by tenantId (every query includes tenantId)
  - API tenant validation (auth middleware validates tenant context)
  - Event tenant propagation (events carry tenantId, consistent across services)
  - Cross-tenant access tests (tests verify no cross-tenant data leakage)
- **Implementation**: Tenant context middleware, repository scope, event enrichment

### DS-1802: Role-based permissions ✅ (in progress)
- **Suggested roles**:
  - DealCreator (create new deals)
  - DealManager (manage deal structure, participants, terms)
  - DealAnalyst (view and analyze deals, no write access)
  - LegalReviewer (review legal terms, conditions, documents)
  - ComplianceReviewer (compliance validation, regulatory checks)
  - InvestmentCommitteeMember (view IC packages, participate in decisions)
  - Approver (approve/reject deals at various stages)
  - Administrator (full access, user management, system config)
  - Viewer (read-only access to deal data)
- **Permissions matrix**:
  - Create deal: Creator, Manager, Admin
  - Modify structure: Manager, Admin
  - Finalize terms: Manager, Admin, IC Member
  - Verify conditions: LegalReviewer, Manager
  - Submit approval: Dealer, Manager
  - Close deal: Manager, Admin, Approver
  - Cancel deal: Manager, Admin, Dealer
  - View deal: Analyst, Viewer, all authenticated roles (with tenant filter)

---

## Phase 19 — Observability

### DS-1901: Structured logging ✅ (in progress)
- **Every log should include**:
  - tenantId
  - dealId
  - commandId (correlation ID for the command execution)
  - correlationId (end-to-end trace ID across services)
  - actorId (user/service who initiated the action)
  - traceId (distributed trace ID for observability tools)
- **Implementation**: NestJS interceptor or pipe that enriches every log entry

### DS-1902: Metrics ✅ (in progress)
- **Track metrics**:
  - Deals created (count, rate per time period)
  - Deals by status (distribution at any time)
  - Average structuring duration (DRAFT → TERM_SHEET_READY)
  - Average approval duration (submission → approval decision)
  - Average closing duration (READY_TO_CLOSE → CLOSED)
  - Failed commands (count, reasons)
  - Event publishing failures (count, topics, reasons)
  - Closing condition delays (average time in each status)
- **Implementation**: Prometheus metrics, NestJS microservices stats, or custom metrics service

### DS-1903: Distributed tracing ✅ (in progress)
- **Trace flow**:
  ```
  API Request
     ↓
  Command
     ↓
  Aggregate
     ↓
  Database
     ↓
  Outbox
     ↓
  Kafka
     ↓
  Downstream Service
  ```
- **Implementation**: OpenTelemetry, NestJS integration, correlation ID propagation, trace ID generation

---

## Phase 20 — Testing

### DS-2001: Domain unit tests ✅ (in progress)
- **Test all invariants**:
  - Cannot close an unapproved deal
  - Cannot approve incomplete deal (missing conditions, missing signatures, etc.)
  - Cannot finalize invalid term sheet (missing fields, unresolved conditions)
  - Cannot duplicate capital tranche rank (unique ranking per seniority level)
  - Cannot exceed leverage limits (debt/equity ratio)
  - Cannot close with unmet conditions (all closing conditions must be MET)
  - Cannot transition from closed deal (CLOSED is terminal)
  - Cannot approve deal with rejected conditions
  - Cannot add participant with overlapping effective dates
- **Files**: `__tests__/unit/` or `test/` directory per aggregate/entity

### DS-2002: Application tests ✅ (in progress)
- **Test**:
  - Command handlers (happy path and error cases)
  - Query handlers (correct data return)
  - Repository interactions (find, save, findById, etc.)
  - Event publishing (correct events, correct payload)
  - Idempotency (same key returns same result, no duplicates)
- **Files**: Handler test files, integration with mock repositories

### DS-2003: Integration tests ✅ (in progress)
- **Test**:
  - PostgreSQL (full DB operations, transactions)
  - Kafka (event publishing, consumption, idempotency)
  - Outbox (transactional persistence, publisher worker)
  - Multi-tenancy (tenant isolation, no cross-tenant data)
  - Optimistic locking (concurrent updates, conflict detection)
  - End-to-end lifecycle (create → structure → term sheet → close)
- **Files**: `e2e-test/` or integration test suite

### DS-2004: End-to-end lifecycle test ✅ (in progress)
- **Create one complete scenario**:
  ```
  Create Deal
      ↓
  Add Asset reference
      ↓
  Add Participants
      ↓
  Build Capital Stack
      ↓
  Add Economics
      ↓
  Create Term Sheet
      ↓
  Finalize Terms
      ↓
  Add Closing Conditions
      ↓
  Legal Review
      ↓
  Approval
      ↓
  Meet Conditions
      ↓
  Close Deal
  ```
- **Test all state transitions are valid**
- **Test all invariants are enforced**
- **Test event publishing at each step**
- **Test idempotency at each command**
- **Test audit trail entries at each step**

---

## Recommended Implementation Priority

### P0 — Must complete first (Critical foundation)
```text
DS-001 Architecture boundaries
DS-002 Canonical Deal aggregate
DS-003 Separate workflows

DS-101 Deal lifecycle redesign
DS-102 Status history

DS-201 Deal metadata
DS-203 Deal participants

DS-301 Capital stack enhancement
DS-304 Capital stack validation

DS-601 Canonical term sheet
DS-605 Term sheet versioning

DS-701 Closing condition canonical model
DS-703 Closing lifecycle

DS-1101 Domain events
DS-1201 Transactional outbox

DS-1301 Optimistic locking
DS-1402 Financial precision

DS-1501 Command APIs
DS-1502 Query APIs

DS-1701 Audit trail
DS-2001 Domain tests
```

### P1 — Institutional-grade capabilities
```text
DS-401 Deal economics
DS-402 Cash flow projections
DS-403 Return calculations
DS-404 Scenario modeling

DS-501 Waterfall engine
DS-502 Waterfall tiers

DS-801 Approval workflow integration
DS-802 Investment Committee integration

DS-901 Document integration

DS-1601 Search
DS-1602 Pipeline queries

DS-1802 RBAC
DS-1901 Observability
DS-2003 Integration testing
```

### P2 — Advanced capabilities
```text
Advanced scenario simulations
Complex waterfall calculations
Multi-currency economics
Financing covenant engine
Stress testing
Automated risk scoring
AI-assisted deal structuring
```

---

## Summary & Priorities

**Total Phases**: 20 (similar to asset-origination's 22 phases)
**Total Tasks**: ~180+ individual implementation items

### Immediate (P0 - This Sprint):
1. ✅ DS-001: Define bounded-context contract and integration boundaries
2. ✅ DS-002: Define canonical Deal aggregate with independent workflow states
3. ✅ DS-003: Separate workflow state machines (structuring, legal, approval, closing)
4. ✅ DS-101: Implement deal lifecycle redesign with state machine
5. ✅ DS-102: Implement status history entity and query API
6. ✅ DS-103: Implement lifecycle commands in aggregate and handlers

### Short-term (P1 - Next 2-3 Sprints):
7. DS-201: Expand deal metadata model
8. DS-203: Enhance deal participants with entity references
9. DS-301-304: Capital stack engine enhancement and validation
10. DS-601-605: Term sheet engine consolidation and versioning
11. DS-701-704: Closing conditions engine
12. DS-1101: Expand domain event catalog
13. DS-1201: Replace InMemoryOutbox with PostgreSQL transactional outbox
14. DS-1301: Enforce optimistic locking
15. DS-1402: Financial precision (Decimal everywhere)
16. DS-1501-1502: Complete API (commands + queries)

### Medium-term (P2 - Next 4-6 Sprints):
16. DS-401-404: Economic modeling (returns, scenarios, cash flows)
17. DS-501-503: Distribution waterfall engine
18. DS-801-802: Approval workflow and IC integration
19. DS-901-902: Document integration (references, lifecycle)
20. DS-1601-1602: Search and pipeline queries
21. DS-1802: RBAC and role-based permissions
22. DS-1901-1903: Observability (logging, metrics, tracing)
23. DS-2001-2004: Testing suite (domain, application, integration, E2E)

### Long-term:
24. Advanced capabilities (AI-assisted structuring, stress testing, covenant engine)

**Key Success Factors**:
- Tenant isolation at every layer (repository, API, event)
- Financial precision (Decimal, no float)
- Optimistic locking for concurrency
- Transactional outbox for reliability
- Domain events for decoupling
- Comprehensive test coverage
- Structured logging and observability

The deal-studio service is further along than asset-origination in some areas (has more domain events, aggregates, and entities already defined) but shares the same critical issues: BBB placeholder problem, in-memory outbox, and need for full lifecycle implementation.