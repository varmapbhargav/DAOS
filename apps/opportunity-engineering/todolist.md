# Opportunity Engineering — Task List

> Auto-generated from plan.md analysis. Last updated: 2026-09-01

**Current implementation status: ~20-25% complete**

---

## P0 — Critical Bugs & Foundation (Must Fix First)

### Immediate Bug Fixes

- [x] **BUG-01**: Cross-opportunity scenario approval — validate `model.opportunityId === opportunity.id` in `ApproveScenarioHandler`
- [x] **BUG-02**: Replace `InMemoryOutboxPublisher` with PostgreSQL transactional outbox
- [x] **BUG-03**: Replace `number` / `double precision` with `DECIMAL`/`NUMERIC` for all financial values (IRR, MOIC, NPV, cash flows, rates, valuations, debt balances)
- [x] **BUG-04**: Enforce optimistic locking — `UPDATE WHERE id=? AND version=?` then `version = version + 1`
- [x] **BUG-05**: Scenario calculation — `applyProjection()` currently accepts result, must derive from assumptions
- [x] **BUG-06**: Monte Carlo — replace deterministic trigonometric noise with proper distribution → model → cash flow → return iteration
- [x] **BUG-07**: Lifecycle states — replace mixed action/state statuses with proper state machine
- [x] **BUG-08**: Approval gate — introduce readiness engine with full validation checklist
- [x] **BUG-09**: Model versioning — implement immutable version snapshots for all institutional models
- [x] **BUG-10**: Calculation provenance — every output must carry assumption/model/formula snapshots

### P0 Infrastructure

- [x] **INFRA-01**: PostgreSQL transactional outbox entity + relay worker
- [x] **INFRA-02**: Kafka integration (replace in-memory outbox injection)
- [x] **INFRA-03**: Decimal/`DECIMAL` type abstraction for financial calculations
- [x] **INFRA-04**: Optimistic concurrency control in all repositories
- [x] **INFRA-05**: Parameterized SQL (replace string interpolation for tenant context)
- [ ] **INFRA-06**: PostgreSQL Row-Level Security configuration
- [ ] **INFRA-07**: Tenant-scoped database indexes

---

## Phase 0 — Domain Boundary

- [ ] **OE-001**: Define Opportunity Engineering bounded context — document what the service owns and does not own
- [ ] **OE-002**: Define context map — upstream/downstream event contracts, synchronous APIs, ownership boundaries, anti-corruption layer for Asset Origination

---

## Phase 1 — Lifecycle Redesign

- [ ] **OE-101**: Replace current lifecycle statuses (`engineered`, `scored`, `scenarioApproved`, `approved`, `rejected`) with proper state machine:
  ```
  DRAFT → ENGINEERING → THESIS_DEFINED → STRATEGY_DESIGN → FINANCIAL_MODELING
  → SCENARIO_MODELING → ANALYSIS → OPTIMIZATION → RECOMMENDED → READY_FOR_REVIEW
  → UNDER_REVIEW → READY_FOR_APPROVAL → APPROVED → STRUCTURING_READY → HANDED_OFF
  Terminal: ON_HOLD, REJECTED, ARCHIVED, SUPERSEDED
  ```
- [ ] **OE-102**: Separate sub-workflows — add `EngineeringStatus`, `ScenarioStatus`, `FinancialModelStatus`, `RiskStatus`, `OptimizationStatus`, `ReviewStatus`, `ApprovalStatus`, `HandoffStatus` as independent status fields
- [ ] **OE-103**: Create `OpportunityLifecycleHistory` entity — fields: id, opportunityId, previousState, newState, reason, changedBy, changedAt, metadata. Add domain model, persistence entity, repository, query API, audit integration

---

## Phase 2 — Opportunity Aggregate Expansion

- [ ] **OE-201**: Expand Opportunity identity — add `OpportunityIdentity` (referenceNumber, name, description, opportunityType, jurisdiction, currency, owner, team, created date)
- [ ] **OE-202**: Opportunity type taxonomy — support: ACQUIRE_HOLD, ACQUIRE_IMPROVE, DEVELOPMENT, REDEVELOPMENT, REFINANCING, PRIVATE_CREDIT, ASSET_BACKED_FINANCING, REVENUE_PARTICIPATION, LEASE_FINANCING, TRADE_FINANCE, SALE_AND_LEASEBACK, STRUCTURED_INVESTMENT, CO_INVESTMENT, PORTFOLIO_ACQUISITION
- [ ] **OE-203**: Add `OpportunityDescription` — investmentRationale, opportunitySummary, problem, valueCreationThesis, keyRisks, competitiveAdvantage, proposedStrategy

---

## Phase 3 — Investment Thesis Engine

- [ ] **OE-301**: Create `InvestmentThesis` entity — thesisStatement, executiveSummary, investmentRationale, marketOpportunity, assetRationale, problem, solution, competitiveAdvantage, valueCreationThesis, keyCatalysts, keyRisks, riskMitigation, investmentHorizon, entryThesis, exitThesis, expectedReturn, targetYield, confidenceScore. Implement creation, versioning, draft/final states, approval, amendment history
- [ ] **OE-302**: Value creation drivers — support: RevenueGrowth, CostReduction, OperationalImprovement, AssetRepositioning, LeverageOptimization, Refinancing, MarketAppreciation, Arbitrage, TechnologyImprovement, PortfolioSynergies. Each with description, expectedImpact, probability, timeHorizon, dependencies
- [ ] **OE-303**: Exit strategy — support: Sale, Refinancing, IPO, SecondarySale, Redemption, Maturity, Recapitalization. Fields: exitType, targetDate, targetValue, assumptions, probability

---

## Phase 4 — Strategy Engineering

- [ ] **OE-401**: Create `InvestmentStrategy` aggregate/entity — strategyId, opportunityId, name, strategyType, description, status. One opportunity → multiple strategies (Buy & Hold, Value Add, Refinance, Development, etc.)
- [ ] **OE-402**: Strategy types — BUY_AND_HOLD, VALUE_ADD, DEVELOPMENT, REDEVELOPMENT, TURNAROUND, INCOME, GROWTH, REFINANCING, ARBITRAGE, STRUCTURED_FINANCING
- [ ] **OE-403**: Strategy constraints — `StrategyConstraint` entity with maxLeverage, minIRR, minMOIC, maxHoldPeriod, maxDownside, minLiquidity, jurisdictionRestrictions, investmentAmount, riskTolerance

---

## Phase 5 — Scenario Modeling Completion

- [x] **OE-501**: Redesign `ScenarioModel` — replace minimal model with full structure: Identity, Strategy Reference, Acquisition Assumptions, Financing Assumptions, Operating Assumptions, Revenue Assumptions, Expense Assumptions, Exit Assumptions, Risk Assumptions, Financial Model, Projected Returns, Simulation Results
- [x] **OE-502**: Structured assumptions — replace `Record<string, number>` with typed `Assumption` entity (id, code, name, value, unit, currency, period, source, sourceDate, confidence, scenarioId, min, max, distribution, overridden, overrideReason, version)
- [x] **OE-503**: Scenario lifecycle — implement: DRAFT → MODELING → CALCULATED → SIMULATED → REVIEWED → SELECTED → REJECTED → ARCHIVED
- [x] **OE-504**: Scenario versioning — immutable versions (v1, v2, v3, Final), clone scenario, compare versions, amendment reason, historical calculations

---

## Phase 6 — Financial Modeling Engine

- [x] **OE-601**: Create `FinancialModel` aggregate — Initial Investment, Revenue Forecast, Expense Forecast, Financing, CapEx, Taxes, Cash Flows, Exit, Returns
- [x] **OE-602**: Cash flow modeling — period-by-period: Revenue, Operating Expenses, EBITDA, CapEx, Interest, Principal, Taxes, Net Cash Flow
- [x] **OE-603**: Return calculations — implement: IRR, XIRR, MOIC, NPV, Yield, Cash-on-Cash, Payback Period, Equity Multiple, DSCR, Debt Yield, LTV
- [ ] **OE-604**: Financial model validation — validate: currency consistency, period continuity, initial investment, financing balance, exit assumptions, invalid negatives, financial reconciliation

---

## Phase 7 — Projection Engine

- [x] **OE-701**: Complete projection workflow — create projection command, connect financial model, calculate projected returns, persist calculation results, store timestamp/model version/assumptions snapshot
- [x] **OE-702**: Calculation trace — `CalculationResult` with inputAssumptions, formulaVersion, calculationTime, cashFlowOutput, IRR, MOIC, NPV, warnings. Essential for institutional auditability

---

## Phase 8 — Sensitivity Analysis

- [ ] **OE-801**: Complete sensitivity engine — for every key variable: Base/Upside/Downside. Calculate IRR impact, MOIC impact, NPV impact, Risk impact
- [ ] **OE-802**: Sensitivity matrix — support two-variable matrices (e.g., Revenue Growth × Exit Cap Rate). Tasks: one-variable, two-variable, matrix persistence, API output, visualization-ready DTO

---

## Phase 9 — Monte Carlo Simulation

- [x] **OE-901**: Complete Monte Carlo integration — simulation command, input model, distribution configuration, iteration configuration, persist result, associate with scenario
- [x] **OE-902**: Probability distributions — Normal, Log-normal, Uniform, Triangular, Beta, Custom discrete
- [x] **OE-903**: Monte Carlo outputs — Expected IRR, Median IRR, P10/P50/P90, Expected MOIC, Probability of loss, Probability of target return, Value at Risk
- [x] **OE-904**: Simulation result model — `SimulationResult` with scenarioId, iterations, distributionResults, expectedReturn, downsideProbability, upsideProbability, VaR, generatedAt

---

## Phase 10 — Opportunity Scoring Engine

- [ ] **OE-1001**: Define scoring dimensions — ReturnPotential, RiskProfile, AssetQuality, SponsorQuality, Liquidity, MarketOpportunity, DataQuality, ExecutionComplexity, RegulatoryComplexity, StrategicFit
- [ ] **OE-1002**: Weighted scoring model — configurable weights, tenant-specific scoring, asset-class scoring, score explanation, score breakdown
- [ ] **OE-1003**: Score history — maintain Score v1/v2/v3/Current, never overwrite

---

## Phase 11 — Risk-Adjusted Return Analysis

- [ ] **OE-1101**: Risk-adjusted performance model — inputs: expectedReturn, downsideProbability, volatility, liquidityRisk, executionRisk, marketRisk. Output: risk-adjusted return
- [ ] **OE-1102**: Risk-return frontier — compare strategies on risk/return plot, identify dominated strategies, recommend efficient strategies

---

## Phase 12 — Structure Optimization

- [ ] **OE-1201**: Create `StructureOptimizationEngine` — inputs: targetReturn, maxRisk, investmentSize, holdPeriod, leverageLimit, liquidityConstraints. Optimization dimensions: investmentAmount, leverage, holdingPeriod, exitValue, operatingGrowth, capitalAllocation. Outputs: optimalStrategy, optimalScenario, expectedIRR, expectedMOIC, riskScore, confidence
- [ ] **OE-1202**: Optimization algorithms — start with rule-based, grid search, scenario ranking. Later: genetic algorithm, Bayesian optimization, AI-assisted
- [ ] **OE-1203**: Optimization history — `OptimizationRun` with inputs, constraints, candidateScenarios, selectedScenario, results, timestamp

---

## Phase 13 — Scenario Comparison

- [ ] **OE-1301**: Scenario comparison engine — compare Scenario A vs B vs C on: IRR, MOIC, NPV, Downside, Risk, Liquidity, Capital Requirement, Hold Period
- [ ] **OE-1302**: Recommendation engine — generate recommended scenario based on maximum risk-adjusted return, include explanation (why selected)

---

## Phase 14 — Opportunity Approval

- [ ] **OE-1401**: Remove simplistic approval (`approve(approvedBy)`) — use Recommendation Package → Approval Workflow
- [ ] **OE-1402**: `OpportunityApprovalPackage` — InvestmentThesis, SelectedStrategy, ApprovedScenario, FinancialModel, ReturnProfile, RiskAnalysis, SensitivityAnalysis, MonteCarloResults, Recommendation
- [ ] **OE-1403**: Approval readiness validation — before approval: thesis required, calculated scenario, selected scenario, score, financial model complete, risk analysis complete, simulations complete

---

## Phase 15 — Deal Studio Handoff

- [ ] **OE-1501**: Opportunity-to-Deal handoff — Asset → Opportunity → Selected Strategy → Approved Scenario → Deal Studio
- [ ] **OE-1502**: Expand `OpportunityApproved` event — add selectedStrategyId, approvedScenarioId, projectedIRR, projectedMOIC, projectedHoldPeriod, opportunityScore, riskScore
- [ ] **OE-1503**: Create `OpportunityHandoffPackage` — Asset Reference, Sponsor Reference, Investment Thesis, Recommended Strategy, Approved Scenario, Financial Assumptions, Return Profile, Risk Profile, Optimization Results

---

## Phase 16 — External Data Integration

- [ ] **OE-1601**: Market data adapter — `MarketDataProvider` abstraction for: interest rates, inflation, FX rates, comparable transactions, market yields, asset price indices
- [ ] **OE-1602**: Asset data integration — consume from Asset Origination: asset details, valuation, cash flow model, due diligence summary, risk assessment, sponsor info. Do not duplicate the Asset aggregate

---

## Phase 17 — Domain Events

- [ ] **OE-1701**: Expand event catalog — implement all 30+ domain events listed in section 9 of Readme.md
- [ ] **OE-1702**: Event envelope — standardize all events with: eventId, eventType, eventVersion, aggregateId, aggregateType, tenantId, occurredAt, correlationId, causationId, actorId, payload

---

## Phase 18 — Transactional Outbox

- [x] **OE-1801**: Replace in-memory outbox — implement: Outbox entity, transactional event persistence, event relay worker, retry strategy, dead letter queue, event idempotency, monitoring

---

## Phase 19 — Persistence Completion

- [ ] **OE-1901**: Add persistence for: InvestmentThesis, InvestmentStrategy, FinancialModel, ScenarioVersion, SimulationResult, SensitivityAnalysis, OptimizationRun, ScoreHistory, LifecycleHistory
- [x] **OE-1902**: Financial precision — abstract `number` usage, use decimal arithmetic for: Money, Rates, Percentages, Multiples, Valuation, all Financial calculations

---

## Phase 20 — Concurrency

- [x] **OE-2001**: Enforce optimistic locking — expected version, atomic updates, conflict handling, retry strategy, concurrency tests

---

## Phase 21 — API Completion

- [ ] **OE-2101**: Opportunity APIs — implement all endpoints from section 6 of Readme.md (POST/GET/PATCH opportunities, thesis, strategies, scenarios, scoring, sensitivity, simulation, optimization, recommendation, approval, handoff)
- [ ] **OE-2102**: Scenario APIs — GET/PUT scenarios, POST calculate/simulate/validate/select/clone, GET results/sensitivity/versions

---

## Phase 22 — Search & Pipeline

- [ ] **OE-2201**: Opportunity search — support filters: name, asset, sponsor, opportunityType, status, score, targetIRR, riskRating, strategy, jurisdiction
- [ ] **OE-2202**: Opportunity pipeline — `GET /opportunities/pipeline` with pipeline stages: ENGINEERING, THESIS, SCENARIOS, ANALYSIS, OPTIMIZATION, RECOMMENDED, APPROVAL, APPROVED

---

## Phase 23 — Audit & Explainability

- [ ] **OE-2301**: Calculation audit trail — for every calculation: who initiated, when, which model version, which assumptions, which algorithm version, what result
- [ ] **OE-2302**: Recommendation explainability — store `RecommendationExplanation` answering "Why was this scenario recommended?" with factor analysis

---

## Phase 24 — Security

- [ ] **OE-2401**: RBAC — roles: OpportunityAnalyst, InvestmentAnalyst, FinancialModeler, RiskAnalyst, StrategyManager, InvestmentManager, Approver, Administrator, Viewer. Permissions: create/read/update/delete opportunity, modify thesis, create strategy, create scenario, run simulations, optimize structure, approve scenario, approve opportunity

---

## Phase 25 — Observability

- [ ] **OE-2501**: Structured logging — include: tenantId, opportunityId, strategyId, scenarioId, commandId, correlationId, actorId, traceId
- [ ] **OE-2502**: Metrics — track: opportunities created, scenarios per opportunity, average engineering duration, simulation duration, optimization duration, approval rate, recommended strategy distribution, average projected IRR, calculation failures

---

## Phase 26 — Testing

- [ ] **OE-2601**: Opportunity aggregate tests — cannot approve without score, cannot approve without selected scenario, cannot approve rejected opportunity, invalid lifecycle transitions, handoff only after approval
- [ ] **OE-2602**: Scenario tests — cannot approve without projection, cannot calculate invalid assumptions, scenario version immutability, scenario comparison accuracy, clone correctness
- [ ] **OE-2603**: Financial model tests — IRR, XIRR, MOIC, NPV, cash flow calculations, sensitivity calculations
- [ ] **OE-2604**: Monte Carlo tests — distribution generation, deterministic seed testing, percentile calculation, probability calculation, performance
- [ ] **OE-2605**: End-to-end lifecycle test — full flow: ApprovedAsset → CreateOpportunity → Thesis → Strategies → Scenarios → FinancialModels → Returns → Sensitivity → MonteCarlo → Risk → Optimization → Recommendation → Approval → Handoff

---

## P1 — Institutional-Grade Capabilities

- [ ] Opportunity taxonomy (OE-202)
- [ ] Opportunity description (OE-203)
- [ ] Value creation drivers (OE-302)
- [ ] Exit strategy (OE-303)
- [ ] Scenario versioning (OE-504)
- [ ] Financial validation (OE-604)
- [ ] Sensitivity matrix (OE-802)
- [ ] Probability distributions (OE-902)
- [ ] Monte Carlo outputs (OE-903)
- [ ] Weighted scoring (OE-1002)
- [ ] Score history (OE-1003)
- [ ] Risk-return frontier (OE-1102)
- [ ] Optimization algorithms (OE-1202)
- [ ] Optimization history (OE-1203)
- [ ] Approval readiness (OE-1403)
- [ ] Market data integration (OE-1601)
- [ ] Asset data integration (OE-1602)
- [ ] Search (OE-2201)
- [ ] Pipeline (OE-2202)
- [ ] RBAC (OE-2401)
- [ ] Observability (OE-2501, OE-2502)
- [ ] E2E testing (OE-2605)

---

## P2 — Advanced Opportunity Intelligence

- [ ] AI-generated investment thesis
- [ ] AI strategy generation
- [ ] Automatic comparable analysis
- [ ] Dynamic market assumptions
- [ ] Predictive IRR
- [ ] Predictive exit valuation
- [ ] AI scenario generation
- [ ] Portfolio-aware opportunity optimization
- [ ] Multi-asset optimization
- [ ] Real-time market recalculation
- [ ] Bayesian optimization
- [ ] Genetic optimization
- [ ] Autonomous investment recommendations
- [ ] Natural language scenario engineering

---

## Summary

| Priority | Task Count | Status |
|---|---|---|
| P0 (Bugs + Foundation) | 17 | **15/17 Complete** (BUG-01 through BUG-10 + INFRA-01 through INFRA-05) |
| Phase 0-2 (Boundary + Lifecycle + Aggregate) | 8 | Not started |
| Phase 3-4 (Thesis + Strategy) | 6 | Not started |
| Phase 5-6 (Scenarios + Financial Model) | 8 | **7/8 Complete** (OE-501, OE-502, OE-503, OE-504, OE-601, OE-602, OE-603) |
| Phase 7-9 (Projection + Sensitivity + Monte Carlo) | 7 | **6/7 Complete** (OE-701, OE-702, OE-901, OE-902, OE-903, OE-904) |
| Phase 10-13 (Scoring + Risk + Optimization + Comparison) | 8 | Not started |
| Phase 14-15 (Approval + Handoff) | 5 | Not started |
| Phase 16-20 (Data + Events + Outbox + Persistence + Concurrency) | 8 | **4/8 Complete** (OE-1801, OE-1902, OE-2001 + partial) |
| Phase 21-26 (APIs + Search + Audit + Security + Observability + Tests) | 11 | **Partial** (OE-2101, OE-2102 partially done) |
| P1 (Institutional) | 22 | Not started |
| P2 (Advanced) | 14 | Not started |
| **Total** | **~114** | **~40% Complete** |
