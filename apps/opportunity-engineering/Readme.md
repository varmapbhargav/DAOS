# Opportunity Engineering Service

> **What is the best investment opportunity we can create around this asset?**

Opportunity Engineering (OE) is the analytical core of the DAOS pipeline. It receives qualified assets from Asset Origination, engineers investment opportunities through thesis development, strategy design, financial modeling, scenario analysis, and optimization — then hands off approved opportunities to Deal Studio for formal structuring.

---

## 1. Position in the DAOS Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DAOS PIPELINE                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ASSET ORIGINATION                                                  │
│  └── "What exists and can it be used?"                              │
│         │                                                           │
│         │ AssetQualified                                            │
│         ▼                                                           │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ OPPORTUNITY ENGINEERING                                      │    │
│  │                                                              │    │
│  │ "What is the best investment opportunity we can create?"     │    │
│  │                                                              │    │
│  │ ┌─────────────┐ ┌──────────────┐ ┌───────────────────────┐ │    │
│  │ │   THESIS    │ │  STRATEGIES  │ │  FINANCIAL MODEL      │ │    │
│  │ └──────┬──────┘ └──────┬───────┘ └───────────┬───────────┘ │    │
│  │        └───────────────┼─────────────────────┘              │    │
│  │                        ▼                                    │    │
│  │              ┌─────────────────┐                            │    │
│  │              │ SCENARIO ENGINE │                            │    │
│  │              └────────┬────────┘                            │    │
│  │                       ▼                                     │    │
│  │        ┌──────────────┼──────────────┐                      │    │
│  │        ▼              ▼              ▼                      │    │
│  │   SENSITIVITY    MONTE CARLO     RISK ENGINE                │    │
│  │        └──────────────┼──────────────┘                      │    │
│  │                       ▼                                     │    │
│  │              ┌─────────────────┐                            │    │
│  │              │   OPTIMIZATION  │                            │    │
│  │              └────────┬────────┘                            │    │
│  │                       ▼                                     │    │
│  │              ┌─────────────────┐                            │    │
│  │              │  RECOMMENDATION │                            │    │
│  │              └────────┬────────┘                            │    │
│  │                       ▼                                     │    │
│  │              ┌─────────────────┐                            │    │
│  │              │    APPROVAL     │                            │    │
│  │              └────────┬────────┘                            │    │
│  └───────────────────────┼─────────────────────────────────────┘    │
│                          │ OpportunityApproved                      │
│                          ▼                                          │
│  DEAL STUDIO                                                        │
│  └── "How do we legally and commercially formalize the deal?"       │
│         │                                                           │
│         │ StructuringReady                                          │
│         ▼                                                           │
│  ISSUANCE ──► DISTRIBUTION ──► SECONDARY                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Domain Boundary

### What OE Owns

| Capability | Description |
|---|---|
| Opportunity Creation | Identity, lifecycle, ownership |
| Investment Thesis | Rationale, value creation thesis, exit strategy |
| Strategy Engineering | Multiple strategy alternatives, constraints, comparison |
| Financial Modeling | Revenue, expenses, CapEx, debt, tax, cash flows |
| Scenario Modeling | Base/bull/bear/stress scenarios with structured assumptions |
| Valuation | DCF, multiples, NAV, cap rate |
| Return Engine | IRR, XIRR, MOIC, NPV, yield, DSCR |
| Sensitivity Analysis | One/two-variable sensitivity matrices |
| Monte Carlo Simulation | Distribution-based financial simulation |
| Risk Engine | Risk assessment, risk-adjusted returns |
| Capital Engineering | Indicative capital requirements, leverage capacity |
| Optimization | Structure optimization with constraints |
| Recommendation | Strategy/scenario recommendation with explanation |
| Approval Package | Readiness validation, approval artifacts |
| Deal Studio Handoff | Structuring-ready event with complete economics |

### What OE Does NOT Own

| Responsibility | Owner |
|---|---|
| Asset due diligence | Asset Origination |
| Asset master data | Asset Origination |
| Legal entity creation | Deal Studio |
| Final capital stack | Deal Studio |
| Term sheet | Deal Studio |
| Investment committee workflow | Deal Studio |
| Token/issuance | Issuance Service |
| Investor subscriptions | Distribution Service |
| Settlement/custody | Settlement Service |
| Secondary trading | Secondary Market |

---

## 3. Opportunity Lifecycle

### Primary States

```
DRAFT
  │
  ▼
ENGINEERING
  │
  ├──► THESIS_DEFINED
  │
  ├──► STRATEGY_DESIGN
  │
  ├──► FINANCIAL_MODELING
  │
  ├──► SCENARIO_MODELING
  │
  ├──► ANALYSIS
  │
  ├──► OPTIMIZATION
  │
  ├──► RECOMMENDED
  │
  ├──► READY_FOR_REVIEW
  │
  ├──► UNDER_REVIEW
  │
  ├──► READY_FOR_APPROVAL
  │
  ├──► APPROVED
  │
  ├──► STRUCTURING_READY
  │
  └──► HANDED_OFF

Terminal States:
  ON_HOLD
  REJECTED
  ARCHIVED
  SUPERSEDED
```

### Sub-Workflow Statuses

| Sub-Workflow | States |
|---|---|
| EngineeringStatus | DRAFT, IN_PROGRESS, COMPLETE |
| ScenarioStatus | NOT_STARTED, MODELING, CALCULATED, SIMULATED, REVIEWED, SELECTED |
| FinancialModelStatus | NOT_STARTED, BUILDING, VALIDATED, CALCULATED |
| RiskStatus | NOT_STARTED, ASSESSING, ASSESSED |
| OptimizationStatus | NOT_STARTED, RUNNING, COMPLETED |
| ReviewStatus | NOT_SUBMITTED, PENDING, APPROVED, REJECTED, CHANGES_REQUESTED |
| ApprovalStatus | NOT_SUBMITTED, PENDING, APPROVED, REJECTED |
| HandoffStatus | NOT_READY, READY, HANDED_OFF |

---

## 4. Core Domain Model

### Opportunity Aggregate (Root)

```
Opportunity
├── OpportunityIdentity
│   ├── id, tenantId, referenceNumber
│   ├── name, description
│   ├── opportunityType (ACQUIRE_HOLD, VALUE_ADD, DEVELOPMENT, etc.)
│   ├── jurisdiction, currency
│   └── owner, team
│
├── AssetReference
│   ├── assetId
│   ├── assetSnapshotVersion
│   └── qualificationStatus
│
├── SponsorReference
├── OriginatorReference
│
├── InvestmentThesis (→ separate aggregate)
├── InvestmentStrategies[] (→ separate aggregate)
│
├── FinancialModelReference
├── ScenarioReferences[]
├── RiskReferences
├── CapitalEngineeringReferences
├── OptimizationReferences
│
├── Recommendation
│   ├── recommendedStrategyId
│   ├── recommendedScenarioId
│   ├── reasoning
│   └── confidenceScore
│
├── EngineeringReadiness
│   ├── assetReady, thesisReady, strategyReady
│   ├── financialModelReady, valuationReady
│   ├── scenariosReady, sensitivityReady
│   ├── riskReady, capitalReady
│   ├── optimizationReady, recommendationReady
│   └── overallStatus (READY, NOT_READY, WARNING)
│
├── ApprovalState
├── HandoffState
│
├── Status (OpportunityStatus enum)
├── Sub-statuses (EngineeringStatus, ScenarioStatus, etc.)
│
├── Version, CreatedBy, UpdatedBy
└── CreatedAt, UpdatedAt
```

### InvestmentThesis Aggregate

```
InvestmentThesis
├── id, opportunityId
├── thesisStatement, executiveSummary
├── investmentRationale, marketOpportunity
├── assetRationale
├── problem, solution
├── competitiveAdvantage
├── valueCreationThesis
├── keyCatalysts
├── keyRisks, riskMitigation
├── investmentHorizon, entryThesis, exitThesis
├── expectedReturn, targetYield
├── confidenceScore
├── status (DRAFT, FINAL, APPROVED)
├── version
└── createdBy, approvedBy
```

### InvestmentStrategy Aggregate

```
InvestmentStrategy
├── strategyId, opportunityId
├── name, strategyType
├── description
├── entryStrategy
├── operatingStrategy
├── financingStrategy
├── valueCreationStrategy
├── exitStrategy
├── investmentHorizon
├── constraints[]
│   ├── maxLeverage, minIRR, minMOIC
│   ├── maxHoldPeriod, maxDownside
│   └── jurisdictionRestrictions, riskTolerance
├── targetReturns
├── status, version
└── isSelected (boolean)
```

### Scenario Model

```
ScenarioModel
├── Identity (id, opportunityId, strategyId, name)
├── AssumptionSet
│   ├── AcquisitionAssumptions (price, costs, closing)
│   ├── FinancingAssumptions (loan, rate, term, LTV)
│   ├── OperatingAssumptions (growth, occupancy, OpEx)
│   ├── RevenueAssumptions (streams, growth, escalation)
│   ├── ExpenseAssumptions (fixed, variable, inflation)
│   ├── ExitAssumptions (date, value, multiple, costs)
│   └── RiskAssumptions (volatility, correlations)
│
├── FinancialModel (→ separate aggregate)
├── ReturnProfile (IRR, MOIC, NPV, yield)
├── RiskProfile
├── SensitivityResults
├── SimulationResults
│
├── Status (DRAFT, MODELING, CALCULATED, SIMULATED, REVIEWED, SELECTED)
├── Version
└── IsSelected (boolean)
```

### Financial Model

```
FinancialModel
├── Periods[]
│   ├── Revenue
│   ├── COGS
│   ├── GrossProfit
│   ├── OperatingExpenses
│   ├── EBITDA
│   ├── Depreciation
│   ├── EBIT
│   ├── Interest
│   ├── EBT
│   ├── Taxes
│   └── NetIncome
│
├── CashFlows[]
│   ├── OperatingCashFlow
│   ├── CapEx
│   ├── FreeCashFlow
│   ├── DebtDrawdown
│   ├── PrincipalRepayment
│   ├── LeveredCashFlow
│   └── UnleveredCashFlow
│
├── ExitModel
│   ├── exitValue
│   ├── netExitProceeds
│   └── exitTiming
│
├── ReturnMetrics
│   ├── IRR, XIRR
│   ├── ProjectIRR, EquityIRR
│   ├── LeveredIRR, UnleveredIRR
│   ├── MOIC, GrossMOIC, NetMOIC
│   ├── NPV
│   ├── CashYield, CashOnCash
│   ├── PaybackPeriod
│   ├── DSCR, DebtYield, LTV
│   └── EquityMultiple
│
├── ModelVersion
├── CalculationTimestamp
└── AssumptionsSnapshot
```

### Risk Assessment

```
RiskAssessment
├── id, opportunityId
├── RiskItems[]
│   ├── riskType (MARKET, ASSET, FINANCIAL, LIQUIDITY, etc.)
│   ├── description
│   ├── probability (0-1)
│   ├── impact (0-1)
│   ├── inherentRisk
│   ├── mitigation
│   ├── residualRisk
│   ├── owner
│   ├── status
│   └── evidence
│
├── AggregateRiskScore
├── RiskAdjustedReturn
│   ├── expectedIRR
│   ├── downsideIRR
│   ├── probabilityOfLoss
│   ├── riskAdjustedNPV
│   └── capitalAtRisk
│
└── CompletedAt
```

### Optimization

```
OptimizationRun
├── id, opportunityId
├── Objective (MAXIMIZE_IRR, MAXIMIZE_MOIC, MINIMIZE_RISK, etc.)
├── Constraints[]
│   ├── variable, operator, value
│   └── description
├── Variables[]
│   ├── name, min, max, step
│   └── type
├── Candidates[]
│   ├── scenarioId, strategyId
│   └── objectiveValue
├── SelectedCandidate
├── Results
│   ├── iterations
│   ├── bestValue
│   └── convergenceInfo
├── Algorithm (RULE_BASED, GRID_SEARCH, etc.)
├── Status (RUNNING, COMPLETED, FAILED)
└── CompletedAt
```

---

## 5. Engine Architecture

```
                     OPPORTUNITY
                          │
           ┌──────────────┼──────────────┐
           ▼              ▼              ▼
        THESIS         STRATEGIES      MARKET
           │              │              │
           └──────────────┼──────────────┘
                          ▼
                   ASSUMPTION ENGINE
                          │
                          ▼
                 FINANCIAL MODEL ENGINE
                          │
         ┌────────────────┼────────────────┐
         ▼                ▼                ▼
     CASH FLOW         VALUATION          DEBT
         │                │                │
         └────────────────┼────────────────┘
                          ▼
                    RETURN ENGINE
                          │
               ┌──────────┴──────────┐
               ▼                     ▼
         SENSITIVITY             MONTE CARLO
               │                     │
               └──────────┬──────────┘
                          ▼
                      RISK ENGINE
                          │
                          ▼
                  CAPITAL ENGINEERING
                          │
                          ▼
                   OPTIMIZATION ENGINE
                          │
                          ▼
                  RECOMMENDATION ENGINE
                          │
                          ▼
                    REVIEW / APPROVAL
                          │
                          ▼
                  STRUCTURING READY
                          │
                          ▼
                     DEAL STUDIO
```

---

## 6. Required APIs

### Opportunity APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | /opportunities | Create opportunity |
| GET | /opportunities | List opportunities |
| GET | /opportunities/:id | Get opportunity |
| PATCH | /opportunities/:id | Update opportunity |
| POST | /opportunities/:id/engineering/start | Start engineering |
| POST | /opportunities/:id/thesis | Create thesis |
| PUT | /opportunities/:id/thesis | Update thesis |
| POST | /opportunities/:id/thesis/finalize | Finalize thesis |
| POST | /opportunities/:id/strategies | Create strategy |
| GET | /opportunities/:id/strategies | List strategies |
| POST | /opportunities/:id/strategies/:sid/select | Select strategy |
| POST | /opportunities/:id/scenarios | Create scenario |
| GET | /opportunities/:id/scenarios | List scenarios |
| POST | /opportunities/:id/score | Score opportunity |
| POST | /opportunities/:id/analysis/sensitivity | Run sensitivity |
| POST | /opportunities/:id/analysis/simulation | Run Monte Carlo |
| POST | /opportunities/:id/optimize | Run optimization |
| POST | /opportunities/:id/recommend | Generate recommendation |
| POST | /opportunities/:id/approval/submit | Submit for approval |
| POST | /opportunities/:id/approve | Approve opportunity |
| POST | /opportunities/:id/reject | Reject opportunity |
| POST | /opportunities/:id/handoff-to-deal | Handoff to Deal Studio |
| GET | /opportunities/:id/readiness | Check readiness |
| GET | /opportunities/pipeline | View pipeline |

### Scenario APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | /scenarios/:id | Get scenario |
| PUT | /scenarios/:id | Update scenario |
| POST | /scenarios/:id/calculate | Calculate scenario |
| POST | /scenarios/:id/simulate | Run simulation |
| POST | /scenarios/:id/validate | Validate scenario |
| POST | /scenarios/:id/select | Select scenario |
| POST | /scenarios/:id/clone | Clone scenario |
| GET | /scenarios/:id/results | Get results |
| GET | /scenarios/:id/sensitivity | Get sensitivity |
| GET | /scenarios/:id/versions | Get versions |

### Analytics APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | /scenarios/:id/sensitivity | Calculate sensitivity |
| POST | /scenarios/:id/monte-carlo | Run Monte Carlo |
| GET | /scenarios/:id/simulation | Get simulation results |
| GET | /opportunities/:id/comparison | Compare scenarios |
| GET | /opportunities/:id/recommendation | Get recommendation |
| POST | /opportunities/:id/risk-assessment | Run risk assessment |
| GET | /opportunities/:id/risk-assessment | Get risk assessment |

---

## 7. Critical Technical Issues (P0)

| # | Issue | Fix |
|---|---|---|
| 1 | Cross-opportunity scenario approval bug | Validate `model.opportunityId === opportunity.id` |
| 2 | In-memory outbox | Replace with PostgreSQL transactional outbox |
| 3 | JavaScript `number` for financials | Use decimal/`DECIMAL` type throughout |
| 4 | Optimistic locking not enforced | `UPDATE WHERE id=? AND version=?` |
| 5 | Scenario not actually calculated | `applyProjection()` accepts result, not derives it |
| 6 | Monte Carlo is deterministic noise | Distribution → model → cash flow → return iteration |
| 7 | Lifecycle states mix actions/states | Replace with proper state machine |
| 8 | Approval gate too weak | Readiness engine with full validation |
| 9 | No model versioning | Immutable version snapshots |
| 10 | No calculation provenance | Assumption/model/formula snapshots per result |

---

## 8. Database Schema

```
opportunities                    investment_theses
opportunity_versions              thesis_versions
opportunity_assets                value_creation_drivers

investment_strategies             strategy_constraints
strategy_versions

assumption_sets                   assumptions
assumption_sources

financial_models                  financial_model_versions
financial_periods

revenue_streams                   expense_lines
capex_lines                       working_capital_models
tax_models

debt_facilities                   debt_schedules

cash_flow_models                  cash_flow_periods

valuations                        valuation_methods
comparables

return_analyses                   return_metrics

scenarios                         scenario_versions
scenario_assumptions

sensitivity_runs                  sensitivity_results

simulation_runs                   simulation_results

risk_assessments                  risk_items
risk_mitigations

capital_requirements              indicative_capital_structures

optimization_runs                 optimization_constraints
optimization_results

recommendations

engineering_reviews               approval_packages

lifecycle_history                 audit_events

outbox_events
```

---

## 9. Domain Events

### Core Events

| Event | Trigger |
|---|---|
| OpportunityCreated | New opportunity created |
| OpportunityUpdated | Opportunity modified |
| OpportunityEngineeringStarted | Engineering process begins |
| InvestmentThesisCreated | Thesis drafted |
| InvestmentThesisFinalized | Thesis finalized |
| StrategyCreated | New strategy added |
| StrategySelected | Strategy chosen |
| AssumptionSetCreated | Assumptions defined |
| AssumptionSetChanged | Assumptions modified |
| FinancialModelCreated | Financial model built |
| FinancialModelCalculated | Model calculated |
| ScenarioCreated | New scenario |
| ScenarioCalculated | Scenario calculated |
| ScenarioSimulated | Monte Carlo completed |
| ScenarioReviewed | Scenario reviewed |
| ScenarioSelected | Scenario chosen as recommended |
| SensitivityCalculated | Sensitivity analysis completed |
| MonteCarloCompleted | Simulation completed |
| RiskAssessmentCompleted | Risk assessment done |
| CapitalRequirementCalculated | Capital requirements determined |
| OptimizationCompleted | Optimization finished |
| RecommendationGenerated | Recommendation produced |
| OpportunityScored | Opportunity scored |
| OpportunitySubmittedForApproval | Submitted for IC |
| OpportunityApproved | Approved by authority |
| OpportunityRejected | Rejected |
| OpportunityStructuringReady | Ready for Deal Studio |
| OpportunityHandedOff | Handed to Deal Studio |

### Event Envelope

```typescript
{
  eventId: string;
  eventType: string;
  eventVersion: number;
  aggregateId: string;
  aggregateType: string;
  tenantId: string;
  occurredAt: Date;
  correlationId: string;
  causationId: string;
  actorId: string;
  payload: Record<string, unknown>;
}
```

---

## 10. Implementation Phases

See [todolist.md](./todolist.md) for the complete prioritized task list.

### Quick Reference

| Phase | Focus | Tasks |
|---|---|---|
| 0 | Domain Boundary | OE-001, OE-002 |
| 1 | Lifecycle Redesign | OE-101 to OE-103 |
| 2 | Opportunity Expansion | OE-201 to OE-203 |
| 3 | Investment Thesis | OE-301 to OE-303 |
| 4 | Strategy Engineering | OE-401 to OE-403 |
| 5 | Scenario Modeling | OE-501 to OE-504 |
| 6 | Financial Modeling | OE-601 to OE-604 |
| 7 | Projection Engine | OE-701, OE-702 |
| 8 | Sensitivity Analysis | OE-801, OE-802 |
| 9 | Monte Carlo | OE-901 to OE-904 |
| 10 | Scoring Engine | OE-1001 to OE-1003 |
| 11 | Risk-Adjusted Returns | OE-1101, OE-1102 |
| 12 | Optimization | OE-1201 to OE-1203 |
| 13 | Scenario Comparison | OE-1301, OE-1302 |
| 14 | Approval | OE-1401 to OE-1403 |
| 15 | Deal Handoff | OE-1501 to OE-1503 |
| 16 | External Data | OE-1601, OE-1602 |
| 17 | Domain Events | OE-1701, OE-1702 |
| 18 | Transactional Outbox | OE-1801 |
| 19 | Persistence | OE-1901, OE-1902 |
| 20 | Concurrency | OE-2001 |
| 21 | APIs | OE-2101, OE-2102 |
| 22 | Search & Pipeline | OE-2201, OE-2202 |
| 23 | Audit & Explainability | OE-2301, OE-2302 |
| 24 | Security | OE-2401 |
| 25 | Observability | OE-2501, OE-2502 |
| 26 | Testing | OE-2601 to OE-2605 |

---

## 11. Architecture Principles

1. **Opportunity as Orchestrator** — Opportunity is the root context; other modules are separate aggregates with explicit references
2. **Decimal Precision** — All financial values use `DECIMAL`/`NUMERIC`, never floating point
3. **Institutional Auditability** — Every calculation carries assumption snapshots, model versions, and formula versions
4. **Optimistic Concurrency** — All updates enforced via version-checked WHERE clauses
5. **Transactional Outbox** — Events persisted in same transaction as state, relayed to Kafka asynchronously
6. **Tenant Isolation** — Defense in depth: application context → repository filter → PostgreSQL RLS → scoped indexes
7. **Separation of Concerns** — OE engineers the economics; Deal Studio formalizes the legal structure
