# DAOS - Digital Assets Operating System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E=18.0.0-brightgreen.svg)](https://nodejs.org/)
[nestjs](https://img.shields.io/badge/NestJS-%3E=9.0.0-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
[PostgreSQL](https://img.shields.io/badge/PostgreSQL-%3E=13-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
[Kafka](https://img.shields.io/badge/Kafka-%3E-23B0A0?style=for-the-badge&logo=apache-kafka&logoColor=white)
[Docker](https://img.shields.io/badge/Docker-%3E-2496ED?style=for-the-badge&logo=docker&logoColor=white)

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

The system is organized into 47 phases across 22 phases, covering:

### Phase 1-5: Domain Architecture
- AO-001: Define Asset Origination bounded context
- AO-002: Create Asset Origination context map
- AO-101: Replace current AssetStatus lifecycle
- AO-102: Create AssetLifecycleHistory
- AO-103: Lifecycle commands

### Phase 6-10: Asset Identity & Registration
- AO-201: Expand Asset identity model
- AO-202: Asset class taxonomy
- AO-203: Asset source model

### Phase 11-15: Sponsor & Counterparty Management
- AO-301: Sponsor reference integration
- AO-302: Asset counterparties

### Phase 16-20: Asset Screening Engine
- AO-401: Create screening aggregate/entity
- AO-402: Screening criteria
- AO-403: Screening decision

### Phase 21-25: Asset Qualification
- AO-501: Qualification model
- AO-502: Qualification scoring

### Phase 26-30: Due Diligence Engine
- AO-601: Due diligence categories
- AO-602: Due diligence checklist engine
- AO-603: Due diligence findings
- AO-604: Due diligence workflow
- AO-605: Fix current Due Diligence domain issue
- AO-606: Multiple Due Diligence reports

### Phase 31-35: Valuation Engine
- AO-701: Replace StubValuationAdapter
- AO-702: Valuation methodologies
- AO-703: Valuation model
- AO-704: Valuation history

### Phase 36-40: Cash Flow Modeling & Risk Assessment
- AO-801: Complete CashFlowModel persistence
- AO-802: Cash flow model commands
- AO-803: Cash flow model validation
- AO-804: Cash flow calculations
- AO-805: Scenario support
- AO-901: Risk Assessment aggregate
- AO-902: Risk scoring
- AO-903: Risk register

### Phase 41-45: Document Integration & Approval Workflow
- AO-1001: Asset document references
- AO-1002: Document requirements
- AO-1101: Remove simplistic approval model
- AO-1102: Asset approval states
- AO-1103: Conditional approval

### Phase 46-47: Pipeline Management & Domain Events
- AO-1201: Pipeline stages
- AO-1202: Pipeline query API
- AO-1203: Pipeline metrics
- AO-1301: Create Asset-to-Deal handoff workflow
- AO-1302: Define AssetApproved event contract
- AO-1303: Deal creation handoff
- AO-1401: Expand event catalog
- AO-1402: Event envelope
- AO-1501: Replace InMemoryOutbox
- AO-1601: Enforce optimistic locking
- AO-1701: Asset commands
- AO-1702: Asset query APIs
- AO-1801: Asset search
- AO-1802: Advanced filtering
- AO-1901: Asset audit log
- AO-2001: Tenant isolation
- AO-2002: RBAC
- AO-2101: Structured logging
- AO-2102: Metrics
- AO-2201: Asset aggregate tests
- AO-2202: Due diligence tests
- AO-2203: Valuation tests
- AO-2204: Cash flow tests
- AO-2205: Integration tests

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

---

## Technology Stack

### Framework & Runtime
- **NestJS** - @nestjs/core, @nestjs/cli ^9.0.0
- **Node.js** >= 18.0.0
- **TypeScript** ^5.0.0

### Database & Persistence
- **PostgreSQL** ^13 with TypeORM
- **TypeORM** ORM for entity management
- **PostGIS** (optional) for geographic data
- **Redis** for caching and pub/sub

### Messaging & Events
- **Apache Kafka** for event sourcing and pub/sub
- **KafkaJS** for Node.js Kafka client
- **Domain Events** pattern for internal communication

### Infrastructure
- **Docker** & **Docker Compose** for containerization
- **Docker Compose** for local development
- **Git** for version control

### Development Tools
- **Jest** for testing
- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for git hooks
- **Bcrypt** for password hashing

### APIs & Integration
- **RESTful APIs** with OpenAPI specification
- **GraphQL** (optional) for flexible queries
- **Webhooks** for external integrations

---

## Project Structure

```
d:\Workspace\DAOS\
├── docker-compose.yml          # Full stack services
├── docker-compose.override.yml # Override configs
├── package.json                # Root dependencies
├── tsconfig.json               # TypeScript config
├── eslint.config.mjs           # ESLint config
├── jest.config.js              # Jest testing config
├── nest-cli.json               # NestJS CLI config
├── README.md                   # This file
├── plan2.md                    # Project plan
├── tasks.md                    # Task tracking
├── .env.example              # Environment variables example
├── .husky/                   # Git hooks
└── apps/                     # NestJS microservices/apps
│   ├── asset-origination/    # Main origination service
│   ├── opportunity-engineering/ # Investment engineering
│   ├── issuance/             # Token creation
│   ├── distribution/         # Investor subscriptions
│   ├── compliance/           # KYC/KYB/AML
│   ├── document-management/  # Document service
│   ├── entity-studio/        # Entity management
│   ├── risk-management/      # Risk assessment
│   ├── pricing-valuation/    # Valuation services
│   └── ... (other specialized apps)
├── libs/                     # Shared libraries
│   ├── asset-api/            # Asset API contracts
│   ├── grpc-contracts/       # gRPC service contracts
│   ├── identity-api/         # Identity management
│   ├── investor-api/         # Investor APIs
│   ├── opportunity-api/      # Opportunity APIs
│   ├── shared-kernel/        # Shared utilities/entities
│   └── saga-workflows/       # Event-driven workflows
├── db/                       # Database scripts
│   ├── liquibase.properties  # Liquibase config
│   └── changelog/            # Database migrations
│       ├── 000_init.xml
│       └── master.xml
├── docs/                     # Documentation
│   └── superpowers/          # Design specs
├── kong/                     # Kong API gateway config
│   └── kong.yml
├── kuma/                     # Kuma mTLS config
│   ├── dataplanes/
│   ├── policies/
│   └── tls/
└── scripts/                  # Operational scripts
    └── setup-mesh.sh
```

---

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 13
- Docker & Docker Compose (recommended for full stack)
- Kafka (or use Docker Compose setup)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/daos.git
   cd daos
   ```

2. **Install dependencies**
   ```bash
   # Root level
   npm install

   # Or install per app
   cd apps/asset-origination
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database migration**
   ```bash
   # Using Liquibase
   npx liquibase update

   # Or run migrations from seeds
   npm run migration:run
   ```

5. **Start the development server**
   ```bash
   # Using Docker Compose (recommended)
   docker-compose up -d

   # Or start individual services
   cd apps/asset-origination
   npm run start:dev
   ```

6. **Access the application**
   - API Documentation: http://localhost:3000/api/docs
   - Health Check: http://localhost:3000/health
   - Kafka UI: http://localhost:8080 (if using Docker Compose)

### Available Scripts

```bash
# Root level
npm run build          # Build all apps
npm run start          # Start all apps (production)
npm run start:dev      # Start all apps (development)
npm run test           # Run all tests
npm run lint           # Lint all code
npm run format         # Format all code

# Per app example
cd apps/asset-origination
npm run start:dev      # Start asset-origination in dev mode
npm run test           # Run asset-origination tests
npm run lint           # Lint asset-origination code
```

---

## API Documentation

The project uses OpenAPI/Swagger for API documentation. Once the server is running:

- **Swagger UI**: `http://localhost:3000/api/docs`
- **OpenAPI JSON**: `http://localhost:3000/api-spec`

### Key Endpoints (Asset Origination)

#### Assets
```
GET     /assets              - List all assets
GET     /assets/{id}         - Get asset by ID
POST    /assets              - Create new asset
PUT     /assets/{id}         - Update asset
DELETE  /assets/{id}         - Delete asset

#### Asset Pipeline
GET     /assets/pipeline     - Get pipeline statistics
GET     /assets/{id}/summary - Get asset summary
GET     /assets/{id}/timeline - Get asset timeline

#### Lifecycle Commands
POST    /assets/drafts       - Create asset draft
POST    /assets              - Originate asset
POST    /assets/{id}/screening/start - Start screening
POST    /assets/{id}/screening/complete - Complete screening
POST    /assets/{id}/qualify   - Qualify asset
POST    /assets/{id}/due-diligence/start - Start DD
POST    /assets/{id}/due-diligence/submit - Submit DD
POST    /assets/{id}/due-diligence/complete - Complete DD
POST    /assets/{id}/valuation - Request valuation
POST    /assets/{id}/risk-assessment/start - Start risk assessment
POST    /assets/{id}/approval/submit - Submit for approval
POST    /assets/{id}/approve   - Approve asset
POST    /assets/{id}/reject    - Reject asset
POST    /assets/{id}/hold      - Put on hold
POST    /assets/{id}/resume    - Resume from hold
POST    /assets/{id}/withdraw  - Withdraw asset
POST    /assets/{id}/handoff-to-deal - Handoff to Deal Studio
```

---

## Architecture Diagrams

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DAOS - MONOREPO                            │
├─────────────────────┬─────────────────────┬─────────────────┤
│       APPS          │        LIBS         │    INFRA        │
│  asset-origination │  asset-api,        │  PostgreSQL     │
│  opportunity-eng   │  grpc-contracts,   │  Liquibase      │
│  issuance          │  identity-api,     │  Kafka          │
│  distribution      │  investor-api,     │  Redis          │
│  compliance        │  opportunity-api,  │  Docker         │
│  document-mgmt     │  shared-kernel     │  Kubernetes     │
└─────────────────────┴─────────────────────┴─────────────────┘
                                      │
                                      ▼
                            ┌─────────────────────┐
                            │  EXTERNAL SERVICES  │
                            │  Document Service   │
                            │  Entity Studio      │
                            │  Compliance OS      │
                            └─────────────────────┘
```

### Data Flow

```
SOURCE / ORIGINATOR
        ↓
ORIGINATION CASE
        ↓
SUBMISSION
        ↓
INTAKE
        ↓
DUPLICATE / ENTITY RESOLUTION
        ↓
CANONICAL ASSET
        ↓
IDENTITY
        ↓
CLASSIFICATION
        ↓
OWNERSHIP / CONTROL / RIGHTS
        ↓
PROVENANCE
        ↓
EVIDENCE / DATA ROOM
        ↓
VERIFICATION
        ↓
LEGAL / TRANSFERABILITY
        ↓
COMPLIANCE
        ↓
SCREENING
        ↓
QUALIFICATION
        ↓
DUE DILIGENCE
        ↓
PRELIMINARY VALUATION
        ↓
ASSET-LEVEL RISK
        ↓
APPROVAL
        ↓
ENGINEERING READINESS
        ↓
OPPORTUNITY ENGINEERING
        ↓
DEAL STRUCTURING
        ↓
ISSUANCE
        ↓
DISTRIBUTION
        ↓
SECONDARY MARKET
        ↓
LIFECYCLE
```

### Event Flow

```
AssetCreated → AssetStatusChanged → AssetScreeningStarted → AssetScreeningCompleted
→ AssetQualified → DueDiligenceStarted → DueDiligenceFindingCreated → DueDiligenceCompleted
→ ValuationRequested → ValuationCompleted → AssetSubmittedForApproval → AssetApproved
→ AssetHandedOffToDealStudio → OpportunityEngineeringInput
```

---

## Development Guidelines

### Code Style

- **TypeScript** with strict mode enabled
- **ESLint** configuration in `eslint.config.mjs`
- **Prettier** for code formatting (run `npm run format`)
- **Commit messages** follow Conventional Commits

### Branch Strategy

```
main    - Production-ready code
develop - Development branch
feature/* - New features
fix/* - Bug fixes
hotfix/* - Critical production fixes
```

### Pull Request Process

1. Create a feature branch from `develop`
2. Implement your changes
3. Add/update tests as needed
4. Ensure `npm run lint` passes
5. Ensure `npm run test` passes
6. Submit PR with clear description
7. Code review required from at least one maintainer

### Testing

```bash
# Run all tests
npm run test

# Run specific app tests
cd apps/asset-origination
npm run test

# Run tests with coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

### Linting

```bash
npm run lint          # Check linting
npm run lint:fix      # Auto-fix linting issues
```

---

## Contributing

Please read the following before contributing:

1. **Fork the repository** and create your branch from `develop`
2. **Follow the code style** - ESLint + Prettier
3. **Write tests** for new functionality
4. **Update documentation** if needed
5. **Submit a Pull Request** with clear description

### Development Setup

```bash
# 1. Clone and install
git clone https://github.com/your-org/daos.git
cd daos
npm install

# 2. Setup environment
cp .env.example .env
# Configure your .env

# 3. Start databases
docker-compose up -d postgres kafka redis

# 4. Run migrations
npx liquibase update

# 5. Start development
npm run start:dev
```

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 DAOS Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Additional Resources

- **Project Plan**: [plan2.md](plan2.md)
- **Task Tracking**: [tasks.md](tasks.md)
- **Design Specifications**: [docs/superpowers/](docs/superpowers/)
- **API Specifications**: OpenAPI at `/api-spec` endpoint
- **Docker Setup**: [docker-compose.yml](docker-compose.yml)
- **Database Migrations**: [db/changelog/](db/changelog/)

---

## Badges

You can add these badges to your GitHub README:

```markdown
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E=18.0.0-brightgreen.svg)](https://nodejs.org/)
[nestjs](https://img.shields.io/badge/NestJS-%3E=9.0.0-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
[PostgreSQL](https://img.shields.io/badge/PostgreSQL-%3E=13-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
[Kafka](https://img.shields.io/badge/Kafka-%3E-23B0A0?style=for-the-badge&logo=apache-kafka&logoColor=white)
[Docker](https://img.shields.io/badge/Docker-%3E-2496ED?style=for-the-badge&logo=docker&logoColor=white)
```

---

*Last updated: 2026-09-02*
