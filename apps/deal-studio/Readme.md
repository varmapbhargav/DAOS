Based on the current **Deal Studio microservice architecture and its role in the Capiora Digital Asset Operating System**, here is a practical task list to take the service from its current foundation to a production-ready **Deal Engineering & Transaction Structuring Engine**.

# Deal Studio Microservice — Completion Task List

## Phase 0 — Architecture & Foundation

### DS-001: Define Deal Studio bounded-context contract

* [ ] Document responsibilities owned by Deal Studio.
* [ ] Define what Deal Studio does **not** own.
* [ ] Define integration boundaries with:

  * [ ] Asset Studio
  * [ ] Entity Studio
  * [ ] Product Studio
  * [ ] Compliance OS
  * [ ] Origination OS
  * [ ] Document Service
  * [ ] Workflow/Approval Service
* [ ] Create context map.
* [ ] Define upstream/downstream dependencies.

**Deliverable:** `deal-studio-context-map.md`

---

### DS-002: Define canonical Deal domain model

* [ ] Review existing `Deal` aggregate.
* [ ] Separate:

  * [ ] Deal identity
  * [ ] Deal economics
  * [ ] Capital structure
  * [ ] Terms
  * [ ] Closing workflow
* [ ] Remove concepts that belong to other bounded contexts.
* [ ] Define aggregate invariants.

**Target model:**

```text
Deal
├── Identity
├── References
│   ├── OpportunityId
│   ├── AssetId
│   └── SponsorId
├── Economics
├── CapitalStructure
├── DealTerms
├── ClosingConditions
├── WorkflowStates
└── DomainEvents
```

---

### DS-003: Separate workflow state machines

Current deal status is too linear.

Create independent workflow states.

* [ ] Structuring workflow
* [ ] Legal review workflow
* [ ] Investment approval workflow
* [ ] Closing workflow

Example:

```text
Deal
├── StructuringStatus
├── LegalStatus
├── ApprovalStatus
└── ClosingStatus
```

---

# Phase 1 — Deal Pipeline & Lifecycle

## DS-101: Deal lifecycle redesign

Implement lifecycle:

```text
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

Additional states:

```text
ON_HOLD
REJECTED
CANCELLED
EXPIRED
```

Tasks:

* [ ] Define state machine.
* [ ] Define allowed transitions.
* [ ] Prevent invalid transitions.
* [ ] Add transition reason.
* [ ] Add transition timestamp.
* [ ] Add transition actor.
* [ ] Maintain lifecycle history.

---

## DS-102: Deal status history

Create:

```text
DealStatusHistory
```

Fields:

```text
id
dealId
previousStatus
newStatus
reason
changedBy
changedAt
metadata
```

Tasks:

* [ ] Database entity.
* [ ] Domain entity/value object.
* [ ] Repository.
* [ ] Query API.
* [ ] Audit trail.

---

## DS-103: Deal lifecycle commands

Implement:

* [ ] `StartStructuringDeal`
* [ ] `SubmitForLegalReview`
* [ ] `CompleteLegalReview`
* [ ] `SubmitForApproval`
* [ ] `MarkDealApproved`
* [ ] `MarkDealRejected`
* [ ] `PrepareForClosing`
* [ ] `StartClosing`
* [ ] `CloseDeal`
* [ ] `PutDealOnHold`
* [ ] `ResumeDeal`
* [ ] `CancelDeal`

---

# Phase 2 — Deal Identity & Metadata

## DS-201: Deal metadata model

Add:

```text
DealMetadata
```

Fields:

* [ ] Deal reference number.
* [ ] Internal reference.
* [ ] External reference.
* [ ] Deal type.
* [ ] Asset class.
* [ ] Jurisdiction.
* [ ] Currency.
* [ ] Target close date.
* [ ] Deal owner.
* [ ] Deal team.
* [ ] Tags.
* [ ] Source.
* [ ] Priority.

---

## DS-202: Deal classification

Support:

```text
DealType
```

Examples:

* [ ] Acquisition
* [ ] Financing
* [ ] Refinancing
* [ ] Restructuring
* [ ] Co-investment
* [ ] Fund investment
* [ ] Asset-backed financing
* [ ] Private credit
* [ ] Real estate investment
* [ ] Trade finance
* [ ] Secondary transaction

---

## DS-203: Deal participants

Create:

```text
DealParticipant
```

Support:

* [ ] Sponsor
* [ ] Borrower
* [ ] Seller
* [ ] Buyer
* [ ] Lender
* [ ] Investor
* [ ] Guarantor
* [ ] Advisor
* [ ] Legal counsel
* [ ] Administrator

Fields:

```text
participantId
dealId
entityId
role
status
effectiveFrom
effectiveTo
```

---

# Phase 3 — Capital Stack Engine

## DS-301: Expand Capital Stack aggregate

Current model needs enhancement.

Create:

```text
CapitalStack
```

```text
CapitalStack
│
├── TotalCapitalization
├── Tranches[]
├── SeniorityRules
├── Leverage
└── FinancingTerms
```

---

## DS-302: Capital tranche model

Create:

```text
CapitalTranche
```

Fields:

```text
trancheId
name
type
currency
targetAmount
committedAmount
fundedAmount
seniority
ranking
```

Types:

* [ ] Senior Debt
* [ ] Mezzanine Debt
* [ ] Junior Debt
* [ ] Preferred Equity
* [ ] Common Equity
* [ ] Convertible Instrument
* [ ] Revenue Participation
* [ ] Hybrid Instrument

---

## DS-303: Tranche economics

Add:

* [ ] Fixed interest.
* [ ] Floating interest.
* [ ] Reference rate.
* [ ] Spread.
* [ ] Coupon frequency.
* [ ] Maturity date.
* [ ] Grace period.
* [ ] Amortization.
* [ ] Bullet repayment.
* [ ] PIK interest.
* [ ] Default interest.

---

## DS-304: Capital stack validation

Implement rules:

* [ ] Total tranche allocation validation.
* [ ] Seniority validation.
* [ ] Currency consistency.
* [ ] Debt/equity ratio.
* [ ] Maximum leverage.
* [ ] Minimum equity.
* [ ] Duplicate ranking prevention.
* [ ] Invalid tranche type prevention.

---

# Phase 4 — Economic Modeling

## DS-401: Deal economics

Create:

```text
DealEconomics
```

Include:

* [ ] Acquisition price.
* [ ] Enterprise value.
* [ ] Equity value.
* [ ] Valuation.
* [ ] Total capitalization.
* [ ] Fees.
* [ ] Expenses.
* [ ] Target IRR.
* [ ] Target MOIC.
* [ ] Expected yield.

---

## DS-402: Cash flow model

Create:

```text
CashFlowProjection
```

Support:

* [ ] Monthly cash flows.
* [ ] Quarterly cash flows.
* [ ] Annual cash flows.
* [ ] Operating income.
* [ ] Expenses.
* [ ] Debt service.
* [ ] Taxes.
* [ ] Net distributable income.

---

## DS-403: Return calculation engine

Implement:

* [ ] IRR.
* [ ] XIRR.
* [ ] MOIC.
* [ ] Yield.
* [ ] Cash-on-cash return.
* [ ] NPV.
* [ ] Equity multiple.

---

## DS-404: Scenario modeling

Support:

```text
Base Case
Bull Case
Bear Case
Stress Case
```

Tasks:

* [ ] Scenario entity.
* [ ] Assumption model.
* [ ] Scenario calculation.
* [ ] Scenario comparison API.
* [ ] Scenario versioning.

---

# Phase 5 — Distribution Waterfall Engine

## DS-501: Waterfall model

Create:

```text
DistributionWaterfall
```

```text
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

---

## DS-502: Waterfall tiers

Create:

```text
WaterfallTier
```

Fields:

* [ ] Tier priority.
* [ ] Recipient.
* [ ] Distribution type.
* [ ] Threshold.
* [ ] Hurdle rate.
* [ ] Percentage allocation.
* [ ] Catch-up rule.

---

## DS-503: Waterfall calculation engine

Implement:

* [ ] Calculate distributable amount.
* [ ] Apply tier priority.
* [ ] Apply hurdle.
* [ ] Apply catch-up.
* [ ] Allocate residual.
* [ ] Produce calculation trace.

---

# Phase 6 — Term Sheet Engine

## DS-601: Consolidate Term Sheet model

Remove duplicated domain state.

Currently ensure that:

```text
Deal Closing Conditions
≠
Term Sheet Closing Conditions
```

There should be one source of truth.

Tasks:

* [ ] Create canonical terms model.
* [ ] Reference closing condition IDs.
* [ ] Version terms.
* [ ] Add draft/final states.
* [ ] Add amendment support.

---

## DS-602: Economic terms

Support:

* [ ] Investment amount.
* [ ] Valuation.
* [ ] Coupon.
* [ ] Interest.
* [ ] Preferred return.
* [ ] Profit sharing.
* [ ] Revenue sharing.
* [ ] Distribution frequency.
* [ ] Maturity.
* [ ] Redemption.

---

## DS-603: Governance terms

Support:

* [ ] Voting rights.
* [ ] Board rights.
* [ ] Observer rights.
* [ ] Reserved matters.
* [ ] Consent rights.
* [ ] Information rights.
* [ ] Veto rights.

---

## DS-604: Transfer restrictions

Support:

* [ ] Lock-up period.
* [ ] Transfer approval.
* [ ] Right of first refusal.
* [ ] Tag-along.
* [ ] Drag-along.
* [ ] Investor eligibility.
* [ ] Jurisdiction restrictions.

---

## DS-605: Term sheet versioning

Implement:

```text
TermSheet
│
├── Version 1
├── Version 2
├── Version 3
└── Final Version
```

Tasks:

* [ ] Immutable versions.
* [ ] Compare versions.
* [ ] Amendment reason.
* [ ] Approval per version.
* [ ] Finalization lock.

---

# Phase 7 — Closing Conditions Engine

## DS-701: Canonical ClosingCondition aggregate/entity

Create:

```text
ClosingCondition
```

Fields:

```text
id
dealId
category
description
responsibleParty
dueDate
status
evidence
verifiedBy
verifiedAt
```

---

## DS-702: Closing condition categories

Support:

* [ ] Legal
* [ ] Regulatory
* [ ] Financial
* [ ] Tax
* [ ] Technical
* [ ] Commercial
* [ ] Operational
* [ ] Investor
* [ ] Documentation

---

## DS-703: Closing condition lifecycle

```text
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

Alternative:

```text
WAIVED
FAILED
EXPIRED
```

---

## DS-704: Evidence verification

Implement:

* [ ] Document reference.
* [ ] Evidence upload reference.
* [ ] Reviewer.
* [ ] Verification date.
* [ ] Rejection reason.
* [ ] Waiver approval.

---

# Phase 8 — Deal Approval Integration

## DS-801: Approval workflow abstraction

Deal Studio should not contain a simplistic:

```typescript
approve(userId)
```

Replace with:

```text
ApprovalReference
```

Deal Studio should consume approval outcomes from the central workflow service.

Tasks:

* [ ] Create approval request.
* [ ] Link workflow ID.
* [ ] Track approval status.
* [ ] Handle approval events.
* [ ] Handle rejection events.

---

## DS-802: Investment Committee integration

Support:

```text
Deal
 ↓
Investment Committee Review
 ↓
Decision
```

Tasks:

* [ ] Submit deal for IC.
* [ ] Generate IC package reference.
* [ ] Track committee decision.
* [ ] Record conditions.
* [ ] Handle conditional approval.
* [ ] Handle rejection.

---

# Phase 9 — Deal Documents Integration

## DS-901: Document references

Deal Studio should not own file storage.

Create:

```text
DealDocumentReference
```

Support:

* [ ] Term sheet.
* [ ] Financial model.
* [ ] Investment memo.
* [ ] Legal documents.
* [ ] Due diligence reports.
* [ ] Closing documents.
* [ ] Supporting documents.

---

## DS-902: Document lifecycle

Track:

```text
DRAFT
REVIEW
APPROVED
SUPERSEDED
ARCHIVED
```

---

# Phase 10 — External Domain References

## DS-1001: Asset Studio integration

Support:

```text
Deal → AssetReference
```

Tasks:

* [ ] Validate asset existence.
* [ ] Fetch asset summary.
* [ ] Handle asset updates.
* [ ] Handle asset deletion restrictions.

---

## DS-1002: Entity Studio integration

Deal Studio should reference entities.

Support:

```text
Deal
│
├── Sponsor
├── Borrower
├── Issuer
├── SPV
└── Counterparties
```

Tasks:

* [ ] Entity reference model.
* [ ] Entity role assignment.
* [ ] Entity validation.
* [ ] Entity relationship mapping.

---

## DS-1003: Origination OS integration

Support:

```text
Opportunity
    ↓
Approved Opportunity
    ↓
Deal Created
```

Tasks:

* [ ] Store `opportunityId`.
* [ ] Consume opportunity-approved event.
* [ ] Create deal from opportunity.
* [ ] Sync sponsor metadata.

---

# Phase 11 — Domain Events

## DS-1101: Expand domain event catalog

Implement:

```text
DealCreated
DealUpdated
DealStructuringStarted
DealStructuringCompleted

CapitalStackUpdated
CapitalTrancheAdded
CapitalTrancheRemoved

TermSheetDrafted
TermSheetUpdated
TermSheetFinalized

ClosingConditionCreated
ClosingConditionMet
ClosingConditionWaived

DealSubmittedForLegalReview
LegalReviewCompleted

DealSubmittedForApproval
DealApproved
DealRejected

DealReadyForClosing
DealClosingStarted
DealClosed

DealCancelled
DealPutOnHold
DealResumed
```

---

## DS-1102: Event versioning

Every event should contain:

```text
eventId
eventType
eventVersion
aggregateId
aggregateType
tenantId
occurredAt
correlationId
causationId
actorId
payload
```

---

# Phase 12 — Transactional Outbox

## DS-1201: Replace in-memory outbox

Current development approach should be replaced.

Implement:

```text
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

Tasks:

* [ ] Outbox table.
* [ ] Event persistence.
* [ ] Publisher worker.
* [ ] Retry strategy.
* [ ] Dead-letter queue.
* [ ] Idempotency.
* [ ] Event status tracking.

---

# Phase 13 — Concurrency & Consistency

## DS-1301: Optimistic locking

Ensure version fields actually enforce concurrency.

Tasks:

* [ ] Add version to aggregate.
* [ ] Add database optimistic lock.
* [ ] Handle concurrency exception.
* [ ] Return conflict response.
* [ ] Add concurrency tests.

---

## DS-1302: Idempotency

Implement idempotency for commands.

Commands requiring idempotency:

* [ ] Create deal.
* [ ] Update capital stack.
* [ ] Finalize term sheet.
* [ ] Submit approval.
* [ ] Close deal.

Fields:

```text
idempotencyKey
requestHash
status
responseReference
```

---

# Phase 14 — Persistence

## DS-1401: Database schema review

Review:

* [ ] Tenant isolation.
* [ ] Foreign keys.
* [ ] Indexes.
* [ ] Soft deletion.
* [ ] Audit fields.
* [ ] Version columns.
* [ ] JSON fields.
* [ ] Money representation.

---

## DS-1402: Financial precision

Do not use floating point.

Use:

```text
Decimal / BigDecimal
```

for:

* [ ] Money.
* [ ] Percentages.
* [ ] Interest rates.
* [ ] IRR.
* [ ] MOIC.
* [ ] Waterfall calculations.

---

# Phase 15 — API Completion

## DS-1501: Command APIs

Implement:

```text
POST   /deals
POST   /deals/{id}/structuring/start
PUT    /deals/{id}
PUT    /deals/{id}/capital-stack

POST   /deals/{id}/term-sheet
POST   /deals/{id}/term-sheet/finalize

POST   /deals/{id}/legal-review/submit
POST   /deals/{id}/approval/submit

POST   /deals/{id}/closing-conditions
POST   /deals/{id}/closing-conditions/{conditionId}/submit
POST   /deals/{id}/closing-conditions/{conditionId}/verify
POST   /deals/{id}/closing-conditions/{conditionId}/waive

POST   /deals/{id}/closing/start
POST   /deals/{id}/close

POST   /deals/{id}/hold
POST   /deals/{id}/resume
POST   /deals/{id}/cancel
```

---

## DS-1502: Query APIs

Implement:

```text
GET /deals
GET /deals/{id}

GET /deals/{id}/summary
GET /deals/{id}/timeline
GET /deals/{id}/participants

GET /deals/{id}/capital-stack
GET /deals/{id}/economics
GET /deals/{id}/waterfall

GET /deals/{id}/term-sheet
GET /deals/{id}/term-sheet/versions

GET /deals/{id}/closing-conditions

GET /deals/{id}/documents

GET /deals/{id}/status-history
```

---

# Phase 16 — Search & Filtering

## DS-1601: Deal search

Support:

* [ ] Deal name.
* [ ] Reference number.
* [ ] Asset.
* [ ] Sponsor.
* [ ] Deal type.
* [ ] Asset class.
* [ ] Status.
* [ ] Jurisdiction.
* [ ] Currency.
* [ ] Owner.
* [ ] Date range.

---

## DS-1602: Deal pipeline query

Create dedicated pipeline API:

```text
GET /deals/pipeline
```

Response:

```text
DRAFT              12
STRUCTURING         8
LEGAL_REVIEW        5
APPROVAL            3
CLOSING             2
CLOSED             21
```

---

# Phase 17 — Audit & Compliance

## DS-1701: Audit trail

Track:

```text
Who
Did What
To Which Deal
When
Before Value
After Value
Reason
```

Audit:

* [ ] Capital stack changes.
* [ ] Terms changes.
* [ ] Participant changes.
* [ ] Approval changes.
* [ ] Closing condition changes.
* [ ] Status changes.

---

## DS-1702: Immutable financial history

Once:

```text
TermSheetFinalized
```

or:

```text
DealClosed
```

ensure historical versions cannot be overwritten.

---

# Phase 18 — Security

## DS-1801: Tenant security

Validate tenant on every operation.

* [ ] Repository filtering.
* [ ] API tenant validation.
* [ ] Event tenant propagation.
* [ ] Cross-tenant access tests.

---

## DS-1802: Role-based permissions

Suggested roles:

```text
DealCreator
DealManager
DealAnalyst
LegalReviewer
ComplianceReviewer
InvestmentCommitteeMember
Approver
Administrator
Viewer
```

Permissions:

* [ ] Create deal.
* [ ] Modify structure.
* [ ] Finalize terms.
* [ ] Verify conditions.
* [ ] Submit approval.
* [ ] Close deal.
* [ ] Cancel deal.

---

# Phase 19 — Observability

## DS-1901: Structured logging

Every log should include:

```text
tenantId
dealId
commandId
correlationId
actorId
traceId
```

---

## DS-1902: Metrics

Track:

* [ ] Deals created.
* [ ] Deals by status.
* [ ] Average structuring duration.
* [ ] Average approval duration.
* [ ] Average closing duration.
* [ ] Failed commands.
* [ ] Event publishing failures.
* [ ] Closing condition delays.

---

## DS-1903: Distributed tracing

Trace:

```text
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

---

# Phase 20 — Testing

## DS-2001: Domain unit tests

Test all invariants.

Examples:

* [ ] Cannot close an unapproved deal.
* [ ] Cannot approve incomplete deal.
* [ ] Cannot finalize invalid term sheet.
* [ ] Cannot duplicate capital tranche rank.
* [ ] Cannot exceed leverage limits.
* [ ] Cannot close with unmet conditions.
* [ ] Cannot transition from closed deal.

---

## DS-2002: Application tests

Test:

* [ ] Command handlers.
* [ ] Query handlers.
* [ ] Repository interactions.
* [ ] Event publishing.
* [ ] Idempotency.

---

## DS-2003: Integration tests

Test:

* [ ] PostgreSQL.
* [ ] Kafka.
* [ ] Outbox.
* [ ] Multi-tenancy.
* [ ] Optimistic locking.

---

## DS-2004: End-to-end lifecycle test

Create one complete scenario:

```text
Create Deal
    ↓
Add Asset
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

---

# Recommended Implementation Priority

## P0 — Must complete first

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

---

## P1 — Institutional-grade capabilities

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

---

## P2 — Advanced capabilities

```text
Advanced scenario simulations
Complex waterfall calculations
Multi-currency economics
Financing covenant engine
Stress testing
Automated risk scoring
AI-assisted deal structuring
Term sheet comparison
Deal benchmarking
Deal intelligence analytics
```

---

# Recommended Definition of Done

The Deal Studio microservice should be considered **complete for V1** when it can execute this lifecycle reliably:

```text
                    DEAL STUDIO V1

Opportunity Reference
        │
        ▼
     Create Deal
        │
        ▼
 Add Asset + Parties
        │
        ▼
 Structure Capital Stack
        │
        ▼
 Model Deal Economics
        │
        ▼
 Create Term Sheet
        │
        ▼
 Finalize Terms
        │
        ▼
 Legal Review
        │
        ▼
 Submit for Approval
        │
        ▼
 Investment Committee Decision
        │
        ▼
 Manage Closing Conditions
        │
        ▼
 Ready to Close
        │
        ▼
      Close Deal
        │
        ▼
 Publish DealClosed Event
        │
        ├──────────────► Entity Studio
        ├──────────────► Product Studio
        ├──────────────► Compliance OS
        └──────────────► Distribution OS
```

**Important architectural boundary:** once a deal is closed, Deal Studio should publish the approved commercial and structural outcome. It should **not** own token issuance, investor onboarding, subscriptions, settlement, custody, or post-issuance corporate actions. Those belong to separate DAOS microservices.
