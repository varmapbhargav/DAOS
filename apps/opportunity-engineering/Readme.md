Scenario
│
├── Investment Strategy
│
├── Acquisition Assumptions
│
├── Financing Assumptions
│
├── Operating Assumptions
│
├── Revenue Assumptions
│
├── Expense Assumptions
│
├── Exit Assumptions
│
├── Capital Structure
│
├── Cash Flow Model
│
├── Return Profile
│
├── Risk Profile
│
├── Constraints
│
└── Optimization Results
3. Recommended Position in Capiora DAOS

The correct flow should be:

ASSET ORIGINATION
        │
        │ Qualified / Approved Asset
        ▼
OPPORTUNITY ENGINEERING
        │
        ├── Investment Thesis
        ├── Strategy Design
        ├── Scenario Modeling
        ├── Financial Modeling
        ├── Sensitivity Analysis
        ├── Risk/Return Analysis
        ├── Structure Optimization
        └── Opportunity Selection
        │
        ▼
DEAL STUDIO
        │
        ├── Capital Stack
        ├── Term Sheet
        ├── Legal Structure
        ├── Closing Conditions
        └── Deal Execution

Therefore:

Asset Origination asks

Is this asset worth investigating?

Opportunity Engineering asks

What is the best investment opportunity we can create around this asset?

Deal Studio asks

How do we formally structure and execute the selected opportunity?

This boundary is important.

Complete Task List
Phase 0 — Domain Boundary
OE-001: Define Opportunity Engineering bounded context

Document what the service owns.

Opportunity Engineering owns
 Opportunity creation
 Investment thesis
 Investment strategy alternatives
 Scenario modelling
 Financial modelling
 Return modelling
 Sensitivity analysis
 Risk-return optimisation
 Structure optimisation
 Opportunity scoring
 Recommended strategy selection
 Opportunity approval
 Handoff to Deal Studio
It should not own
 Asset due diligence
 Asset master data
 Legal entity creation
 Final capital stack
 Term sheet
 Investment committee workflow
 Token issuance
 Investor subscriptions
 Settlement
OE-002: Define context map

Create:

Asset Origination
      │
      │ AssetQualified
      ▼
Opportunity Engineering
      │
      ├── Market Data
      ├── Financial Model
      ├── Risk Engine
      ├── Strategy Optimizer
      │
      ▼
OpportunityApproved
      │
      ▼
Deal Studio

Tasks:

 Define upstream event contracts.
 Define downstream event contracts.
 Define synchronous APIs.
 Define ownership boundaries.
 Define anti-corruption layer for Asset Origination.
Phase 1 — Opportunity Lifecycle Redesign
OE-101: Replace current lifecycle

Current statuses appear to include:

engineered
scored
scenarioApproved
approved
rejected

These mix activities and lifecycle states.

Replace with:

DRAFT
ENGINEERING
THESIS_DEFINED
SCENARIO_MODELING
ANALYSIS
OPTIMIZATION
RECOMMENDED
READY_FOR_APPROVAL
APPROVED
REJECTED
ON_HOLD
HANDED_OFF
ARCHIVED
OE-102: Separate sub-workflows

The Opportunity aggregate should not have one overloaded status.

Use:

Opportunity
│
├── EngineeringStatus
├── ScenarioStatus
├── AnalysisStatus
├── OptimizationStatus
└── ApprovalStatus

Example:

EngineeringStatus
DRAFT
IN_PROGRESS
COMPLETE
ScenarioStatus
NOT_STARTED
MODELING
ANALYZED
SELECTED
ApprovalStatus
NOT_SUBMITTED
PENDING
APPROVED
REJECTED
OE-103: Opportunity lifecycle history

Create:

OpportunityLifecycleHistory

Fields:

id
opportunityId
previousState
newState
reason
changedBy
changedAt
metadata

Tasks:

 Domain model.
 Persistence entity.
 Repository.
 Query API.
 Audit integration.
Phase 2 — Opportunity Aggregate Expansion
OE-201: Expand Opportunity identity

Add:

OpportunityIdentity

Fields:

 Opportunity ID
 Tenant ID
 Reference number
 Name
 Description
 Opportunity type
 Asset ID
 Sponsor ID
 Jurisdiction
 Currency
 Owner
 Team
 Created date
OE-202: Opportunity type taxonomy

Support:

 Acquire and hold
 Acquire and improve
 Development
 Redevelopment
 Refinancing
 Private credit
 Asset-backed financing
 Revenue participation
 Lease financing
 Trade finance
 Sale and leaseback
 Structured investment
 Co-investment
 Portfolio acquisition
OE-203: Add opportunity description

The aggregate currently has only a name.

Add:

OpportunityDescription

Include:

 Investment rationale
 Opportunity summary
 Problem being solved
 Value creation thesis
 Key risks
 Competitive advantage
 Proposed strategy
Phase 3 — Investment Thesis Engine

This is currently missing and should become central.

OE-301: Create InvestmentThesis entity
InvestmentThesis
│
├── Thesis Statement
├── Investment Rationale
├── Value Creation Drivers
├── Market Opportunity
├── Key Risks
├── Expected Return
├── Investment Horizon
└── Exit Strategy

Tasks:

 Thesis creation.
 Versioning.
 Draft/final states.
 Approval.
 Amendment history.
OE-302: Value creation drivers

Support:

Revenue Growth
Cost Reduction
Operational Improvement
Asset Repositioning
Leverage Optimization
Refinancing
Market Appreciation
Arbitrage
Technology Improvement
Portfolio Synergies

Each driver should include:

 Description
 Expected impact
 Probability
 Time horizon
 Dependencies
OE-303: Exit strategy

Support:

 Sale
 Refinancing
 IPO
 Secondary sale
 Redemption
 Maturity
 Recapitalization

Fields:

exitType
targetDate
targetValue
assumptions
probability
Phase 4 — Strategy Engineering

This is the largest missing capability.

OE-401: Create InvestmentStrategy aggregate/entity

An opportunity should support multiple strategies.

Opportunity
│
├── Strategy A
│   └── Buy and Hold
│
├── Strategy B
│   └── Acquire + Improve
│
└── Strategy C
    └── Acquire + Refinance

Create:

InvestmentStrategy

Fields:

strategyId
opportunityId
name
strategyType
description
status
OE-402: Strategy types

Support:

BUY_AND_HOLD
VALUE_ADD
DEVELOPMENT
REDEVELOPMENT
TURNAROUND
INCOME
GROWTH
REFINANCING
ARBITRAGE
STRUCTURED_FINANCING
OE-403: Strategy constraints

Add:

StrategyConstraint

Examples:

 Maximum leverage
 Minimum IRR
 Minimum MOIC
 Maximum hold period
 Maximum downside
 Minimum liquidity
 Jurisdiction restrictions
 Investment amount
 Risk tolerance
Phase 5 — Scenario Modeling Completion
OE-501: Redesign ScenarioModel

Current model:

ScenarioModel
├── name
├── scenarioType
├── assumptions
├── IRR
└── MOIC

Recommended:

ScenarioModel
│
├── Scenario Identity
│
├── Strategy Reference
│
├── Acquisition Assumptions
│
├── Financing Assumptions
│
├── Operating Assumptions
│
├── Revenue Assumptions
│
├── Expense Assumptions
│
├── Exit Assumptions
│
├── Risk Assumptions
│
├── Financial Model
│
├── Projected Returns
│
└── Simulation Results
OE-502: Structured assumptions

Replace:

Record<string, number>

with typed assumption groups.

Acquisition assumptions
 Purchase price
 Acquisition costs
 Closing costs
 Initial CapEx
Financing assumptions
 Loan amount
 Interest rate
 Loan term
 Amortization
 LTV
Operating assumptions
 Revenue growth
 Occupancy
 Operating expenses
 Maintenance
Exit assumptions
 Exit date
 Exit valuation
 Exit multiple
 Exit costs
OE-503: Scenario lifecycle

Implement:

DRAFT
MODELING
CALCULATED
SIMULATED
REVIEWED
SELECTED
REJECTED
ARCHIVED
OE-504: Scenario versioning

Support:

Scenario
├── v1
├── v2
├── v3
└── Final

Tasks:

 Immutable versions.
 Clone scenario.
 Compare versions.
 Amendment reason.
 Historical calculations.
Phase 6 — Financial Modeling Engine

The current scenario only stores:

projectedIrrPercent
projectedMultiple

This is insufficient.

OE-601: Create FinancialModel aggregate
FinancialModel
│
├── Initial Investment
├── Revenue Forecast
├── Expense Forecast
├── Financing
├── CapEx
├── Taxes
├── Cash Flows
├── Exit
└── Returns
OE-602: Cash flow modeling

Support:

Period
│
├── Revenue
├── Operating Expenses
├── EBITDA
├── CapEx
├── Interest
├── Principal
├── Taxes
└── Net Cash Flow
OE-603: Return calculations

Implement:

 IRR
 XIRR
 MOIC
 NPV
 Yield
 Cash-on-cash
 Payback period
 Equity multiple
OE-604: Financial model validation

Validate:

 Currency consistency.
 Period continuity.
 Initial investment.
 Financing balance.
 Exit assumptions.
 Invalid negative values where prohibited.
 Financial reconciliation.
Phase 7 — Scenario Projection Engine
OE-701: Complete projection workflow

Currently:

applyProjection(irrPercent, multiple)

exists but there is no visible complete API workflow around calculation.

Tasks:

 Create projection command.
 Connect financial model.
 Calculate projected returns.
 Persist calculation results.
 Store calculation timestamp.
 Store model version.
 Store assumptions snapshot.
OE-702: Calculation trace

Every projection should include:

CalculationResult
│
├── Input Assumptions
├── Formula Version
├── Calculation Time
├── Cash Flow Output
├── IRR
├── MOIC
├── NPV
└── Warnings

This is important for institutional auditability.

Phase 8 — Sensitivity Analysis

The aggregate already has:

SensitivityFactor[]

but this is not fully operational.

OE-801: Complete sensitivity engine

For every key variable:

Variable
   │
   ├── Base
   ├── Upside
   └── Downside

Calculate:

IRR impact
MOIC impact
NPV impact
Risk impact
OE-802: Sensitivity matrix

Support:

             Exit Cap Rate
             5%   6%   7%

Rent Growth
2%          ...
3%          ...
4%          ...

Tasks:

 One-variable sensitivity.
 Two-variable sensitivity.
 Matrix persistence.
 API output.
 Visualization-ready DTO.
Phase 9 — Monte Carlo Simulation

The code already contains:

MonteCarloSimulationService

This is a strong foundation, but it should be fully integrated.

OE-901: Complete Monte Carlo integration

Tasks:

 Simulation command.
 Simulation input model.
 Distribution configuration.
 Iteration configuration.
 Persist simulation result.
 Associate result with scenario.
OE-902: Probability distributions

Support:

 Normal
 Log-normal
 Uniform
 Triangular
 Beta
 Custom discrete
OE-903: Monte Carlo outputs

Calculate:

 Expected IRR
 Median IRR
 P10
 P50
 P90
 Expected MOIC
 Probability of loss
 Probability of target return
 Value at Risk
OE-904: Simulation result model

Create:

SimulationResult
│
├── scenarioId
├── iterations
├── distributionResults
├── expectedReturn
├── downsideProbability
├── upsideProbability
├── VaR
└── generatedAt
Phase 10 — Opportunity Scoring Engine

The current service has:

OpportunityScoringEngine

This should be expanded.

OE-1001: Define scoring dimensions

Recommended dimensions:

Return Potential
Risk Profile
Asset Quality
Sponsor Quality
Liquidity
Market Opportunity
Data Quality
Execution Complexity
Regulatory Complexity
Strategic Fit
OE-1002: Weighted scoring model

Implement:

Score
=
Return Score × Weight
+
Risk Score × Weight
+
Market Score × Weight
+
Strategic Fit × Weight

Tasks:

 Configurable weights.
 Tenant-specific scoring.
 Asset-class scoring.
 Score explanation.
 Score breakdown.
OE-1003: Score history

Do not overwrite:

Opportunity Score

Maintain:

Score v1
Score v2
Score v3
Current Score
Phase 11 — Risk-Adjusted Return Analysis

This is currently missing.

OE-1101: Risk-adjusted performance model

Calculate:

Risk Adjusted Return

Inputs:

 Expected return
 Downside probability
 Volatility
 Liquidity risk
 Execution risk
 Market risk
OE-1102: Risk-return frontier

Support comparison:

Return
  ▲
  │           ● Strategy B
  │
  │      ● Strategy A
  │
  │  ● Strategy C
  └────────────────────► Risk

Tasks:

 Calculate risk score.
 Calculate expected return.
 Compare strategies.
 Identify dominated strategies.
 Recommend efficient strategies.
Phase 12 — Structure Optimization

The aggregate raises:

StructureOptimized

but there is no actual complete structure optimization engine.

This is currently a major gap.

OE-1201: Create StructureOptimizationEngine

Inputs:

Target Return
Maximum Risk
Investment Size
Hold Period
Leverage Limit
Liquidity Constraints

Optimization dimensions:

Investment Amount
Leverage
Holding Period
Exit Value
Operating Growth
Capital Allocation

Outputs:

Optimal Strategy
Optimal Scenario
Expected IRR
Expected MOIC
Risk Score
Confidence
OE-1202: Optimization algorithms

Start with:

 Rule-based optimization.
 Grid search.
 Scenario ranking.

Later:

 Genetic algorithm.
 Bayesian optimization.
 AI-assisted optimization.
OE-1203: Optimization history

Store:

OptimizationRun
│
├── Inputs
├── Constraints
├── Candidate Scenarios
├── Selected Scenario
├── Results
└── Timestamp
Phase 13 — Scenario Comparison
OE-1301: Scenario comparison engine

Support:

Scenario A vs Scenario B vs Scenario C

Compare:

 IRR
 MOIC
 NPV
 Downside
 Risk
 Liquidity
 Capital requirement
 Hold period
OE-1302: Recommendation engine

Generate:

Recommended Scenario

Based on:

Maximum Risk Adjusted Return

Include explanation:

Selected because:
- Highest expected IRR
- Acceptable downside risk
- Meets liquidity constraints
- Fits target hold period
Phase 14 — Opportunity Approval
OE-1401: Remove simplistic approval

Current:

approve(approvedBy)

is too simple.

Opportunity Engineering should prepare the opportunity for approval.

Use:

Opportunity
   │
   ▼
Recommendation Package
   │
   ▼
Approval Workflow
OE-1402: Approval package

Create:

OpportunityApprovalPackage
│
├── Investment Thesis
├── Selected Strategy
├── Approved Scenario
├── Financial Model
├── Return Profile
├── Risk Analysis
├── Sensitivity Analysis
├── Monte Carlo Results
└── Recommendation
OE-1403: Approval readiness validation

Before approval:

 Investment thesis required.
 At least one calculated scenario.
 Selected scenario required.
 Score required.
 Financial model complete.
 Risk analysis complete.
 Required simulations complete.
Phase 15 — Deal Studio Handoff

This is critical.

OE-1501: Opportunity-to-Deal handoff

Once approved:

Asset
  │
  ▼
Opportunity
  │
  ▼
Selected Strategy
  │
  ▼
Approved Scenario
  │
  ▼
Deal Studio
OE-1502: Define OpportunityApproved event

The current event should be expanded.

Recommended payload:

OpportunityApproved
│
├── eventId
├── eventVersion
├── opportunityId
├── tenantId
├── assetId
├── sponsorId
│
├── selectedStrategyId
├── approvedScenarioId
│
├── targetReturn
├── projectedIRR
├── projectedMOIC
├── projectedHoldPeriod
│
├── opportunityScore
├── riskScore
│
└── approvedAt
OE-1503: Create Deal handoff package

Deal Studio should receive a reference/snapshot:

OpportunityHandoffPackage
│
├── Asset Reference
├── Sponsor Reference
├── Investment Thesis
├── Recommended Strategy
├── Approved Scenario
├── Financial Assumptions
├── Return Profile
├── Risk Profile
└── Optimization Results
Phase 16 — External Data Integration
OE-1601: Market data adapter

Create abstraction:

MarketDataProvider

Potential inputs:

 Interest rates
 Inflation
 FX rates
 Comparable transactions
 Market yields
 Asset price indices
OE-1602: Asset data integration

Consume from Asset Origination:

 Asset details
 Valuation
 Cash flow model
 Due diligence summary
 Risk assessment
 Sponsor information

Do not duplicate the Asset aggregate.

Phase 17 — Domain Events
OE-1701: Expand event catalog

Recommended:

OpportunityCreated
OpportunityEngineeringStarted

InvestmentThesisCreated
InvestmentThesisUpdated
InvestmentThesisFinalized

StrategyCreated
StrategyUpdated

ScenarioCreated
ScenarioCalculated
ScenarioSimulated
ScenarioApproved
ScenarioRejected

SensitivityAnalysisCompleted

MonteCarloSimulationCompleted

OpportunityScored

RiskReturnAnalysisCompleted

StructureOptimizationStarted
StructureOptimized

OpportunityRecommendationCreated

OpportunitySubmittedForApproval
OpportunityApproved
OpportunityRejected

OpportunityHandedOffToDealStudio
OE-1702: Event envelope

All events should include:

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
Phase 18 — Transactional Outbox
OE-1801: Replace in-memory outbox

Current:

InMemoryOutbox

should not be production architecture.

Implement:

PostgreSQL Transaction
        │
        ├── Opportunity State
        │
        └── Outbox Events
                 │
                 ▼
            Outbox Worker
                 │
                 ▼
                Kafka

Tasks:

 Outbox entity.
 Transactional event persistence.
 Event relay worker.
 Retry strategy.
 Dead letter queue.
 Event idempotency.
 Monitoring.
Phase 19 — Persistence Completion
OE-1901: Review aggregate persistence

Current persistence exists for:

Opportunity
ScenarioModel

Add persistence for:

 InvestmentThesis
 InvestmentStrategy
 FinancialModel
 ScenarioVersion
 SimulationResult
 SensitivityAnalysis
 OptimizationRun
 ScoreHistory
 LifecycleHistory
OE-1902: Financial precision

Do not use JavaScript floating point for financial calculations.

Current:

number

for:

IRR
MOIC
Assumptions
Returns

should be carefully abstracted.

Use decimal arithmetic for:

 Money
 Rates
 Percentages
 Multiples
 Valuation
 Financial calculations
Phase 20 — Concurrency
OE-2001: Enforce optimistic locking

The persistence model should ensure version fields are enforced.

Tasks:

 Expected version.
 Atomic updates.
 Conflict handling.
 Retry strategy.
 Concurrency tests.
Phase 21 — API Completion
OE-2101: Opportunity APIs
POST /opportunities
GET  /opportunities
GET  /opportunities/{id}
GET  /opportunities/{id}/summary

POST /opportunities/{id}/engineering/start

POST /opportunities/{id}/thesis
PUT  /opportunities/{id}/thesis
POST /opportunities/{id}/thesis/finalize

POST /opportunities/{id}/strategies
GET  /opportunities/{id}/strategies

POST /opportunities/{id}/scenarios
GET  /opportunities/{id}/scenarios

POST /opportunities/{id}/score

POST /opportunities/{id}/analysis/sensitivity
POST /opportunities/{id}/analysis/simulation

POST /opportunities/{id}/optimize

POST /opportunities/{id}/recommend

POST /opportunities/{id}/approval/submit

POST /opportunities/{id}/approve
POST /opportunities/{id}/reject

POST /opportunities/{id}/handoff-to-deal
OE-2102: Scenario APIs
GET /scenarios/{id}

PUT /scenarios/{id}

POST /scenarios/{id}/calculate

POST /scenarios/{id}/simulate

POST /scenarios/{id}/approve

POST /scenarios/{id}/clone

GET /scenarios/{id}/results

GET /scenarios/{id}/sensitivity
Phase 22 — Search & Pipeline
OE-2201: Opportunity search

Support:

 Name
 Asset
 Sponsor
 Opportunity type
 Status
 Score
 Target IRR
 Risk rating
 Strategy
 Jurisdiction
OE-2202: Opportunity pipeline

Create:

GET /opportunities/pipeline

Pipeline:

ENGINEERING
THESIS
SCENARIOS
ANALYSIS
OPTIMIZATION
RECOMMENDED
APPROVAL
APPROVED
Phase 23 — Audit & Explainability

This is especially important because Opportunity Engineering makes analytical recommendations.

OE-2301: Calculation audit trail

For every calculation:

Who initiated it
When
Which model version
Which assumptions
Which algorithm version
What result
OE-2302: Recommendation explainability

The system should answer:

Why was this scenario recommended?

Store:

RecommendationExplanation

Example:

Scenario B selected because:

- IRR is 18.2%
- MOIC is 1.9x
- Downside probability is below 12%
- Risk score is Medium
- Meets 36-month hold period constraint
Phase 24 — Security
OE-2401: RBAC

Suggested roles:

OpportunityAnalyst
InvestmentAnalyst
FinancialModeler
RiskAnalyst
StrategyManager
InvestmentManager
Approver
Administrator
Viewer

Permissions:

 Create opportunity.
 Modify thesis.
 Create strategy.
 Create scenario.
 Run simulations.
 Optimize structure.
 Approve scenario.
 Approve opportunity.
Phase 25 — Observability
OE-2501: Structured logging

Include:

tenantId
opportunityId
strategyId
scenarioId
commandId
correlationId
actorId
traceId
OE-2502: Metrics

Track:

 Opportunities created.
 Scenarios per opportunity.
 Average engineering duration.
 Simulation duration.
 Optimization duration.
 Approval rate.
 Recommended strategy distribution.
 Average projected IRR.
 Calculation failures.
Phase 26 — Testing
OE-2601: Opportunity aggregate tests

Test:

 Cannot approve without score.
 Cannot approve without selected scenario.
 Cannot approve rejected opportunity.
 Cannot add scenarios after final rejection.
 Invalid lifecycle transitions.
 Handoff only after approval.
OE-2602: Scenario tests

Test:

 Cannot approve without projection.
 Cannot calculate invalid assumptions.
 Scenario version immutability.
 Scenario comparison accuracy.
 Clone correctness.
OE-2603: Financial model tests

Test:

 IRR.
 XIRR.
 MOIC.
 NPV.
 Cash flow calculations.
 Sensitivity calculations.
OE-2604: Monte Carlo tests

Test:

 Distribution generation.
 Deterministic seed testing.
 Percentile calculation.
 Probability calculation.
 Performance.
OE-2605: End-to-end lifecycle

Create a full scenario:

Approved Asset
      ↓
Create Opportunity
      ↓
Define Investment Thesis
      ↓
Create Strategies
      ↓
Create Base Scenario
      ↓
Create Bull Scenario
      ↓
Create Bear Scenario
      ↓
Build Financial Models
      ↓
Calculate Returns
      ↓
Run Sensitivity Analysis
      ↓
Run Monte Carlo
      ↓
Score Opportunity
      ↓
Optimize Structure
      ↓
Compare Scenarios
      ↓
Select Recommended Scenario
      ↓
Submit for Approval
      ↓
Approve Opportunity
      ↓
Publish OpportunityApproved
      ↓
Deal Studio
P0 — Immediate Priority Tasks

These are the most important tasks to finish the service foundation.

OE-001  Define bounded context
OE-002  Context map

OE-101  Redesign lifecycle
OE-102  Separate sub-workflows
OE-103  Lifecycle history

OE-201  Expand Opportunity aggregate
OE-301  Investment Thesis

OE-401  Investment Strategy
OE-402  Strategy taxonomy
OE-403  Strategy constraints

OE-501  Redesign ScenarioModel
OE-502  Structured assumptions
OE-503  Scenario lifecycle

OE-601  Financial Model
OE-602  Cash flow modeling
OE-603  Return calculations

OE-701  Complete projection workflow

OE-801  Sensitivity analysis

OE-901  Monte Carlo integration

OE-1001 Opportunity scoring dimensions

OE-1101 Risk-adjusted return

OE-1201 Structure optimization engine

OE-1301 Scenario comparison
OE-1302 Recommendation engine

OE-1402 Approval package

OE-1501 Deal handoff

OE-1701 Domain events

OE-1801 Transactional outbox

OE-1901 Persistence completion
OE-1902 Financial precision

OE-2001 Optimistic locking

OE-2101 APIs
OE-2102 Scenario APIs

OE-2301 Calculation audit
OE-2302 Explainability

OE-2601 Domain tests
P1 — Institutional-Grade Capabilities
OE-202 Opportunity taxonomy
OE-203 Opportunity description

OE-302 Value creation drivers
OE-303 Exit strategy

OE-504 Scenario versioning

OE-604 Financial validation

OE-802 Sensitivity matrix

OE-902 Probability distributions
OE-903 Monte Carlo outputs

OE-1002 Weighted scoring
OE-1003 Score history

OE-1102 Risk-return frontier

OE-1202 Optimization algorithms
OE-1203 Optimization history

OE-1403 Approval readiness

OE-1601 Market data integration
OE-1602 Asset data integration

OE-2201 Search
OE-2202 Pipeline

OE-2401 RBAC
OE-2501 Observability
OE-2502 Metrics
OE-2605 E2E testing
P2 — Advanced Opportunity Intelligence
AI-generated investment thesis

AI strategy generation

Automatic comparable analysis

Dynamic market assumptions

Predictive IRR

Predictive exit valuation

AI scenario generation

Portfolio-aware opportunity optimization

Multi-asset optimization

Real-time market recalculation

Bayesian optimization

Genetic optimization

Autonomous investment recommendations

Natural language scenario engineering

"Generate the best 3 investment structures
for this asset targeting 18% IRR with
maximum 12% downside risk"
Important Technical Issues Found
1. Scenario assumptions are too generic

Current:

Record<string, number>

Should be replaced by structured domain models.

Priority: P0

2. Opportunity status mixes workflow activities

Current states such as:

engineered
scored
scenarioApproved

are actions/results, not a coherent lifecycle.

Priority: P0

3. Scenario approval is not enough for scenario selection

Currently:

approveScenario()

sets:

approvedScenarioId

But an approved scenario and a selected recommended scenario are different concepts.

Recommended:

Scenario
   ↓
Validated
   ↓
Reviewed
   ↓
Candidate
   ↓
Selected
4. StructureOptimized appears event-only

The aggregate raises:

StructureOptimized

but there is no complete optimization aggregate/result/history visible.

Priority: P0

5. Monte Carlo exists but needs domain integration

The existence of:

MonteCarloSimulationService

is promising, but simulation results need:

persistence
scenario association
APIs
auditability
probability outputs

Priority: P0

6. Financial calculations should not rely on raw JavaScript numbers

The domain currently uses:

number

for:

IRR
MOIC
assumptions
financial outputs

Use proper decimal/financial calculation abstractions.

Priority: P0

7. In-memory outbox must be replaced

Same issue as the other microservices.

Production architecture should be:

Database Transaction
       │
       ├── Opportunity
       └── Outbox Event
               │
               ▼
            Kafka

Priority: P0

Final Recommended Architecture

The completed Opportunity Engineering service should look like:

OPPORTUNITY ENGINEERING SERVICE
│
├── Opportunity Management
│
├── Investment Thesis Engine
│
├── Strategy Engineering
│   ├── Strategy Alternatives
│   ├── Constraints
│   └── Value Creation
│
├── Scenario Modeling
│   ├── Base
│   ├── Bull
│   ├── Bear
│   └── Stress
│
├── Financial Modeling
│   ├── Cash Flows
│   ├── Financing
│   ├── Returns
│   └── Exit
│
├── Sensitivity Analysis
│
├── Monte Carlo Simulation
│
├── Risk-Adjusted Return Engine
│
├── Opportunity Scoring
│
├── Structure Optimization
│
├── Scenario Comparison
│
├── Recommendation Engine
│
├── Approval Package
│
├── Deal Studio Handoff
│
├── Domain Events
│
├── Transactional Outbox
│
└── Audit & Explainability
Final DAOS Flow

The three microservices now form a clear chain:

┌──────────────────────┐
│ ASSET ORIGINATION    │
│                      │
│ Find & Qualify Asset │
└──────────┬───────────┘
           │
           │ AssetQualified
           ▼
┌────────────────────────────┐
│ OPPORTUNITY ENGINEERING    │
│                            │
│ Design Best Investment     │
│ Opportunity                │
│                            │
│ • Thesis                   │
│ • Strategies               │
│ • Scenarios                │
│ • Financial Models         │
│ • Simulations              │
│ • Optimization             │
└──────────────┬─────────────┘
               │
               │ OpportunityApproved
               ▼
┌────────────────────────────┐
│ DEAL STUDIO                │
│                            │
│ Formalize & Execute Deal   │
│                            │
│ • Capital Stack            │
│ • Terms                    │
│ • Waterfall                │
│ • Closing                  │
└────────────────────────────┘

The most important architectural positioning is:

Asset Origination discovers what can be invested in. Opportunity Engineering determines how it should be invested in. Deal Studio formalizes and executes the chosen structure.