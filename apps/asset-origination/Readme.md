ASSET ORIGINATION
│
├── Intake
├── Screening
├── Qualification
├── Due Diligence
├── Valuation
├── Risk Assessment
├── Approval
└── Handoff to Deal Studio

The recommended lifecycle should become:

LEAD
 │
 ▼
ORIGINATED
 │
 ▼
SCREENING
 │
 ├──────► REJECTED
 │
 ▼
QUALIFIED
 │
 ▼
DUE_DILIGENCE
 │
 ├──────► ON_HOLD
 │
 ▼
VALUATION
 │
 ▼
RISK_REVIEW
 │
 ▼
READY_FOR_APPROVAL
 │
 ▼
APPROVED
 │
 ▼
HANDED_OFF_TO_DEAL
Complete Asset Origination Microservice Task List
Phase 0 — Domain Architecture
AO-001: Define Asset Origination bounded context

Document exactly what this microservice owns.

Asset Origination owns
 Asset opportunity intake
 Asset registration during origination
 Sponsor association
 Asset screening
 Qualification
 Due diligence orchestration
 Preliminary valuation
 Risk assessment
 Origination approval
 Asset pipeline management
 Asset handoff to Deal Studio
Asset Origination does not own
 Legal entity structuring
 Investment product creation
 Capital stack structuring
 Investor subscriptions
 Token issuance
 Settlement
 Custody
 Post-acquisition asset operations

Deliverable:

docs/asset-origination-bounded-context.md
AO-002: Create Asset Origination context map

Define integrations with:

Origination Sources
       │
       ▼
Asset Origination
       │
       ├────────► Asset Registry
       │
       ├────────► Entity Studio
       │
       ├────────► Document Service
       │
       ├────────► Compliance OS
       │
       ├────────► Risk Engine
       │
       └────────► Deal Studio

Tasks:

 Define upstream services.
 Define downstream services.
 Define synchronous contracts.
 Define asynchronous events.
 Define ownership of asset identity.
Phase 1 — Asset Lifecycle Redesign
AO-101: Replace current AssetStatus lifecycle

Current statuses appear to include:

originated
underDueDiligence
dueDiligenceCompleted
valuationUpdated
approved
rejected

This is problematic because:

valuationUpdated

is an event/action, not a meaningful business lifecycle state.

Replace with:

DRAFT
ORIGINATED
SCREENING
QUALIFIED
DUE_DILIGENCE
VALUATION
RISK_REVIEW
READY_FOR_APPROVAL
APPROVED
REJECTED
ON_HOLD
WITHDRAWN
HANDED_OFF

Tasks:

 Define canonical AssetOriginationStatus.
 Define transition rules.
 Prevent invalid transitions.
 Add transition metadata.
 Add transition reason.
 Add actor tracking.
AO-102: Create AssetLifecycleHistory

Create entity:

AssetLifecycleHistory

Fields:

id
assetId
tenantId
previousStatus
newStatus
transitionReason
changedBy
changedAt
metadata

Tasks:

 Domain model.
 ORM entity.
 Repository.
 Query endpoint.
 Audit integration.
AO-103: Lifecycle commands

Implement:

 CreateAssetDraft
 OriginateAsset
 StartScreening
 CompleteScreening
 QualifyAsset
 StartDueDiligence
 CompleteDueDiligence
 StartValuation
 CompleteValuation
 StartRiskReview
 CompleteRiskReview
 SubmitForApproval
 ApproveAsset
 RejectAsset
 PutAssetOnHold
 ResumeAsset
 WithdrawAsset
 HandoffToDealStudio
Phase 2 — Asset Identity & Registration
AO-201: Expand Asset identity model

Current asset model is too minimal.

Add:

AssetIdentity
│
├── assetId
├── tenantId
├── externalReference
├── internalReference
├── name
├── legalName
├── assetClass
├── assetSubclass
├── jurisdiction
├── country
├── currency
└── source

Tasks:

 Internal asset reference generation.
 External reference support.
 Asset class taxonomy.
 Asset subclass taxonomy.
 Country/jurisdiction validation.
AO-202: Asset class taxonomy

Current classes:

realEstate
privateEquity
privateCredit
infrastructure
ventureCapital
commodities
digitalAssets

Expand taxonomy.

Real Estate
 Residential
 Commercial
 Industrial
 Hospitality
 Retail
 Land
 Mixed Use
Private Credit
 Corporate Loan
 Asset-backed Loan
 Real Estate Loan
 Trade Finance
 Receivables Financing
Infrastructure
 Energy
 Transport
 Telecom
 Utilities
 Digital Infrastructure
Private Equity
 Buyout
 Growth
 Venture
 Secondary

Tasks:

 Asset taxonomy value objects.
 Validation rules.
 Configurable tenant taxonomy.
AO-203: Asset source model

Current provenance is useful but incomplete.

Create:

OriginationSource

Types:

DIRECT
SPONSOR
BROKER
ADVISOR
MARKETPLACE
PORTFOLIO
REFERRAL
INBOUND
API
PARTNER

Fields:

sourceId
sourceType
sourceEntityId
sourceReference
originatedAt
submittedBy
relationshipManager
Phase 3 — Sponsor & Counterparty Management
AO-301: Sponsor reference integration

Current implementation stores only:

sponsorId

Add sponsor snapshot/reference.

SponsorReference
│
├── entityId
├── name
├── jurisdiction
├── relationshipStatus
├── riskRating
└── verificationStatus

Tasks:

 Entity Studio integration.
 Sponsor existence validation.
 Sponsor status validation.
 Sponsor risk snapshot.
 Event handling for sponsor changes.
AO-302: Asset counterparties

Support:

 Seller
 Borrower
 Owner
 Operator
 Guarantor
 Manager
 Broker
 Advisor

Create:

AssetCounterparty

Tasks:

 Role assignment.
 Entity references.
 Effective dates.
 Counterparty risk reference.
Phase 4 — Asset Screening Engine

This is completely missing and should be added before due diligence.

AO-401: Create screening aggregate/entity

Create:

AssetScreening
Asset
 │
 ▼
Screening
 │
 ├── Eligibility
 ├── Geography
 ├── Asset Class
 ├── Size
 ├── Sponsor
 ├── Liquidity
 ├── Regulatory
 └── Preliminary Risk
AO-402: Screening criteria

Support:

 Asset class eligibility.
 Jurisdiction eligibility.
 Minimum asset value.
 Maximum asset value.
 Minimum expected return.
 Sponsor eligibility.
 Regulatory restrictions.
 ESG restrictions.
 Liquidity requirements.
 Tenant-specific investment mandates.
AO-403: Screening decision

Implement:

PASS
FAIL
CONDITIONAL
REQUIRES_REVIEW

Fields:

screeningId
assetId
criteriaResults
decision
score
comments
reviewedBy
reviewedAt
Phase 5 — Asset Qualification
AO-501: Qualification model

Create:

AssetQualification

Criteria:

 Investment thesis fit.
 Asset class fit.
 Geographic fit.
 Ticket size fit.
 Expected return fit.
 Risk appetite fit.
 Liquidity fit.
 Sponsor quality fit.
AO-502: Qualification scoring

Create scoring framework:

Investment Fit       0-100
Risk Score           0-100
Sponsor Score        0-100
Liquidity Score      0-100
ESG Score            0-100
Data Completeness    0-100

Calculate:

Overall Qualification Score

Tasks:

 Scoring engine.
 Configurable weights.
 Tenant-specific thresholds.
 Score explanation.
 Score history.
Phase 6 — Due Diligence Engine

The current Due Diligence Report is too simple.

Current:

DueDiligenceReport
├── findings
├── rating
├── summary
└── completedBy

This should become a complete Due Diligence engine.

AO-601: Due diligence categories

Support:

Due Diligence
│
├── Commercial
├── Financial
├── Legal
├── Tax
├── Regulatory
├── Technical
├── Operational
├── ESG
├── Cyber
├── Insurance
├── Market
└── Blockchain / Digital Asset

Tasks:

 Category entity.
 Category status.
 Category owner.
 Category reviewer.
AO-602: Due diligence checklist engine

Create:

DueDiligenceChecklist

Each item:

id
category
question
requirement
mandatory
status
assignedTo
evidenceRequired

Statuses:

NOT_STARTED
IN_PROGRESS
SUBMITTED
APPROVED
REJECTED
WAIVED
AO-603: Due diligence findings

Current Finding should be expanded.

Create:

DueDiligenceFinding

Fields:

findingId
category
title
description
severity
probability
impact
recommendation
owner
status
evidence

Severity:

INFO
LOW
MEDIUM
HIGH
CRITICAL
AO-604: Due diligence workflow

Implement:

DRAFT
 │
 ▼
IN_PROGRESS
 │
 ▼
SUBMITTED
 │
 ▼
IN_REVIEW
 │
 ├────► CHANGES_REQUESTED
 │
 ▼
COMPLETED
AO-605: Fix current Due Diligence domain issue

Currently:

Asset.completeDueDiligence()

creates a rating using:

_ratingPlaceholder()

which always returns:

BBB

This is a critical placeholder that must be removed.

Tasks:

 Remove _ratingPlaceholder.
 Retrieve actual completed report rating.
 Validate report exists.
 Validate report status is completed.
 Validate mandatory DD categories.
 Validate critical findings resolution.
 Store rating snapshot on Asset if required.
AO-606: Multiple Due Diligence reports

Current architecture appears to support a report per asset but needs versioning.

Support:

Asset
 │
 ├── DD Version 1
 ├── DD Version 2
 └── DD Version 3

Tasks:

 Version number.
 Superseded reports.
 Re-open workflow.
 Amendment history.
 Comparison.
Phase 7 — Valuation Engine
AO-701: Replace StubValuationAdapter

Current infrastructure contains:

stub-valuation.adapter.ts

Replace with a valuation abstraction.

ValuationProvider

Interface:

Asset
 │
 ▼
Valuation Request
 │
 ├── Internal Model
 ├── External Valuer
 ├── Market Data Provider
 └── Manual Valuation
AO-702: Valuation methodologies

Support:

 Market approach.
 Income approach.
 Cost approach.
 Discounted cash flow.
 Comparable transactions.
 Comparable companies.
 NAV.
 Cap rate.
 Yield based.
 Appraisal.
AO-703: Valuation model

Expand current:

AssetValuation

to:

AssetValuation
│
├── valuationId
├── assetId
├── methodology
├── fairValue
├── currency
├── valuationDate
├── effectiveDate
├── valuer
├── assumptions
├── confidenceLevel
├── supportingDocuments
└── status
AO-704: Valuation history

Do not overwrite valuations.

Implement:

Asset
 │
 ├── Valuation 1
 ├── Valuation 2
 ├── Valuation 3
 └── Current Valuation

Tasks:

 Historical persistence.
 Current valuation pointer.
 Approval.
 Superseding.
 Valuation comparison.
Phase 8 — Cash Flow Modeling

The uploaded code includes:

CashFlowModel Aggregate

but it currently appears disconnected from the rest of the service.

There are no visible:

persistence entities
repositories
commands
queries
controllers
integration with valuation

This should be completed.

AO-801: Complete CashFlowModel persistence

Create:

 Cash flow ORM entity.
 Cash flow repository.
 Persistence mapper.
 Repository token.
 Database migration.
AO-802: Cash flow model commands

Implement:

 CreateCashFlowModel
 UpdateCashFlowModel
 AddCashFlow
 UpdateCashFlow
 DeleteCashFlow
 SetDiscountRate
 CloneCashFlowModel
 FinalizeCashFlowModel
AO-803: Cash flow model validation

Validate:

 Positive term periods.
 Unique periods.
 Currency consistency.
 No invalid discount rate.
 Period sequence.
 Required initial investment.
 Complete model.
AO-804: Cash flow calculations

Implement:

 NPV.
 IRR.
 XIRR.
 Yield.
 Payback period.
 Discounted payback.
 Sensitivity analysis.
AO-805: Scenario support

Add:

BASE_CASE
BULL_CASE
BEAR_CASE
STRESS_CASE

Tasks:

 Scenario assumptions.
 Scenario-specific cash flows.
 Scenario comparison.
 Scenario results.
Phase 9 — Asset Risk Assessment

Currently missing.

AO-901: Risk Assessment aggregate

Create:

AssetRiskAssessment

Categories:

Market Risk
Credit Risk
Liquidity Risk
Operational Risk
Legal Risk
Regulatory Risk
Sponsor Risk
Valuation Risk
Concentration Risk
ESG Risk
Technology Risk
AO-902: Risk scoring

Implement:

Likelihood
×
Impact
=
Risk Score

Support:

LOW
MEDIUM
HIGH
CRITICAL
AO-903: Risk register

Create:

Risk
├── Risk ID
├── Category
├── Description
├── Probability
├── Impact
├── Score
├── Mitigation
├── Owner
└── Status
Phase 10 — Asset Document Integration
AO-1001: Asset document references

Asset Origination should not store files directly.

Integrate with Document Service.

Create:

AssetDocumentReference

Document types:

 Teaser
 Investment Memorandum
 Financial Statements
 Valuation Report
 Legal Documents
 Asset Title
 Insurance
 Technical Report
 ESG Report
 Due Diligence Evidence
AO-1002: Document requirements

Support document rules by asset class.

Example:

Real Estate
├── Title
├── Valuation
├── Lease Data
└── Insurance
Private Credit
├── Borrower Financials
├── Loan Agreement
├── Collateral
└── Credit Assessment

Tasks:

 Required document templates.
 Missing document validation.
 Document verification status.
Phase 11 — Approval Workflow
AO-1101: Remove simplistic approval model

Current:

asset.approve(approvedBy)

This is too simplistic.

Replace with integration to an Approval/Workflow service.

Asset
 │
 ▼
Approval Request
 │
 ├── Investment Review
 ├── Risk Review
 ├── Compliance Review
 └── Final Decision
AO-1102: Asset approval states

Support:

NOT_SUBMITTED
PENDING
IN_REVIEW
CONDITIONALLY_APPROVED
APPROVED
REJECTED
AO-1103: Conditional approval

Allow:

Asset Approved
        │
        ▼
Conditions
├── Obtain Document
├── Complete DD
├── Update Valuation
└── Legal Confirmation

The asset should not move to final handoff until conditions are resolved.

Phase 12 — Asset Pipeline Management

Currently ListAssets exists, but a real pipeline view is missing.

AO-1201: Pipeline stages

Create pipeline:

LEADS
 │
 ▼
ORIGINATED
 │
 ▼
SCREENING
 │
 ▼
QUALIFIED
 │
 ▼
DUE DILIGENCE
 │
 ▼
VALUATION
 │
 ▼
RISK REVIEW
 │
 ▼
APPROVAL
 │
 ▼
APPROVED
 │
 ▼
DEAL STUDIO
AO-1202: Pipeline query API

Implement:

GET /assets/pipeline

Response:

ORIGINATED             25
SCREENING              12
QUALIFIED               8
DUE_DILIGENCE           6
VALUATION               4
RISK_REVIEW             3
APPROVAL                2
APPROVED                10
AO-1203: Pipeline metrics

Track:

 Assets originated.
 Qualification rate.
 Rejection rate.
 Average DD duration.
 Approval rate.
 Average time to approval.
 Assets by class.
 Assets by jurisdiction.
 Pipeline value.
Phase 13 — Deal Studio Handoff

This is one of the most important integrations.

AO-1301: Create Asset-to-Deal handoff workflow

When asset becomes approved:

Asset Origination
       │
       ▼
Asset Approved
       │
       ▼
Ready for Deal Structuring
       │
       ▼
Create Deal Request
       │
       ▼
Deal Studio
AO-1302: Define AssetApproved event contract

Current event is too minimal.

Recommended:

AssetApproved
├── eventId
├── eventVersion
├── assetId
├── tenantId
├── assetClass
├── sponsorId
├── currentValuation
├── currency
├── riskRating
├── dueDiligenceRating
├── jurisdictions
├── approvedAt
└── correlationId
AO-1303: Deal creation handoff

Choose one architecture:

Option A — Event-driven
AssetApproved
      ↓
Kafka
      ↓
Deal Studio
      ↓
Create Deal
Option B — Explicit command
User clicks:
"Create Deal"
      ↓
Deal Studio API

I recommend supporting both:

automatic suggestion/event
explicit user-controlled deal creation
Phase 14 — Domain Events
AO-1401: Expand event catalog

Current events are too limited.

Add:

AssetDraftCreated
AssetOriginated

AssetScreeningStarted
AssetScreeningCompleted
AssetQualified

DueDiligenceStarted
DueDiligenceFindingCreated
DueDiligenceCompleted

ValuationRequested
ValuationCompleted
ValuationApproved

RiskAssessmentStarted
RiskAssessmentCompleted

AssetSubmittedForApproval
AssetConditionallyApproved
AssetApproved
AssetRejected

AssetPutOnHold
AssetResumed
AssetWithdrawn

AssetHandedOffToDealStudio
AO-1402: Event envelope

All events should contain:

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
Phase 15 — Transactional Outbox
AO-1501: Replace InMemoryOutbox

The current service includes:

InMemoryOutbox

This is not production-ready.

Implement:

PostgreSQL Transaction
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

Tasks:

 Outbox ORM entity.
 Event serialization.
 Transactional persistence.
 Publisher worker.
 Retry.
 Dead letter queue.
 Event idempotency.
 Publishing metrics.
Phase 16 — Concurrency
AO-1601: Enforce optimistic locking

The Asset ORM has:

version

But ensure it is actually enforced.

Tasks:

 TypeORM version support.
 Expected version validation.
 Concurrent update rejection.
 Conflict response.
 Concurrency tests.
Phase 17 — API Completion
AO-1701: Asset commands
POST   /assets/drafts
POST   /assets
PUT    /assets/{id}

POST   /assets/{id}/screening/start
POST   /assets/{id}/screening/complete

POST   /assets/{id}/qualify

POST   /assets/{id}/due-diligence/start
POST   /assets/{id}/due-diligence/submit
POST   /assets/{id}/due-diligence/complete

POST   /assets/{id}/valuation
POST   /assets/{id}/valuation/approve

POST   /assets/{id}/risk-assessment/start
POST   /assets/{id}/risk-assessment/complete

POST   /assets/{id}/approval/submit
POST   /assets/{id}/approve
POST   /assets/{id}/reject

POST   /assets/{id}/hold
POST   /assets/{id}/resume
POST   /assets/{id}/withdraw

POST   /assets/{id}/handoff-to-deal
AO-1702: Asset query APIs
GET /assets
GET /assets/{id}

GET /assets/{id}/summary
GET /assets/{id}/timeline

GET /assets/{id}/screening
GET /assets/{id}/qualification

GET /assets/{id}/due-diligence
GET /assets/{id}/due-diligence/findings

GET /assets/{id}/valuations
GET /assets/{id}/valuations/current

GET /assets/{id}/cash-flow-models

GET /assets/{id}/risk-assessment

GET /assets/{id}/documents

GET /assets/{id}/approval

GET /assets/pipeline
Phase 18 — Search & Filtering
AO-1801: Asset search

Support:

 Asset name.
 Reference number.
 Asset class.
 Asset subclass.
 Sponsor.
 Jurisdiction.
 Status.
 Risk rating.
 Due diligence rating.
 Valuation range.
 Date range.
AO-1802: Advanced filtering

Support:

Asset Class = Real Estate
AND

Jurisdiction = Spain
AND

Valuation > €10M
AND

Risk Rating <= Medium
AND

Status = Qualified
Phase 19 — Audit Trail
AO-1901: Asset audit log

Track:

Who
Did What
On Which Asset
When
Before
After
Reason

Audit:

 Asset changes.
 Sponsor changes.
 Valuation changes.
 DD changes.
 Risk changes.
 Status changes.
 Approval decisions.
Phase 20 — Security
AO-2001: Tenant isolation

Ensure:

 Tenant filtering at repository level.
 Tenant validation at command level.
 Tenant propagation in events.
 Cross-tenant tests.
AO-2002: RBAC

Suggested roles:

OriginationAnalyst
OriginationManager
DueDiligenceAnalyst
RiskAnalyst
ValuationAnalyst
LegalReviewer
ComplianceReviewer
InvestmentCommitteeMember
Approver
Administrator
Viewer
Phase 21 — Observability
AO-2101: Structured logging

Every operation should include:

tenantId
assetId
commandId
correlationId
actorId
traceId
AO-2102: Metrics

Track:

 Assets originated.
 Assets qualified.
 Assets rejected.
 DD duration.
 Approval duration.
 Pipeline value.
 Assets by class.
 Event publishing failures.
 Command failures.
Phase 22 — Testing
AO-2201: Asset aggregate tests

Test:

 Cannot approve rejected asset.
 Cannot approve without valuation.
 Cannot approve without DD completion.
 Cannot restart invalid lifecycle stage.
 Cannot handoff unapproved asset.
 Cannot modify finalized asset incorrectly.
AO-2202: Due diligence tests

Test:

 Cannot complete incomplete mandatory DD.
 Cannot complete twice.
 Critical findings block approval.
 Waived findings require authorization.
 DD rating calculated correctly.
AO-2203: Valuation tests

Test:

 Invalid valuation rejected.
 Currency consistency.
 Historical valuations preserved.
 Valuation approval workflow.
AO-2204: Cash flow tests

Test:

 NPV.
 IRR.
 XIRR.
 Discount rates.
 Scenario calculations.
AO-2205: Integration tests

Test:

 PostgreSQL.
 Kafka.
 Outbox.
 Multi-tenancy.
 Optimistic locking.
 Event consumption