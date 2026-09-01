# DAOS - Digital Assets Operating System

## Sub-project 1: Asset Origination

**Asset Origination** is the institutional onboarding, verification, qualification, due-diligence and engineering-readiness layer of the Digital Assets Operating System. It determines whether an asset can be truthfully identified, evidenced, verified, legally handled, assessed and approved for Opportunity Engineering.

> Investment thesis, IRR/NPV/XIRR, scenario return engineering, capital-stack engineering and investor-product economics belong primarily to **Opportunity Engineering**.

---

## 12 Core Modules

1. **Origination Dashboard** - Pipeline and operational control
2. **Source Management** - Manage where assets/deals originate
3. **Asset Intake** - Capture initial asset
4. **Asset Discovery** - Identify potential assets
5. **Issuer / Owner Onboarding** - Establish legal counterparty
6. **Asset & Ownership Verification** - Verify existence and control
7. **Due Diligence** - Collect and evaluate evidence
8. **Data Room** - Central evidence repository
9. **Asset Qualification** - Decide whether asset is eligible
10. **Asset Pooling** - Combine assets into pools
11. **Origination Workflow** - Manage internal approvals
12. **Origination Analytics** - Pipeline, conversion and quality metrics

---

## 47 Phases Overview

The system is organized into 47 phases across 17 phases, covering:

- **Phase 1-5**: Domain Architecture & Lifecycle Redesign
- **Phase 6-10**: Asset Identity & Registration
- **Phase 11-15**: Sponsor & Counterparty Management
- **Phase 16-20**: Asset Screening Engine
- **Phase 21-25**: Asset Qualification
- **Phase 26-30**: Due Diligence Engine
- **Phase 31-35**: Valuation Engine
- **Phase 36-40**: Cash Flow Modeling & Risk Assessment
- **Phase 41-45**: Domain Events & Transactional Outbox
- **Phase 46-47**: Concurrency & API Completion

---

## Key Principles

- **Tenant isolation** at repository level with validation at command level
- **Optimistic locking** enforced on all ORM entities
- **Structured audit trail** for every operation (who, what, when, before/after, why)
- **Document Service integration** - no file storage inside Asset Origination
- **Transactional outbox** for reliable event publishing
- **Clear ownership boundaries** between Origination and Opportunity Engineering
- **Effective-dated data** with versioning for all material facts

---

## Recommended Architecture

```
ASSET → ASSET ORIGINATION → QUALIFIED ASSET → OPPORTUNITY ENGINEERING → DEAL STRUCTURING → ISSUANCE → DISTRIBUTION → SECONDARY MARKET → ASSET LIFECYCLE
```

---

## Ownership Boundaries

- **Asset Registry** owns canonical asset identity
- **Asset Origination** owns the origination case and onboarding workflow
- **Entity Studio** owns legal entities/persons and corporate relationships
- **Compliance OS** owns KYC/KYB/AML/sanctions/PEP and compliance assessments
- **Document Service** owns document binaries, versions, OCR, hashes and retention
- **Opportunity Engineering** owns investment thesis, financial engineering, return engineering and scenarios
- **Deal Studio** owns legal/economic structuring
- **Issuance** owns instrument/token creation
- **Distribution** owns investor subscription/allocation workflows
- **Secondary Market** owns trading/transfer workflows
- **Asset Lifecycle** owns post-issuance servicing and lifecycle events
