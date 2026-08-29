# DAOS — Sub-Project #1: Monorepo Foundation + Tenant/Identity Context

**Date:** 2026-08-29
**Status:** Approved for implementation planning
**Scope owner:** Platform foundation team

## 1. Purpose

This is sub-project #1 of the DAOS multi-tenant private capital market platform for
digital assets. The full platform spans ~20 bounded contexts delivered in five phases.
This sub-project establishes the repository foundation and implements the first bounded
context — **Tenant Management & Identity** — in full depth. It sets the conventions
(hexagonal layering, tenant scoping, CQRS, outbox eventing, RBAC) that every later
context copies.

### Goals

- A NestJS **native monorepo** (nest-cli multi-app mode) that can grow to host all
  bounded contexts as independently deployable apps.
- A working **API Gateway** app and a **Tenant/Identity** service app, each runnable
  locally.
- The **Tenant Management & Identity** bounded context implemented to "core identity"
  depth: Tenant + User aggregates, Role/Permission RBAC, self-issued JWT auth,
  tenant-resolution middleware, white-label config, and domain events via the outbox
  pattern.
- All infrastructure behind **ports**, with in-memory adapters first so the system runs
  with zero external dependencies; real Postgres/Redis/Kafka adapters land in
  sub-project #2.

### Non-goals (deferred)

- Real persistence (PostgreSQL + RLS), Redis, Kafka/RabbitMQ adapters.
- The `Organization` and `ServiceEntitlement` aggregates (billing/subscription tiers).
- Other bounded contexts (investor, asset, deal, issuance, marketplace, waterfall, etc.).
- OPA/Casbin policy engine, mTLS, Vault, WAF.

## 2. Architecture

### 2.1 Repository layout (NestJS native monorepo)

```
daos/
├── nest-cli.json                    # projects: api-gateway, tenant-identity, libs
├── package.json                     # strict TS, jest, eslint+prettier, husky
├── tsconfig.json
├── apps/
│   ├── api-gateway/                 # :3000 — edge: tenant resolution, auth, rate limit, routing
│   └── tenant-identity/             # :3001 — identity bounded context
└── libs/
    ├── shared-kernel/               # @daos/shared-kernel — DDD toolkit
    └── identity-api/                # @daos/identity-api — request/response DTOs shared gateway↔service
```

- **Strict TypeScript** (`strict: true`).
- **ESLint + Prettier** with import sorting; **Husky** pre-commit runs lint + affected
  tests.
- **Layer boundary rules** enforced by ESLint: `domain/` must not import from
  `infrastructure/` or `interface/`; `application/` must not import ORM/adapter code.

### 2.2 Shared kernel (`libs/shared-kernel`)

Reusable DDD toolkit imported by every future context:

- **Value objects** — immutable with deep equality:
  - `Money` (bigint minor units + ISO currency; never `float`).
  - `Email`, `Percentage`, `UtcInstant`.
  - Typed IDs: `TenantId`, `UserId`, `RoleId`.
- **`AggregateRoot` base** — `version` field for optimistic concurrency; domain-event
  collection via `raise()` / `pullEvents()`.
- **`DomainEvent` base** — metadata: `eventId`, `aggregateId`, `tenantId`, `occurredAt`,
  `correlationId`, `causationId`, `schemaVersion`.
- **`TenantContext`** — AsyncLocalStorage-backed holder; set by middleware, read by
  repositories and command/query handlers.
- **Ports** (interfaces only): `OutboxPublisher`, `Clock`, `IdempotencyStore`.

### 2.3 API Gateway (`apps/api-gateway`)

Sub-project #1 scope:

- **Tenant resolution middleware** — `X-Tenant-ID` header → JWT claim → subdomain.
- **JWT verification guard** — validates tokens issued by the identity service.
- **Rate limiter** behind a port — sliding window; in-memory now, Redis later;
  per-tenant + per-IP tiers.
- **Routing** — proxies `/auth/**`, `/tenants/**`, `/users/**`, `/roles/**` to the
  identity service via an internal REST client, typed through `libs/identity-api` DTOs.
- **Composition (BFF)** — `GET /me` aggregates the user profile + tenant white-label
  config.
- Swagger exposed at the gateway.

### 2.4 Tenant/Identity service (`apps/tenant-identity`)

Follows the platform's hexagonal structure exactly:

```
apps/tenant-identity/src/
├── domain/
│   ├── aggregates/        Tenant, User
│   ├── entities/          Role
│   ├── value-objects/     Permission, WhiteLabelConfig, UserStatus, TenantStatus
│   ├── events/            TenantProvisioned, UserOnboarded, RoleAssigned, RoleRevoked
│   ├── services/          RbacEvaluator, TenantProvisioningService
│   └── repositories/      TenantRepository, UserRepository, RoleRepository (ports)
├── application/
│   ├── commands/          ProvisionTenant, OnboardUser, AssignRole, RevokeRole,
│   │                      SuspendUser, UpdateWhiteLabel
│   ├── queries/           GetTenant, GetUser, ListUsers, GetMyProfile
│   ├── events/            outbox dispatch, idempotent listeners
│   └── dto/               class-validator DTOs
├── infrastructure/
│   ├── persistence/       InMemory repositories (tenant-partitioned Maps)
│   ├── auth/              JwtIdentityAdapter behind IdentityProvider port
│   ├── messaging/         InMemoryOutboxPublisher
│   └── external/          BillingAdapter (port defined, stub impl)
└── interface/
    ├── http/              controllers (Swagger), JwtAuthGuard, RbacGuard,
    │                      TenantContextInterceptor
    └── event-listeners/
```

Uses the **NestJS CQRS module** for command and query handlers.

## 3. Domain model

### 3.1 Aggregates

- **`Tenant`** — `id`, `subdomain` (unique per platform), `name`, `status`,
  `WhiteLabelConfig`.
  - States: `provisioning → active → suspended`.
  - Invariants: unique subdomain across the platform; white-label config editable only
    while `active`.
- **`User`** — `id`, `tenantId`, `email` (unique per tenant), `status`, password hash
  (set via `IdentityProvider` port), role IDs (by reference, not object graphs).
  - States: `invited → active → disabled`.
  - Invariants: cannot assign a role that does not exist in the tenant; cannot disable
    the last active admin.

### 3.2 Entity

- **`Role`** — `id`, `tenantId`, `name`, set of `Permission`s. Tenant provisioning seeds
  three defaults: `tenant-admin`, `member`, `compliance-officer`.

### 3.3 Value objects

- **`Permission`** — `resource:action` string, e.g. `user:invite`, `tenant:read`.
- **`WhiteLabelConfig`** — brand color, logo URL, custom domain, feature flags.
- **`UserStatus`**, **`TenantStatus`** — enums.

### 3.4 Domain services

- **`RbacEvaluator`** — answers "does this user hold permission P?"; a pure function over
  the user's role set. Lives in the domain, never in controllers.
- **`TenantProvisioningService`** — creates the Tenant and its first admin User
  atomically within one command; raises `TenantProvisioned` and `UserOnboarded`.

### 3.5 Domain events

Past-tense, versioned (`v1`), each carrying full metadata (§2.2):

- `TenantProvisioned`
- `UserOnboarded`
- `RoleAssigned`
- `RoleRevoked`

## 4. Tenancy enforcement

- The gateway resolves the tenant (`X-Tenant-ID` → JWT claim → subdomain). The service
  **re-derives the tenant from the validated JWT claim** and never trusts forwarded
  headers alone.
- Every repository method is tenant-scoped. The in-memory adapters partition data by
  `tenantId`; the repository port signatures are written so the future Postgres adapter
  adds `WHERE tenant_id = $1` plus PostgreSQL **Row-Level Security** policies. Omitting
  the tenant is a compile-time error.
- **Platform-level operations** (e.g. `ProvisionTenant`) run under an explicit
  `PLATFORM` context that bypasses tenant scoping, gated by a platform-admin role.

## 5. Authentication & authorization

- **Self-issued JWT behind an `IdentityProvider` port.** `JwtIdentityAdapter` implements
  it with a configurable signing secret and Argon2 password hashing. The port leaves room
  to swap in Auth0/Cognito/Keycloak later.
- **Login** — `POST /auth/login` verifies credentials via the port and issues an
  **access token (15 min)** and a **refresh token (7 days)**. Claims: `sub`, `tenantId`,
  `roles`, `jti`.
- **Refresh & logout** — refresh endpoint rotates tokens; logout adds the `jti` to a
  denylist via the `IdempotencyStore` port (in-memory now, Redis later).
- **Guards** — both gateway and service verify tokens. Service-side `JwtAuthGuard` +
  `RbacGuard` enforce permissions using the `RbacEvaluator`.

## 6. Eventing (outbox pattern)

- Aggregates raise events; the command handler persists the aggregate, then appends
  events to the **outbox** (in-memory store now). The `OutboxPublisher` dispatches them to
  **idempotent listeners** keyed by `eventId`.
- Listeners in scope: audit/log entry and any default-role seeding reactions.
- Event names are past-tense with a `v1` schema suffix, ready to map onto Kafka topics
  (e.g. `identity.tenant.v1`) when the real messaging adapter arrives.

## 7. Testing & success criteria

- **Unit (Jest)** — full domain layer: value objects, aggregate invariants,
  `RbacEvaluator`, `TenantProvisioningService`. Target ~100% domain coverage.
- **E2E (supertest)** — golden path against both apps with in-memory adapters:
  provision tenant → onboard user → login → assign role → permission-gated call
  succeeds/fails correctly → events observed in the outbox.
- **Deferred:** TestContainers/integration tests (needs Docker, sub-project #2), real
  Postgres+RLS / Redis / Kafka adapters.

### Definition of done

1. `npm run start:dev` launches both apps.
2. The golden path works end-to-end through the gateway.
3. All tests green.
4. OpenAPI/Swagger docs browsable for both apps.

## 8. Implementation standards carried forward

These conventions from the platform spec are binding for this and all later
sub-projects:

- Start with the domain layer before any infrastructure code.
- Use the NestJS CQRS module for command/query handlers.
- Implement repository interfaces (ports) before concrete adapters.
- Include tenant scoping in every repository method and query.
- Validate business invariants in the domain layer, never in controllers.
- Publish domain events after aggregate persistence via the outbox pattern.
- Use `class-validator` DTOs at application-layer boundaries.
- Implement idempotency for event handlers.
- Include Swagger/OpenAPI documentation for HTTP controllers.
- Write unit tests for domain logic alongside the code.

## 9. Future sub-projects (out of scope here)

- **Sub-project #2 — Infrastructure adapters:** PostgreSQL + RLS, Redis, Kafka/RabbitMQ
  outbox relay, TestContainers integration tests, Flyway migrations.
- **Sub-project #3+ — Remaining contexts:** Investor Management & Accreditation, Asset
  Origination, Opportunity Engineering, Deal Structuring, Legal Entity Structuring,
  Investment Product Design, Issuance Studio, Distribution & Capital Raising,
  Marketplace, Waterfall Engine, Settlement & Clearing, Compliance & Regulatory
  Reporting, Reporting & Analytics, Document Management & Cap Table, Notification,
  Wallet & Custody, Pricing & Valuation, Risk Management, Governance & Voting.
