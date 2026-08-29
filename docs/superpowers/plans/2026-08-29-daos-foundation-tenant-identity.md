# DAOS Sub-Project #1 — Monorepo Foundation + Tenant/Identity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a NestJS native monorepo with an API Gateway app and a Tenant/Identity service app implementing the Tenant Management & Identity bounded context (Tenant + User aggregates, RBAC, self-issued JWT auth, tenant scoping, outbox domain events) on in-memory adapters.

**Architecture:** NestJS native monorepo (`nest-cli.json` multi-app mode). Two runnable apps (`api-gateway` on :3000, `tenant-identity` on :3001) and two libs (`shared-kernel`, `identity-api`). Strict hexagonal layering inside `tenant-identity` (domain → application → infrastructure → interface). CQRS via `@nestjs/cqrs`. All persistence/messaging/auth behind ports with in-memory adapters. Builds use webpack so cross-lib `@daos/*` imports resolve inside the bundle.

**Tech Stack:** TypeScript strict, NestJS 11, `@nestjs/cqrs`, `@nestjs/swagger`, `class-validator`/`class-transformer`, `argon2`, `jsonwebtoken`, Jest + ts-jest + supertest, webpack (via `@nestjs/cli`).

---

## Verified environment facts

- Node `v26.4.0`, npm `11.17.0`, git `2.54.0`, Windows + Git Bash. Repo root: `C:\Wrk\DAOS` (already a git repo with a `docs/` commit).
- `argon2@0.45.1` installs and runs on this machine (verified: hash+verify returned `true`). Keep argon2; do NOT substitute.
- All commands run from the repo root unless stated. Use Git Bash syntax.

## Conventions for the implementing engineer

- Every task ends with a commit. Keep commits small and named as shown.
- Do NOT introduce dependencies beyond those listed in Task 0.
- `strict: true` must pass. No `any` escapes unless explicitly shown in this plan.
- Domain layer (`apps/tenant-identity/src/domain/**` and `libs/shared-kernel/src/**`) must never import from `infrastructure`, `interface`, or `@nestjs/*`. Domain code is pure TypeScript (the only exception is infrastructure classes that implement domain ports — those live in `infrastructure/`).
- Tests are colocated: `foo.spec.ts` next to `foo.ts`.
- Follow TDD where the plan says "write the failing test first": RED (run and see it fail) → GREEN (implement) → commit.
- The pre-commit hook (lint-staged) may auto-fix import ordering (`simple-import-sort`) and reformat with Prettier. If the hook modifies files, re-stage them and commit — never bypass the hook with `--no-verify`.

---

## File map

```
C:\Wrk\DAOS
├─ package.json
├─ tsconfig.json
├─ nest-cli.json
├─ .gitignore
├─ .prettierrc
├─ eslint.config.mjs
├─ jest.config.js
├─ .env.example
├─ README.md
├─ apps/
│  ├─ api-gateway/
│  │  ├─ tsconfig.app.json
│  │  ├─ src/
│  │     ├─ main.ts
│  │     ├─ gateway.module.ts
│  │     ├─ middleware/tenant-resolution.middleware.ts
│  │     ├─ middleware/rate-limit.middleware.ts
│  │     ├─ auth/jwt-verify.middleware.ts
│  │     ├─ rate-limit/rate-limiter.port.ts
│  │     ├─ rate-limit/in-memory-rate-limiter.ts
│  │     ├─ proxy/identity-http.client.ts
│  │     └─ me/me.controller.ts
│  │  └─ test/{golden-path.e2e-spec.ts,proxy-helper.ts}
│  └─ tenant-identity/
│     ├─ tsconfig.app.json
│     ├─ src/
│     │  ├─ main.ts
│     │  ├─ tenant-identity.module.ts
│     │  ├─ domain/
│     │  │  ├─ value-objects/{status,permission,white-label-config}.ts
│     │  │  ├─ events/{tenant-provisioned,user-onboarded,role-assigned,role-revoked}.event.ts
│     │  │  ├─ aggregates/{tenant,user}.aggregate.ts
│     │  │  ├─ entities/role.entity.ts
│     │  │  ├─ services/{rbac-evaluator,default-roles,tenant-provisioning.service}.ts
│     │  │  ├─ repositories/{repository.tokens,tenant.repository,user.repository,role.repository}.ts
│     │  │  └─ ports/identity-provider.port.ts
│     │  ├─ application/
│     │  │  ├─ dto/{provision-tenant,login,refresh,onboard-user,assign-role,update-white-label}.dto.ts
│     │  │  ├─ commands/{provision-tenant,login,logout,refresh-token,onboard-user,assign-role,revoke-role,suspend-user,update-white-label}.command.ts
│     │  │  ├─ queries/{get-tenant,get-user,list-users,list-roles,get-my-profile}.query.ts
│     │  │  └─ events/outbox-dispatcher.ts
│     │  ├─ infrastructure/
│     │  │  ├─ persistence/{in-memory-tenant,in-memory-user,in-memory-role}.repository.ts
│     │  │  ├─ auth/{jwt-identity.adapter,platform-seeder}.ts
│     │  │  ├─ messaging/in-memory-outbox.ts
│     │  │  ├─ clock/system-clock.ts
│     │  │  ├─ idempotency/in-memory-idempotency.store.ts
│     │  │  └─ external/billing.adapter.ts
│     │  └─ interface/http/
│     │     ├─ controllers/{auth,tenant,user,role,me}.controller.ts
│     │     ├─ guards/{jwt-auth.guard,rbac.guard}.ts
│     │     ├─ decorators/{require-permission,current-user}.decorator.ts
│     │     ├─ interceptors/tenant-context.interceptor.ts
│     │     └─ filters/domain-exception.filter.ts
│     └─ test/app.e2e-spec.ts
└─ libs/
   ├─ shared-kernel/
   │  ├─ tsconfig.lib.json
   │  └─ src/
   │     ├─ index.ts
   │     ├─ errors.ts
   │     ├─ value-objects/{money,email,percentage,utc-instant}.ts
   │     ├─ ids/domain-id.ts
   │     ├─ aggregate-root.ts
   │     ├─ domain-event.ts
   │     ├─ tenant-context.ts
   │     └─ ports/{clock,outbox-publisher,idempotency-store}.port.ts
   └─ identity-api/
      ├─ tsconfig.lib.json
      └─ src/{index.ts,dtos.ts}
```

---

## Task 0: Scaffold the monorepo + tooling

**Files:**
- Create: `package.json`, `tsconfig.json`, `nest-cli.json`, `.gitignore`, `.prettierrc`, `eslint.config.mjs`, `jest.config.js`, `.env.example`, `README.md`
- Create: `apps/api-gateway/tsconfig.app.json`, `apps/tenant-identity/tsconfig.app.json`, `libs/shared-kernel/tsconfig.lib.json`, `libs/identity-api/tsconfig.lib.json`

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "daos",
  "version": "0.1.0",
  "private": true,
  "description": "DAOS multi-tenant private capital market platform (sub-project 1: foundation + tenant/identity)",
  "scripts": {
    "build": "nest build api-gateway && nest build tenant-identity",
    "start:gateway": "nest start api-gateway",
    "start:identity": "nest start tenant-identity",
    "start:dev": "concurrently -n identity,gateway -c blue,green \"nest start tenant-identity --watch\" \"nest start api-gateway --watch\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "lint": "eslint \"{apps,libs}/**/*.ts\"",
    "format": "prettier --write \"{apps,libs}/**/*.ts\"",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "prettier --write"
    ]
  },
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/config": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/cqrs": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "@nestjs/swagger": "^11.0.0",
    "argon2": "^0.45.1",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "jsonwebtoken": "^9.0.2",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1",
    "swagger-ui-express": "^5.0.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "@nestjs/schematics": "^11.0.0",
    "@nestjs/testing": "^11.0.0",
    "@types/express": "^5.0.0",
    "@types/jest": "^29.5.12",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/node": "^22.0.0",
    "@types/supertest": "^6.0.2",
    "concurrently": "^9.0.0",
    "eslint": "^9.0.0",
    "globals": "^15.0.0",
    "jest": "^29.7.0",
    "prettier": "^3.3.0",
    "supertest": "^7.0.0",
    "ts-jest": "^29.2.0",
    "ts-loader": "^9.5.1",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.5.0",
    "typescript-eslint": "^8.0.0",
    "webpack": "^5.94.0",
    "webpack-node-externals": "^3.0.0",
    "eslint-plugin-simple-import-sort": "^12.1.1",
    "husky": "^9.1.7",
    "lint-staged": "^15.2.10"
  }
}
```

- [ ] **Step 2: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2022",
    "lib": ["ES2022"],
    "moduleResolution": "node",
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "declaration": false,
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@daos/shared-kernel": ["libs/shared-kernel/src"],
      "@daos/shared-kernel/*": ["libs/shared-kernel/src/*"],
      "@daos/identity-api": ["libs/identity-api/src"],
      "@daos/identity-api/*": ["libs/identity-api/src/*"]
    }
  },
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Write `nest-cli.json`** (webpack enabled so `@daos/*` aliases resolve in the runtime bundle)

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "apps/api-gateway/src",
  "monorepo": true,
  "root": "apps/api-gateway",
  "compilerOptions": {
    "webpack": true,
    "tsConfigPath": "apps/api-gateway/tsconfig.app.json"
  },
  "projects": {
    "api-gateway": {
      "type": "application",
      "root": "apps/api-gateway",
      "entryFile": "main",
      "sourceRoot": "apps/api-gateway/src",
      "compilerOptions": { "tsConfigPath": "apps/api-gateway/tsconfig.app.json" }
    },
    "tenant-identity": {
      "type": "application",
      "root": "apps/tenant-identity",
      "entryFile": "main",
      "sourceRoot": "apps/tenant-identity/src",
      "compilerOptions": { "tsConfigPath": "apps/tenant-identity/tsconfig.app.json" }
    },
    "shared-kernel": {
      "type": "library",
      "root": "libs/shared-kernel",
      "entryFile": "index",
      "sourceRoot": "libs/shared-kernel/src",
      "compilerOptions": { "tsConfigPath": "libs/shared-kernel/tsconfig.lib.json" }
    },
    "identity-api": {
      "type": "library",
      "root": "libs/identity-api",
      "entryFile": "index",
      "sourceRoot": "libs/identity-api/src",
      "compilerOptions": { "tsConfigPath": "libs/identity-api/tsconfig.lib.json" }
    }
  }
}
```

- [ ] **Step 4: Write the four project tsconfigs**

`apps/api-gateway/tsconfig.app.json`:
```json
{ "extends": "../../tsconfig.json", "compilerOptions": { "outDir": "../../dist/apps/api-gateway" }, "include": ["src/**/*"] }
```

`apps/tenant-identity/tsconfig.app.json`:
```json
{ "extends": "../../tsconfig.json", "compilerOptions": { "outDir": "../../dist/apps/tenant-identity" }, "include": ["src/**/*"] }
```

`libs/shared-kernel/tsconfig.lib.json`:
```json
{ "extends": "../../tsconfig.json", "compilerOptions": { "outDir": "../../dist/libs/shared-kernel", "declaration": true }, "include": ["src/**/*"] }
```

`libs/identity-api/tsconfig.lib.json`:
```json
{ "extends": "../../tsconfig.json", "compilerOptions": { "outDir": "../../dist/libs/identity-api", "declaration": true }, "include": ["src/**/*"] }
```

- [ ] **Step 5: Write `.gitignore`**

```
node_modules/
dist/
coverage/
*.log
.env
.DS_Store
```

- [ ] **Step 6: Write `.prettierrc`**

```json
{ "singleQuote": true, "trailingComma": "all", "printWidth": 120, "tabWidth": 2, "semi": true }
```

- [ ] **Step 7: Write `eslint.config.mjs`** (includes the hexagonal layer-boundary rule)

```js
import globals from 'globals';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**'] },
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
      parserOptions: { project: null },
    },
    plugins: { 'simple-import-sort': simpleImportSort },
    extends: [...tseslint.configs.recommended],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  {
    // Layer boundary: domain code must not import infrastructure/interface or Nest runtime.
    files: ['apps/*/src/domain/**/*.ts', 'libs/shared-kernel/src/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: ['*infrastructure*', '*interface*', '@nestjs/*'] }],
    },
  },
);
```

- [ ] **Step 8: Write `jest.config.js`**

```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/apps', '<rootDir>/libs'],
  testMatch: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
  moduleNameMapper: {
    '^@daos/shared-kernel/(.*)$': '<rootDir>/libs/shared-kernel/src/$1',
    '^@daos/shared-kernel$': '<rootDir>/libs/shared-kernel/src',
    '^@daos/identity-api/(.*)$': '<rootDir>/libs/identity-api/src/$1',
    '^@daos/identity-api$': '<rootDir>/libs/identity-api/src',
  },
  testTimeout: 30000,
  collectCoverageFrom: ['libs/**/src/**/*.ts', 'apps/**/src/domain/**/*.ts'],
};
```

- [ ] **Step 9: Write `.env.example`**

```
# Identity service
IDENTITY_PORT=3001
JWT_SECRET=dev-secret-change-me
JWT_ACCESS_TTL_SECONDS=900
JWT_REFRESH_TTL_SECONDS=604800
PLATFORM_ADMIN_EMAIL=admin@platform.local
PLATFORM_ADMIN_PASSWORD=platform-admin-password

# Gateway
GATEWAY_PORT=3000
IDENTITY_URL=http://localhost:3001
RATE_LIMIT_MAX=1000
RATE_LIMIT_WINDOW_MS=60000
```

- [ ] **Step 10: Write a stub `README.md`** (replaced in Task 17)

```markdown
# DAOS

Multi-tenant private capital market platform. Sub-project 1: monorepo foundation +
Tenant Management & Identity context. See docs/superpowers/specs for the design spec.
```

- [ ] **Step 11: Install dependencies and create the pre-commit hook**

Run: `npm install`
Expected: completes without error (the `prepare` script initializes the `.husky/` directory). If `argon2` fails to install, STOP and report — do not substitute a different hasher.

Then write `.husky/pre-commit`:
```
npx lint-staged
```

- [ ] **Step 12: Sanity-check tooling**

Run: `npx tsc --version`
Expected: prints `Version 5.x`.

- [ ] **Step 13: Commit**

```bash
git add package.json package-lock.json tsconfig.json nest-cli.json .gitignore .prettierrc eslint.config.mjs jest.config.js .env.example README.md .husky/pre-commit apps/api-gateway/tsconfig.app.json apps/tenant-identity/tsconfig.app.json libs/shared-kernel/tsconfig.lib.json libs/identity-api/tsconfig.lib.json
git commit -m "chore: scaffold NestJS monorepo with tooling"
```

---

## Task 1: Shared kernel — errors, typed IDs, value objects

**Files:**
- Create: `libs/shared-kernel/src/errors.ts`, `libs/shared-kernel/src/ids/domain-id.ts`, `libs/shared-kernel/src/value-objects/{money,email,percentage,utc-instant}.ts`
- Test: `libs/shared-kernel/src/value-objects/money.spec.ts`, `email.spec.ts`, `percentage.spec.ts`, `libs/shared-kernel/src/ids/domain-id.spec.ts`

- [ ] **Step 1: Write the failing test for `Money`**

`libs/shared-kernel/src/value-objects/money.spec.ts`:
```ts
import { Money } from './money';

describe('Money', () => {
  it('creates from bigint minor units', () => {
    const m = Money.of(1000n, 'USD');
    expect(m.amount).toBe(1000n);
    expect(m.currency).toBe('USD');
  });
  it('rejects invalid currency', () => {
    expect(() => Money.of(1n, 'us')).toThrow('Invalid ISO currency');
  });
  it('adds same currency', () => {
    expect(Money.of(100n, 'USD').add(Money.of(50n, 'USD')).amount).toBe(150n);
  });
  it('rejects add across currencies', () => {
    expect(() => Money.of(1n, 'USD').add(Money.of(1n, 'EUR'))).toThrow('Currency mismatch');
  });
  it('supports deep equality', () => {
    expect(Money.of(100n, 'USD').equals(Money.of(100n, 'USD'))).toBe(true);
    expect(Money.of(100n, 'USD').equals(Money.of(100n, 'EUR'))).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx jest libs/shared-kernel/src/value-objects/money.spec.ts`
Expected: FAIL with `Cannot find module './money'`.

- [ ] **Step 3: Implement `money.ts`**

`libs/shared-kernel/src/value-objects/money.ts`:
```ts
export class Money {
  private constructor(public readonly amount: bigint, public readonly currency: string) {}

  static of(amount: bigint, currency: string): Money {
    if (!/^[A-Z]{3}$/.test(currency)) throw new Error(`Invalid ISO currency: ${currency}`);
    return new Money(amount, currency);
  }

  static zero(currency: string): Money {
    return Money.of(0n, currency);
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) throw new Error('Currency mismatch');
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) throw new Error('Currency mismatch');
    return new Money(this.amount - other.amount, this.currency);
  }

  equals(other: Money): boolean {
    return this.currency === other.currency && this.amount === other.amount;
  }

  toString(): string {
    return `${this.amount} ${this.currency}`;
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx jest libs/shared-kernel/src/value-objects/money.spec.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Write test + implementation for `Email`**

`libs/shared-kernel/src/value-objects/email.spec.ts`:
```ts
import { Email } from './email';

describe('Email', () => {
  it('normalizes to lowercase', () => {
    expect(Email.create('  Foo@Bar.COM ').value).toBe('foo@bar.com');
  });
  it('rejects malformed addresses', () => {
    expect(() => Email.create('not-an-email')).toThrow('Invalid email');
    expect(() => Email.create('a@b')).toThrow('Invalid email');
  });
  it('supports equality', () => {
    expect(Email.create('a@b.co').equals(Email.create('A@B.CO'))).toBe(true);
  });
});
```

`libs/shared-kernel/src/value-objects/email.ts`:
```ts
export class Email {
  private constructor(public readonly value: string) {}

  static create(value: string): Email {
    const v = value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) throw new Error(`Invalid email: ${value}`);
    return new Email(v);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
```

Run: `npx jest libs/shared-kernel/src/value-objects/email.spec.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Write test + implementation for typed IDs**

`libs/shared-kernel/src/ids/domain-id.spec.ts`:
```ts
import { TenantId, UserId, RoleId } from './domain-id';

describe('Domain IDs', () => {
  it('generates a uuid when none given', () => {
    expect(TenantId.create().value).toMatch(/^[0-9a-f-]{36}$/);
  });
  it('wraps an existing value', () => {
    expect(TenantId.create('abc').value).toBe('abc');
  });
  it('rejects empty values', () => {
    expect(() => UserId.create('')).toThrow('cannot be empty');
  });
  it('equals only same type and value', () => {
    expect(RoleId.create('x').equals(RoleId.create('x'))).toBe(true);
    expect(RoleId.create('x').equals(RoleId.create('y'))).toBe(false);
    expect(TenantId.create('x').equals(UserId.create('x') as unknown as TenantId)).toBe(false);
  });
});
```

`libs/shared-kernel/src/ids/domain-id.ts`:
```ts
import { randomUUID } from 'node:crypto';

export abstract class DomainId {
  protected constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error(`${this.constructor.name} cannot be empty`);
    }
  }

  equals(other: DomainId): boolean {
    return other !== null && other.constructor === this.constructor && this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

export class TenantId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): TenantId {
    return new TenantId(value ?? randomUUID());
  }
}

export class UserId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): UserId {
    return new UserId(value ?? randomUUID());
  }
}

export class RoleId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): RoleId {
    return new RoleId(value ?? randomUUID());
  }
}
```

Run: `npx jest libs/shared-kernel/src/ids/domain-id.spec.ts`
Expected: PASS (4 tests).

- [ ] **Step 7: Implement `Percentage` + `UtcInstant` with tests**

`libs/shared-kernel/src/value-objects/percentage.ts`:
```ts
export class Percentage {
  private constructor(public readonly fraction: number) {}

  static fromFraction(fraction: number): Percentage {
    if (fraction < 0) throw new Error('Percentage cannot be negative');
    return new Percentage(fraction);
  }

  static fromPercent(percent: number): Percentage {
    return Percentage.fromFraction(percent / 100);
  }

  toPercent(): number {
    return this.fraction * 100;
  }

  equals(other: Percentage): boolean {
    return this.fraction === other.fraction;
  }
}
```

`libs/shared-kernel/src/value-objects/utc-instant.ts`:
```ts
export class UtcInstant {
  private constructor(private readonly epochMs: number) {}

  static now(): UtcInstant {
    return new UtcInstant(Date.now());
  }

  static from(date: Date): UtcInstant {
    return new UtcInstant(date.getTime());
  }

  static fromIso(iso: string): UtcInstant {
    const t = Date.parse(iso);
    if (Number.isNaN(t)) throw new Error(`Invalid ISO date: ${iso}`);
    return new UtcInstant(t);
  }

  toDate(): Date {
    return new Date(this.epochMs);
  }

  toIso(): string {
    return new Date(this.epochMs).toISOString();
  }

  isBefore(other: UtcInstant): boolean {
    return this.epochMs < other.epochMs;
  }

  equals(other: UtcInstant): boolean {
    return this.epochMs === other.epochMs;
  }
}
```

`libs/shared-kernel/src/value-objects/percentage.spec.ts`:
```ts
import { Percentage } from './percentage';
import { UtcInstant } from './utc-instant';

describe('Percentage', () => {
  it('converts percent to fraction and back', () => {
    expect(Percentage.fromPercent(12.5).fraction).toBeCloseTo(0.125);
    expect(Percentage.fromFraction(0.5).toPercent()).toBe(50);
  });
  it('rejects negative', () => {
    expect(() => Percentage.fromFraction(-1)).toThrow();
  });
});

describe('UtcInstant', () => {
  it('round-trips ISO', () => {
    const iso = '2026-01-01T00:00:00.000Z';
    expect(UtcInstant.fromIso(iso).toIso()).toBe(iso);
  });
  it('orders instants', () => {
    const a = UtcInstant.fromIso('2026-01-01T00:00:00.000Z');
    const b = UtcInstant.fromIso('2026-01-02T00:00:00.000Z');
    expect(a.isBefore(b)).toBe(true);
  });
});
```

Run: `npx jest libs/shared-kernel/src/value-objects/percentage.spec.ts`
Expected: PASS (4 tests).

- [ ] **Step 8: Implement `errors.ts`**

`libs/shared-kernel/src/errors.ts`:
```ts
export class DomainInvariantError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainInvariantError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class InvalidCredentialsError extends Error {
  constructor(message = 'Invalid credentials') {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}
```

- [ ] **Step 9: Commit**

```bash
git add libs/shared-kernel/src
git commit -m "feat(shared-kernel): add errors, typed IDs, and core value objects"
```

---

## Task 2: Shared kernel — DomainEvent, AggregateRoot, TenantContext, ports, barrel

**Files:**
- Create: `libs/shared-kernel/src/domain-event.ts`, `aggregate-root.ts`, `tenant-context.ts`, `ports/{clock,outbox-publisher,idempotency-store}.port.ts`, `index.ts`
- Test: `aggregate-root.spec.ts`, `tenant-context.spec.ts`

- [ ] **Step 1: Write the failing test**

`libs/shared-kernel/src/aggregate-root.spec.ts`:
```ts
import { AggregateRoot } from './aggregate-root';
import { DomainEvent } from './domain-event';

class ThingHappened extends DomainEvent {
  get eventType(): string {
    return 'test.thing.happened';
  }
}

class Thing extends AggregateRoot {
  doThing(tenantId: string): void {
    this.raise(new ThingHappened('agg-1', tenantId));
    this.incrementVersion();
  }
}

describe('AggregateRoot + DomainEvent', () => {
  it('collects and drains events with metadata', () => {
    const t = new Thing();
    t.doThing('tenant-1');
    const events = t.pullEvents();
    expect(events).toHaveLength(1);
    expect(events[0].eventType).toBe('test.thing.happened');
    expect(events[0].aggregateId).toBe('agg-1');
    expect(events[0].tenantId).toBe('tenant-1');
    expect(events[0].eventId).toMatch(/^[0-9a-f-]{36}$/);
    expect(events[0].schemaVersion).toBe(1);
    expect(events[0].correlationId).toBe(events[0].eventId);
    expect(events[0].causationId).toBeNull();
    expect(t.pullEvents()).toHaveLength(0);
  });

  it('tracks version for optimistic concurrency', () => {
    const t = new Thing();
    expect(t.version).toBe(0);
    t.doThing('tenant-1');
    expect(t.version).toBe(1);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx jest libs/shared-kernel/src/aggregate-root.spec.ts`
Expected: FAIL with `Cannot find module './aggregate-root'`.

- [ ] **Step 3: Implement `domain-event.ts` and `aggregate-root.ts`**

`libs/shared-kernel/src/domain-event.ts`:
```ts
import { randomUUID } from 'node:crypto';

export abstract class DomainEvent {
  public readonly eventId: string;
  public readonly occurredAt: string;
  public readonly correlationId: string;
  public readonly causationId: string | null;
  public readonly schemaVersion: number;

  constructor(
    public readonly aggregateId: string,
    public readonly tenantId: string | null,
    opts: { correlationId?: string; causationId?: string } = {},
  ) {
    this.eventId = randomUUID();
    this.occurredAt = new Date().toISOString();
    this.correlationId = opts.correlationId ?? this.eventId;
    this.causationId = opts.causationId ?? null;
    this.schemaVersion = 1;
  }

  abstract get eventType(): string;
}
```

`libs/shared-kernel/src/aggregate-root.ts`:
```ts
import { DomainEvent } from './domain-event';

export abstract class AggregateRoot {
  protected _version = 0;
  private _events: DomainEvent[] = [];

  get version(): number {
    return this._version;
  }

  protected incrementVersion(): void {
    this._version += 1;
  }

  protected raise(event: DomainEvent): void {
    this._events.push(event);
  }

  pullEvents(): DomainEvent[] {
    const events = [...this._events];
    this._events = [];
    return events;
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx jest libs/shared-kernel/src/aggregate-root.spec.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Implement `tenant-context.ts` + test**

`libs/shared-kernel/src/tenant-context.ts`:
```ts
import { AsyncLocalStorage } from 'node:async_hooks';

export interface TenantContextValue {
  tenantId: string | null;
  userId: string | null;
  roleIds: string[];
  permissions: string[];
  isPlatform: boolean;
}

const EMPTY: TenantContextValue = {
  tenantId: null,
  userId: null,
  roleIds: [],
  permissions: [],
  isPlatform: false,
};

export class TenantContextHolder {
  private static readonly storage = new AsyncLocalStorage<TenantContextValue>();

  static run<T>(value: TenantContextValue, fn: () => T): T {
    return this.storage.run(value, fn);
  }

  static enterWith(value: TenantContextValue): void {
    this.storage.enterWith(value);
  }

  static get(): TenantContextValue {
    return this.storage.getStore() ?? EMPTY;
  }

  static requireTenantId(): string {
    const ctx = this.get();
    if (!ctx.tenantId) throw new Error('No tenant in context');
    return ctx.tenantId;
  }
}
```

`libs/shared-kernel/src/tenant-context.spec.ts`:
```ts
import { TenantContextHolder } from './tenant-context';

describe('TenantContextHolder', () => {
  it('returns empty context outside a run', () => {
    expect(TenantContextHolder.get().tenantId).toBeNull();
  });

  it('exposes the value inside run', () => {
    TenantContextHolder.run(
      { tenantId: 't1', userId: 'u1', roleIds: [], permissions: [], isPlatform: false },
      () => {
        expect(TenantContextHolder.requireTenantId()).toBe('t1');
      },
    );
  });

  it('propagates across awaits', async () => {
    await TenantContextHolder.run(
      { tenantId: 't2', userId: null, roleIds: [], permissions: [], isPlatform: false },
      async () => {
        await new Promise((r) => setTimeout(r, 1));
        expect(TenantContextHolder.get().tenantId).toBe('t2');
      },
    );
  });
});
```

Run: `npx jest libs/shared-kernel/src/tenant-context.spec.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Implement the three ports**

`libs/shared-kernel/src/ports/clock.port.ts`:
```ts
export interface Clock {
  now(): Date;
}
```

`libs/shared-kernel/src/ports/outbox-publisher.port.ts`:
```ts
import { DomainEvent } from '../domain-event';

export interface OutboxPublisher {
  publish(events: DomainEvent[]): Promise<void>;
}
```

`libs/shared-kernel/src/ports/idempotency-store.port.ts`:
```ts
export interface IdempotencyStore {
  seen(key: string): Promise<boolean>;
  mark(key: string): Promise<void>;
}
```

- [ ] **Step 7: Write the barrel `index.ts`**

`libs/shared-kernel/src/index.ts`:
```ts
export * from './errors';
export * from './ids/domain-id';
export * from './value-objects/money';
export * from './value-objects/email';
export * from './value-objects/percentage';
export * from './value-objects/utc-instant';
export * from './domain-event';
export * from './aggregate-root';
export * from './tenant-context';
export * from './ports/clock.port';
export * from './ports/outbox-publisher.port';
export * from './ports/idempotency-store.port';
```

- [ ] **Step 8: Run the whole shared-kernel suite**

Run: `npx jest libs/shared-kernel`
Expected: all shared-kernel tests PASS.

- [ ] **Step 9: Commit**

```bash
git add libs/shared-kernel/src
git commit -m "feat(shared-kernel): add domain event, aggregate root, tenant context, ports"
```

---

## Task 3: identity-api library — shared API contracts

**Files:**
- Create: `libs/identity-api/src/dtos.ts`, `libs/identity-api/src/index.ts`
- Test: `libs/identity-api/src/dtos.spec.ts`

- [ ] **Step 1: Write `dtos.ts`**

`libs/identity-api/src/dtos.ts`:
```ts
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequestDto {
  subdomain: string;
  email: string;
  password: string;
}

export interface LoginResponseDto extends TokenPair {
  userId: string;
  tenantId: string;
}

export interface UserProfileDto {
  id: string;
  tenantId: string;
  email: string;
  status: string;
  roleIds: string[];
}

export interface WhiteLabelDto {
  brandColor: string;
  logoUrl: string | null;
  customDomain: string | null;
  featureFlags: Record<string, boolean>;
}

export interface TenantInfoDto {
  id: string;
  subdomain: string;
  name: string;
  status: string;
}

export interface TenantDetailDto extends TenantInfoDto {
  whiteLabel: WhiteLabelDto;
}

export interface RoleDto {
  id: string;
  tenantId: string;
  name: string;
  permissions: string[];
}

export interface MeResponseDto {
  user: UserProfileDto;
  tenant: TenantInfoDto;
  whiteLabel: WhiteLabelDto;
}
```

- [ ] **Step 2: Write the barrel**

`libs/identity-api/src/index.ts`:
```ts
export * from './dtos';
```

- [ ] **Step 3: Write a shape smoke test**

`libs/identity-api/src/dtos.spec.ts`:
```ts
import { MeResponseDto } from './dtos';

describe('identity-api contracts', () => {
  it('shapes compose', () => {
    const me: MeResponseDto = {
      user: { id: 'u', tenantId: 't', email: 'a@b.co', status: 'active', roleIds: [] },
      tenant: { id: 't', subdomain: 'acme', name: 'Acme', status: 'active' },
      whiteLabel: { brandColor: '#000000', logoUrl: null, customDomain: null, featureFlags: {} },
    };
    expect(me.tenant.subdomain).toBe('acme');
  });
});
```

Run: `npx jest libs/identity-api`
Expected: PASS (1 test).

- [ ] **Step 4: Commit**

```bash
git add libs/identity-api/src
git commit -m "feat(identity-api): add shared API contract DTOs"
```

---

## Task 4: Identity domain — value objects, events, Role entity

**Files (all under `apps/tenant-identity/src/domain/`):**
- Create: `value-objects/{status,permission,white-label-config}.ts`, `events/*.event.ts`, `entities/role.entity.ts`
- Test: `value-objects/permission.spec.ts`, `value-objects/white-label-config.spec.ts`, `entities/role.entity.spec.ts`

- [ ] **Step 1: Write `status.ts`**

`apps/tenant-identity/src/domain/value-objects/status.ts`:
```ts
export enum TenantStatus {
  Provisioning = 'provisioning',
  Active = 'active',
  Suspended = 'suspended',
}

export enum UserStatus {
  Invited = 'invited',
  Active = 'active',
  Disabled = 'disabled',
}
```

- [ ] **Step 2: Write failing test then implement `Permission`**

`apps/tenant-identity/src/domain/value-objects/permission.spec.ts`:
```ts
import { Permission } from './permission';

describe('Permission', () => {
  it('builds from resource and action', () => {
    expect(Permission.of('user', 'invite').toString()).toBe('user:invite');
  });
  it('parses a string', () => {
    const p = Permission.parse('tenant:read');
    expect(p.resource).toBe('tenant');
    expect(p.action).toBe('read');
  });
  it('rejects malformed strings', () => {
    expect(() => Permission.parse('tenantread')).toThrow('Invalid permission');
  });
  it('supports equality', () => {
    expect(Permission.of('a', 'b').equals(Permission.parse('a:b'))).toBe(true);
  });
});
```

Run: `npx jest apps/tenant-identity/src/domain/value-objects/permission.spec.ts`
Expected: FAIL with `Cannot find module './permission'`.

`apps/tenant-identity/src/domain/value-objects/permission.ts`:
```ts
export class Permission {
  private constructor(public readonly resource: string, public readonly action: string) {}

  static of(resource: string, action: string): Permission {
    if (!resource || !action) throw new Error('Permission requires resource and action');
    return new Permission(resource, action);
  }

  static parse(value: string): Permission {
    const [resource, action] = value.split(':');
    if (!resource || !action) throw new Error(`Invalid permission string: ${value}`);
    return new Permission(resource, action);
  }

  toString(): string {
    return `${this.resource}:${this.action}`;
  }

  equals(other: Permission): boolean {
    return this.resource === other.resource && this.action === other.action;
  }
}
```

Run: `npx jest apps/tenant-identity/src/domain/value-objects/permission.spec.ts`
Expected: PASS (4 tests).

- [ ] **Step 3: Write failing test then implement `WhiteLabelConfig`**

`apps/tenant-identity/src/domain/value-objects/white-label-config.spec.ts`:
```ts
import { WhiteLabelConfig } from './white-label-config';

describe('WhiteLabelConfig', () => {
  it('creates with a valid hex color', () => {
    const c = WhiteLabelConfig.create({
      brandColor: '#00ff00',
      logoUrl: null,
      customDomain: null,
      featureFlags: { beta: true },
    });
    expect(c.brandColor).toBe('#00ff00');
    expect(c.featureFlags).toEqual({ beta: true });
  });

  it('rejects invalid colors', () => {
    expect(() =>
      WhiteLabelConfig.create({ brandColor: 'red', logoUrl: null, customDomain: null, featureFlags: {} }),
    ).toThrow('brandColor');
  });

  it('default config is black with no flags', () => {
    const d = WhiteLabelConfig.default();
    expect(d.brandColor).toBe('#000000');
    expect(d.featureFlags).toEqual({});
  });

  it('defensively copies feature flags', () => {
    const flags = { a: true };
    const c = WhiteLabelConfig.create({ brandColor: '#000000', logoUrl: null, customDomain: null, featureFlags: flags });
    flags.a = false;
    expect(c.featureFlags.a).toBe(true);
  });
});
```

Run: `npx jest apps/tenant-identity/src/domain/value-objects/white-label-config.spec.ts`
Expected: FAIL.

`apps/tenant-identity/src/domain/value-objects/white-label-config.ts`:
```ts
export interface WhiteLabelProps {
  brandColor: string;
  logoUrl: string | null;
  customDomain: string | null;
  featureFlags: Record<string, boolean>;
}

export class WhiteLabelConfig {
  private constructor(private readonly props: WhiteLabelProps) {}

  static create(props: WhiteLabelProps): WhiteLabelConfig {
    if (!/^#[0-9a-fA-F]{6}$/.test(props.brandColor)) {
      throw new Error('brandColor must be a #RRGGBB hex value');
    }
    return new WhiteLabelConfig({ ...props, featureFlags: { ...props.featureFlags } });
  }

  static default(): WhiteLabelConfig {
    return WhiteLabelConfig.create({ brandColor: '#000000', logoUrl: null, customDomain: null, featureFlags: {} });
  }

  get brandColor(): string {
    return this.props.brandColor;
  }

  get logoUrl(): string | null {
    return this.props.logoUrl;
  }

  get customDomain(): string | null {
    return this.props.customDomain;
  }

  get featureFlags(): Record<string, boolean> {
    return { ...this.props.featureFlags };
  }

  equals(other: WhiteLabelConfig): boolean {
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
```

Run: `npx jest apps/tenant-identity/src/domain/value-objects/white-label-config.spec.ts`
Expected: PASS (4 tests).

- [ ] **Step 4: Write the four domain events**

`apps/tenant-identity/src/domain/events/tenant-provisioned.event.ts`:
```ts
import { DomainEvent } from '@daos/shared-kernel';

export class TenantProvisioned extends DomainEvent {
  get eventType(): string {
    return 'identity.tenant.provisioned.v1';
  }

  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly subdomain: string,
    public readonly name: string,
  ) {
    super(aggregateId, tenantId);
  }
}
```

`apps/tenant-identity/src/domain/events/user-onboarded.event.ts`:
```ts
import { DomainEvent } from '@daos/shared-kernel';

export class UserOnboarded extends DomainEvent {
  get eventType(): string {
    return 'identity.user.onboarded.v1';
  }

  constructor(aggregateId: string, tenantId: string, public readonly email: string) {
    super(aggregateId, tenantId);
  }
}
```

`apps/tenant-identity/src/domain/events/role-assigned.event.ts`:
```ts
import { DomainEvent } from '@daos/shared-kernel';

export class RoleAssigned extends DomainEvent {
  get eventType(): string {
    return 'identity.user.role-assigned.v1';
  }

  constructor(aggregateId: string, tenantId: string, public readonly roleId: string) {
    super(aggregateId, tenantId);
  }
}
```

`apps/tenant-identity/src/domain/events/role-revoked.event.ts`:
```ts
import { DomainEvent } from '@daos/shared-kernel';

export class RoleRevoked extends DomainEvent {
  get eventType(): string {
    return 'identity.user.role-revoked.v1';
  }

  constructor(aggregateId: string, tenantId: string, public readonly roleId: string) {
    super(aggregateId, tenantId);
  }
}
```

- [ ] **Step 5: Write failing test then implement `Role` entity**

`apps/tenant-identity/src/domain/entities/role.entity.spec.ts`:
```ts
import { Role } from './role.entity';
import { Permission } from '../value-objects/permission';
import { TenantId } from '@daos/shared-kernel';

describe('Role', () => {
  const tenantId = TenantId.create();

  it('creates with permissions', () => {
    const role = Role.create({ tenantId, name: 'admin', permissions: [Permission.of('user', 'invite')] });
    expect(role.name).toBe('admin');
    expect(role.hasPermission(Permission.parse('user:invite'))).toBe(true);
    expect(role.hasPermission(Permission.parse('user:delete'))).toBe(false);
  });

  it('rejects empty names', () => {
    expect(() => Role.create({ tenantId, name: '   ', permissions: [] })).toThrow('Role name');
  });
});
```

Run: `npx jest apps/tenant-identity/src/domain/entities/role.entity.spec.ts`
Expected: FAIL.

`apps/tenant-identity/src/domain/entities/role.entity.ts`:
```ts
import { RoleId, TenantId } from '@daos/shared-kernel';
import { Permission } from '../value-objects/permission';

export class Role {
  constructor(
    public readonly id: RoleId,
    public readonly tenantId: TenantId,
    public readonly name: string,
    private readonly permissions: Permission[],
  ) {}

  static create(params: { tenantId: TenantId; name: string; permissions: Permission[] }): Role {
    if (!params.name.trim()) throw new Error('Role name is required');
    return new Role(RoleId.create(), params.tenantId, params.name.trim(), [...params.permissions]);
  }

  static reconstruct(params: { id: RoleId; tenantId: TenantId; name: string; permissions: Permission[] }): Role {
    return new Role(params.id, params.tenantId, params.name, [...params.permissions]);
  }

  hasPermission(permission: Permission): boolean {
    return this.permissions.some((p) => p.equals(permission));
  }

  get permissionList(): Permission[] {
    return [...this.permissions];
  }
}
```

Run: `npx jest apps/tenant-identity/src/domain/entities/role.entity.spec.ts`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add apps/tenant-identity/src/domain
git commit -m "feat(identity): add domain value objects, events, and Role entity"
```

---

## Task 5: Identity domain — Tenant and User aggregates

**Files:**
- Create: `apps/tenant-identity/src/domain/aggregates/{tenant,user}.aggregate.ts`
- Test: `aggregates/tenant.aggregate.spec.ts`, `aggregates/user.aggregate.spec.ts`

- [ ] **Step 1: Write the failing Tenant test**

`apps/tenant-identity/src/domain/aggregates/tenant.aggregate.spec.ts`:
```ts
import { Tenant } from './tenant.aggregate';
import { TenantStatus } from '../value-objects/status';
import { WhiteLabelConfig } from '../value-objects/white-label-config';
import { TenantProvisioned } from '../events/tenant-provisioned.event';

describe('Tenant aggregate', () => {
  it('provisions in provisioning state and raises TenantProvisioned', () => {
    const tenant = Tenant.provision({ subdomain: 'Acme', name: 'Acme Corp' });
    expect(tenant.subdomain).toBe('acme');
    expect(tenant.status).toBe(TenantStatus.Provisioning);
    const events = tenant.pullEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(TenantProvisioned);
  });

  it('rejects invalid subdomains', () => {
    expect(() => Tenant.provision({ subdomain: 'a', name: 'x' })).toThrow('Invalid subdomain');
    expect(() => Tenant.provision({ subdomain: 'Bad_Chars!', name: 'x' })).toThrow('Invalid subdomain');
  });

  it('activates then suspends', () => {
    const tenant = Tenant.provision({ subdomain: 'acme', name: 'Acme' });
    tenant.activate();
    expect(tenant.status).toBe(TenantStatus.Active);
    tenant.suspend();
    expect(tenant.status).toBe(TenantStatus.Suspended);
  });

  it('cannot suspend a provisioning tenant', () => {
    const tenant = Tenant.provision({ subdomain: 'acme', name: 'Acme' });
    expect(() => tenant.suspend()).toThrow('Only active tenants');
  });

  it('only updates white-label while active', () => {
    const tenant = Tenant.provision({ subdomain: 'acme', name: 'Acme' });
    const config = WhiteLabelConfig.create({
      brandColor: '#112233',
      logoUrl: null,
      customDomain: null,
      featureFlags: {},
    });
    expect(() => tenant.updateWhiteLabel(config)).toThrow('only be updated while active');
    tenant.activate();
    tenant.updateWhiteLabel(config);
    expect(tenant.whiteLabel.brandColor).toBe('#112233');
  });
});
```

Run: `npx jest apps/tenant-identity/src/domain/aggregates/tenant.aggregate.spec.ts`
Expected: FAIL with `Cannot find module './tenant.aggregate'`.

- [ ] **Step 2: Implement Tenant**

`apps/tenant-identity/src/domain/aggregates/tenant.aggregate.ts`:
```ts
import { AggregateRoot, TenantId } from '@daos/shared-kernel';
import { TenantStatus } from '../value-objects/status';
import { WhiteLabelConfig } from '../value-objects/white-label-config';
import { TenantProvisioned } from '../events/tenant-provisioned.event';

export class Tenant extends AggregateRoot {
  private constructor(
    public readonly id: TenantId,
    public readonly subdomain: string,
    private _name: string,
    private _status: TenantStatus,
    private _whiteLabel: WhiteLabelConfig,
  ) {
    super();
  }

  static provision(params: { subdomain: string; name: string }): Tenant {
    const subdomain = params.subdomain.trim().toLowerCase();
    if (!/^[a-z0-9-]{3,63}$/.test(subdomain)) {
      throw new Error(`Invalid subdomain: ${params.subdomain}`);
    }
    if (!params.name.trim()) throw new Error('Tenant name is required');
    const tenant = new Tenant(
      TenantId.create(),
      subdomain,
      params.name.trim(),
      TenantStatus.Provisioning,
      WhiteLabelConfig.default(),
    );
    tenant.raise(new TenantProvisioned(tenant.id.value, tenant.id.value, subdomain, tenant.name));
    return tenant;
  }

  static reconstruct(params: {
    id: TenantId;
    subdomain: string;
    name: string;
    status: TenantStatus;
    whiteLabel: WhiteLabelConfig;
    version: number;
  }): Tenant {
    const tenant = new Tenant(params.id, params.subdomain, params.name, params.status, params.whiteLabel);
    tenant._version = params.version;
    return tenant;
  }

  get name(): string {
    return this._name;
  }

  get status(): TenantStatus {
    return this._status;
  }

  get whiteLabel(): WhiteLabelConfig {
    return this._whiteLabel;
  }

  activate(): void {
    if (this._status !== TenantStatus.Provisioning) {
      throw new Error('Only provisioning tenants can be activated');
    }
    this._status = TenantStatus.Active;
    this.incrementVersion();
  }

  suspend(): void {
    if (this._status !== TenantStatus.Active) {
      throw new Error('Only active tenants can be suspended');
    }
    this._status = TenantStatus.Suspended;
    this.incrementVersion();
  }

  updateWhiteLabel(config: WhiteLabelConfig): void {
    if (this._status !== TenantStatus.Active) {
      throw new Error('White-label config can only be updated while active');
    }
    this._whiteLabel = config;
    this.incrementVersion();
  }
}
```

Run: `npx jest apps/tenant-identity/src/domain/aggregates/tenant.aggregate.spec.ts`
Expected: PASS (5 tests).

- [ ] **Step 3: Write the failing User test**

`apps/tenant-identity/src/domain/aggregates/user.aggregate.spec.ts`:
```ts
import { User } from './user.aggregate';
import { UserStatus } from '../value-objects/status';
import { Email, TenantId, RoleId } from '@daos/shared-kernel';
import { UserOnboarded } from '../events/user-onboarded.event';
import { RoleAssigned } from '../events/role-assigned.event';
import { RoleRevoked } from '../events/role-revoked.event';

describe('User aggregate', () => {
  const tenantId = TenantId.create();
  const onboard = (roleIds: RoleId[] = [RoleId.create()]) =>
    User.onboard({ tenantId, email: Email.create('a@b.co'), passwordHash: 'hash', roleIds });

  it('onboards active and raises UserOnboarded', () => {
    const user = onboard();
    expect(user.status).toBe(UserStatus.Active);
    const events = user.pullEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(UserOnboarded);
  });

  it('requires at least one role', () => {
    expect(() => onboard([])).toThrow('at least one role');
  });

  it('assigns idempotently and revokes with events', () => {
    const roleId = RoleId.create();
    const user = onboard();
    user.assignRole(roleId);
    expect(user.hasRole(roleId)).toBe(true);
    expect(user.pullEvents()[0]).toBeInstanceOf(RoleAssigned);

    user.assignRole(roleId); // idempotent, no duplicate event
    expect(user.pullEvents()).toHaveLength(0);

    user.revokeRole(roleId);
    expect(user.hasRole(roleId)).toBe(false);
    expect(user.pullEvents()[0]).toBeInstanceOf(RoleRevoked);
  });

  it('rejects revoking a missing role', () => {
    const user = onboard();
    expect(() => user.revokeRole(RoleId.create())).toThrow('does not have role');
  });

  it('keeps at least one role when revoking', () => {
    const only = RoleId.create();
    const user = onboard([only]);
    expect(() => user.revokeRole(only)).toThrow('at least one role');
  });

  it('disables once', () => {
    const user = onboard();
    user.disable();
    expect(user.status).toBe(UserStatus.Disabled);
    expect(() => user.disable()).toThrow('Already disabled');
  });
});
```

Run: `npx jest apps/tenant-identity/src/domain/aggregates/user.aggregate.spec.ts`
Expected: FAIL.

- [ ] **Step 4: Implement User**

`apps/tenant-identity/src/domain/aggregates/user.aggregate.ts`:
```ts
import { AggregateRoot, Email, TenantId, UserId, RoleId } from '@daos/shared-kernel';
import { UserStatus } from '../value-objects/status';
import { UserOnboarded } from '../events/user-onboarded.event';
import { RoleAssigned } from '../events/role-assigned.event';
import { RoleRevoked } from '../events/role-revoked.event';

export class User extends AggregateRoot {
  private constructor(
    public readonly id: UserId,
    public readonly tenantId: TenantId,
    public readonly email: Email,
    private _status: UserStatus,
    private _passwordHash: string,
    private _roleIds: RoleId[],
  ) {
    super();
  }

  static onboard(params: { tenantId: TenantId; email: Email; passwordHash: string; roleIds: RoleId[] }): User {
    if (params.roleIds.length === 0) throw new Error('User must have at least one role');
    const user = new User(
      UserId.create(),
      params.tenantId,
      params.email,
      UserStatus.Active,
      params.passwordHash,
      [...params.roleIds],
    );
    user.raise(new UserOnboarded(user.id.value, user.tenantId.value, user.email.value));
    return user;
  }

  static reconstruct(params: {
    id: UserId;
    tenantId: TenantId;
    email: Email;
    status: UserStatus;
    passwordHash: string;
    roleIds: RoleId[];
    version: number;
  }): User {
    const user = new User(
      params.id,
      params.tenantId,
      params.email,
      params.status,
      params.passwordHash,
      [...params.roleIds],
    );
    user._version = params.version;
    return user;
  }

  get status(): UserStatus {
    return this._status;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get roleIds(): RoleId[] {
    return [...this._roleIds];
  }

  hasRole(roleId: RoleId): boolean {
    return this._roleIds.some((r) => r.equals(roleId));
  }

  assignRole(roleId: RoleId): void {
    if (this.hasRole(roleId)) return;
    this._roleIds.push(roleId);
    this.raise(new RoleAssigned(this.id.value, this.tenantId.value, roleId.value));
    this.incrementVersion();
  }

  revokeRole(roleId: RoleId): void {
    if (!this.hasRole(roleId)) throw new Error('User does not have role');
    if (this._roleIds.length === 1) throw new Error('User must have at least one role');
    this._roleIds = this._roleIds.filter((r) => !r.equals(roleId));
    this.raise(new RoleRevoked(this.id.value, this.tenantId.value, roleId.value));
    this.incrementVersion();
  }

  disable(): void {
    if (this._status === UserStatus.Disabled) throw new Error('Already disabled');
    this._status = UserStatus.Disabled;
    this.incrementVersion();
  }
}
```

Run: `npx jest apps/tenant-identity/src/domain/aggregates/user.aggregate.spec.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/tenant-identity/src/domain
git commit -m "feat(identity): add Tenant and User aggregates"
```

---

## Task 6: Identity domain — services, repository ports, identity provider port

**Files:**
- Create: `domain/services/{default-roles,rbac-evaluator,tenant-provisioning.service}.ts`
- Create: `domain/repositories/{repository.tokens,tenant.repository,user.repository,role.repository}.ts`
- Create: `domain/ports/identity-provider.port.ts`
- Test: `services/rbac-evaluator.spec.ts`, `services/tenant-provisioning.service.spec.ts`

- [ ] **Step 1: Implement `default-roles.ts`**

`apps/tenant-identity/src/domain/services/default-roles.ts`:
```ts
import { TenantId } from '@daos/shared-kernel';
import { Role } from '../entities/role.entity';
import { Permission } from '../value-objects/permission';

export const ROLE_NAMES = {
  tenantAdmin: 'tenant-admin',
  member: 'member',
  complianceOfficer: 'compliance-officer',
  platformAdmin: 'platform-admin',
} as const;

export function createDefaultRoles(tenantId: TenantId): Role[] {
  return [
    Role.create({
      tenantId,
      name: ROLE_NAMES.tenantAdmin,
      permissions: [
        Permission.parse('tenant:read'),
        Permission.parse('tenant:update'),
        Permission.parse('user:read'),
        Permission.parse('user:invite'),
        Permission.parse('user:update'),
        Permission.parse('user:assign-role'),
        Permission.parse('role:read'),
      ],
    }),
    Role.create({
      tenantId,
      name: ROLE_NAMES.member,
      permissions: [Permission.parse('tenant:read'), Permission.parse('user:read'), Permission.parse('role:read')],
    }),
    Role.create({
      tenantId,
      name: ROLE_NAMES.complianceOfficer,
      permissions: [
        Permission.parse('tenant:read'),
        Permission.parse('user:read'),
        Permission.parse('role:read'),
        Permission.parse('compliance:read'),
      ],
    }),
  ];
}
```

- [ ] **Step 2: Write failing test then implement `RbacEvaluator`**

`apps/tenant-identity/src/domain/services/rbac-evaluator.spec.ts`:
```ts
import { RbacEvaluator } from './rbac-evaluator';
import { User } from '../aggregates/user.aggregate';
import { Role } from '../entities/role.entity';
import { Permission } from '../value-objects/permission';
import { Email, TenantId } from '@daos/shared-kernel';

describe('RbacEvaluator', () => {
  const tenantId = TenantId.create();
  const inviteRole = Role.create({ tenantId, name: 'inviter', permissions: [Permission.parse('user:invite')] });
  const user = User.onboard({
    tenantId,
    email: Email.create('a@b.co'),
    passwordHash: 'h',
    roleIds: [inviteRole.id],
  });
  const evaluator = new RbacEvaluator();

  it('grants a permission held via a role', () => {
    expect(evaluator.hasPermission(user, [inviteRole], Permission.parse('user:invite'))).toBe(true);
  });

  it('denies a permission not held', () => {
    expect(evaluator.hasPermission(user, [inviteRole], Permission.parse('user:update'))).toBe(false);
  });

  it('denies when none of the provided roles belong to the user', () => {
    const other = Role.create({ tenantId, name: 'other', permissions: [Permission.parse('user:invite')] });
    expect(evaluator.hasPermission(user, [other], Permission.parse('user:invite'))).toBe(false);
  });
});
```

Run: `npx jest apps/tenant-identity/src/domain/services/rbac-evaluator.spec.ts`
Expected: FAIL.

`apps/tenant-identity/src/domain/services/rbac-evaluator.ts`:
```ts
import { Role } from '../entities/role.entity';
import { User } from '../aggregates/user.aggregate';
import { Permission } from '../value-objects/permission';

export class RbacEvaluator {
  hasPermission(user: User, roles: Role[], permission: Permission): boolean {
    const userRoles = roles.filter((role) => user.roleIds.some((id) => id.equals(role.id)));
    return userRoles.some((role) => role.hasPermission(permission));
  }
}
```

Run: `npx jest apps/tenant-identity/src/domain/services/rbac-evaluator.spec.ts`
Expected: PASS (3 tests).

- [ ] **Step 3: Write failing test then implement `TenantProvisioningService`**

`apps/tenant-identity/src/domain/services/tenant-provisioning.service.spec.ts`:
```ts
import { TenantProvisioningService } from './tenant-provisioning.service';
import { ROLE_NAMES } from './default-roles';
import { Email } from '@daos/shared-kernel';
import { TenantProvisioned } from '../events/tenant-provisioned.event';
import { UserOnboarded } from '../events/user-onboarded.event';

describe('TenantProvisioningService', () => {
  const service = new TenantProvisioningService();
  const params = {
    subdomain: 'acme',
    name: 'Acme',
    adminEmail: Email.create('boss@acme.test'),
    adminPasswordHash: 'hashed',
  };

  it('creates tenant, default roles, and an admin user with the admin role', () => {
    const result = service.provision(params);
    expect(result.tenant.subdomain).toBe('acme');
    expect(result.roles.map((r) => r.name)).toEqual(
      expect.arrayContaining([ROLE_NAMES.tenantAdmin, ROLE_NAMES.member, ROLE_NAMES.complianceOfficer]),
    );
    const adminRole = result.roles.find((r) => r.name === ROLE_NAMES.tenantAdmin);
    expect(result.admin.hasRole(adminRole!.id)).toBe(true);
  });

  it('raises provisioning and onboarding events', () => {
    const result = service.provision(params);
    expect(result.tenant.pullEvents()[0]).toBeInstanceOf(TenantProvisioned);
    expect(result.admin.pullEvents()[0]).toBeInstanceOf(UserOnboarded);
  });
});
```

Run: `npx jest apps/tenant-identity/src/domain/services/tenant-provisioning.service.spec.ts`
Expected: FAIL.

`apps/tenant-identity/src/domain/services/tenant-provisioning.service.ts`:
```ts
import { Email } from '@daos/shared-kernel';
import { Tenant } from '../aggregates/tenant.aggregate';
import { User } from '../aggregates/user.aggregate';
import { Role } from '../entities/role.entity';
import { createDefaultRoles, ROLE_NAMES } from './default-roles';

export interface ProvisionResult {
  tenant: Tenant;
  admin: User;
  roles: Role[];
}

export class TenantProvisioningService {
  provision(params: {
    subdomain: string;
    name: string;
    adminEmail: Email;
    adminPasswordHash: string;
  }): ProvisionResult {
    const tenant = Tenant.provision({ subdomain: params.subdomain, name: params.name });
    const roles = createDefaultRoles(tenant.id);
    const adminRole = roles.find((r) => r.name === ROLE_NAMES.tenantAdmin);
    if (!adminRole) throw new Error('tenant-admin role is missing from defaults');
    const admin = User.onboard({
      tenantId: tenant.id,
      email: params.adminEmail,
      passwordHash: params.adminPasswordHash,
      roleIds: [adminRole.id],
    });
    return { tenant, admin, roles };
  }
}
```

Run: `npx jest apps/tenant-identity/src/domain/services/tenant-provisioning.service.spec.ts`
Expected: PASS (2 tests).

- [ ] **Step 4: Implement DI tokens + repository ports**

`apps/tenant-identity/src/domain/repositories/repository.tokens.ts`:
```ts
export const TENANT_REPOSITORY = 'TENANT_REPOSITORY';
export const USER_REPOSITORY = 'USER_REPOSITORY';
export const ROLE_REPOSITORY = 'ROLE_REPOSITORY';
export const IDENTITY_PROVIDER = 'IDENTITY_PROVIDER';
export const OUTBOX_PUBLISHER = 'OUTBOX_PUBLISHER';
export const CLOCK = 'CLOCK';
export const IDEMPOTENCY_STORE = 'IDEMPOTENCY_STORE';
```

`apps/tenant-identity/src/domain/repositories/tenant.repository.ts`:
```ts
import { TenantId } from '@daos/shared-kernel';
import { Tenant } from '../aggregates/tenant.aggregate';

export interface TenantRepository {
  save(tenant: Tenant): Promise<void>;
  findById(id: TenantId): Promise<Tenant | null>;
  findBySubdomain(subdomain: string): Promise<Tenant | null>;
}
```

`apps/tenant-identity/src/domain/repositories/user.repository.ts`:
```ts
import { TenantId, UserId, Email, RoleId } from '@daos/shared-kernel';
import { User } from '../aggregates/user.aggregate';

export interface UserRepository {
  save(user: User): Promise<void>;
  findById(tenantId: TenantId, id: UserId): Promise<User | null>;
  findByEmail(tenantId: TenantId, email: Email): Promise<User | null>;
  findAll(tenantId: TenantId): Promise<User[]>;
  countActiveWithRole(tenantId: TenantId, roleId: RoleId): Promise<number>;
}
```

`apps/tenant-identity/src/domain/repositories/role.repository.ts`:
```ts
import { TenantId, RoleId } from '@daos/shared-kernel';
import { Role } from '../entities/role.entity';

export interface RoleRepository {
  save(role: Role): Promise<void>;
  saveAll(roles: Role[]): Promise<void>;
  findById(tenantId: TenantId, id: RoleId): Promise<Role | null>;
  findAll(tenantId: TenantId): Promise<Role[]>;
  findByName(tenantId: TenantId, name: string): Promise<Role | null>;
}
```

- [ ] **Step 5: Implement the IdentityProvider port**

`apps/tenant-identity/src/domain/ports/identity-provider.port.ts`:
```ts
export interface AccessTokenClaims {
  sub: string;
  tenantId: string;
  roleIds: string[];
  platform: boolean;
  type: 'access';
  jti: string;
}

export interface RefreshTokenClaims {
  sub: string;
  tenantId: string;
  type: 'refresh';
  jti: string;
}

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IdentityProvider {
  hashPassword(plain: string): Promise<string>;
  verifyPassword(plain: string, hash: string): Promise<boolean>;
  issueTokens(input: { userId: string; tenantId: string; roleIds: string[]; platform: boolean }): IssuedTokens;
  verifyAccessToken(token: string): AccessTokenClaims | null;
  verifyRefreshToken(token: string): RefreshTokenClaims | null;
}
```

- [ ] **Step 6: Run the full domain suite**

Run: `npx jest apps/tenant-identity/src/domain`
Expected: all identity domain tests PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/tenant-identity/src/domain
git commit -m "feat(identity): add domain services, repository ports, identity provider port"
```

---

## Task 7: Infrastructure — in-memory repositories, clock, idempotency store

**Files:**
- Create: `apps/tenant-identity/src/infrastructure/persistence/{in-memory-tenant,in-memory-user,in-memory-role}.repository.ts`, `infrastructure/clock/system-clock.ts`, `infrastructure/idempotency/in-memory-idempotency.store.ts`
- Test: `infrastructure/persistence/in-memory-repositories.spec.ts`

- [ ] **Step 1: Implement the in-memory repositories**

`apps/tenant-identity/src/infrastructure/persistence/in-memory-tenant.repository.ts`:
```ts
import { Injectable } from '@nestjs/common';
import { TenantId } from '@daos/shared-kernel';
import { Tenant } from '../../domain/aggregates/tenant.aggregate';
import { TenantRepository } from '../../domain/repositories/tenant.repository';

@Injectable()
export class InMemoryTenantRepository implements TenantRepository {
  private readonly store = new Map<string, Tenant>();

  async save(tenant: Tenant): Promise<void> {
    this.store.set(tenant.id.value, tenant);
  }

  async findById(id: TenantId): Promise<Tenant | null> {
    return this.store.get(id.value) ?? null;
  }

  async findBySubdomain(subdomain: string): Promise<Tenant | null> {
    for (const tenant of this.store.values()) {
      if (tenant.subdomain === subdomain) return tenant;
    }
    return null;
  }
}
```

`apps/tenant-identity/src/infrastructure/persistence/in-memory-user.repository.ts`:
```ts
import { Injectable } from '@nestjs/common';
import { TenantId, UserId, Email, RoleId } from '@daos/shared-kernel';
import { User } from '../../domain/aggregates/user.aggregate';
import { UserStatus } from '../../domain/value-objects/status';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  private readonly store = new Map<string, User>();

  async save(user: User): Promise<void> {
    this.store.set(user.id.value, user);
  }

  async findById(tenantId: TenantId, id: UserId): Promise<User | null> {
    const user = this.store.get(id.value);
    return user && user.tenantId.equals(tenantId) ? user : null;
  }

  async findByEmail(tenantId: TenantId, email: Email): Promise<User | null> {
    for (const user of this.store.values()) {
      if (user.tenantId.equals(tenantId) && user.email.equals(email)) return user;
    }
    return null;
  }

  async findAll(tenantId: TenantId): Promise<User[]> {
    return [...this.store.values()].filter((user) => user.tenantId.equals(tenantId));
  }

  async countActiveWithRole(tenantId: TenantId, roleId: RoleId): Promise<number> {
    const users = await this.findAll(tenantId);
    return users.filter((user) => user.status === UserStatus.Active && user.hasRole(roleId)).length;
  }
}
```

`apps/tenant-identity/src/infrastructure/persistence/in-memory-role.repository.ts`:
```ts
import { Injectable } from '@nestjs/common';
import { TenantId, RoleId } from '@daos/shared-kernel';
import { Role } from '../../domain/entities/role.entity';
import { RoleRepository } from '../../domain/repositories/role.repository';

@Injectable()
export class InMemoryRoleRepository implements RoleRepository {
  private readonly store = new Map<string, Role>();

  async save(role: Role): Promise<void> {
    this.store.set(role.id.value, role);
  }

  async saveAll(roles: Role[]): Promise<void> {
    for (const role of roles) await this.save(role);
  }

  async findById(tenantId: TenantId, id: RoleId): Promise<Role | null> {
    const role = this.store.get(id.value);
    return role && role.tenantId.equals(tenantId) ? role : null;
  }

  async findAll(tenantId: TenantId): Promise<Role[]> {
    return [...this.store.values()].filter((role) => role.tenantId.equals(tenantId));
  }

  async findByName(tenantId: TenantId, name: string): Promise<Role | null> {
    const roles = await this.findAll(tenantId);
    return roles.find((role) => role.name === name) ?? null;
  }
}
```

- [ ] **Step 2: Implement clock + idempotency adapters**

`apps/tenant-identity/src/infrastructure/clock/system-clock.ts`:
```ts
import { Injectable } from '@nestjs/common';
import { Clock } from '@daos/shared-kernel';

@Injectable()
export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
```

`apps/tenant-identity/src/infrastructure/idempotency/in-memory-idempotency.store.ts`:
```ts
import { Injectable } from '@nestjs/common';
import { IdempotencyStore } from '@daos/shared-kernel';

@Injectable()
export class InMemoryIdempotencyStore implements IdempotencyStore {
  private readonly seenKeys = new Set<string>();

  async seen(key: string): Promise<boolean> {
    return this.seenKeys.has(key);
  }

  async mark(key: string): Promise<void> {
    this.seenKeys.add(key);
  }
}
```

- [ ] **Step 3: Write the tenant-scoping test**

`apps/tenant-identity/src/infrastructure/persistence/in-memory-repositories.spec.ts`:
```ts
import { InMemoryUserRepository } from './in-memory-user.repository';
import { InMemoryRoleRepository } from './in-memory-role.repository';
import { User } from '../../domain/aggregates/user.aggregate';
import { Role } from '../../domain/entities/role.entity';
import { Permission } from '../../domain/value-objects/permission';
import { Email, TenantId, RoleId } from '@daos/shared-kernel';

describe('In-memory repositories (tenant scoping)', () => {
  it('isolates users by tenant', async () => {
    const repo = new InMemoryUserRepository();
    const t1 = TenantId.create();
    const t2 = TenantId.create();
    const user = User.onboard({
      tenantId: t1,
      email: Email.create('a@b.co'),
      passwordHash: 'h',
      roleIds: [RoleId.create()],
    });
    await repo.save(user);

    expect(await repo.findById(t1, user.id)).not.toBeNull();
    expect(await repo.findById(t2, user.id)).toBeNull();
    expect(await repo.findByEmail(t2, Email.create('a@b.co'))).toBeNull();
  });

  it('counts only active users holding the role', async () => {
    const repo = new InMemoryUserRepository();
    const t1 = TenantId.create();
    const role = RoleId.create();
    const u1 = User.onboard({ tenantId: t1, email: Email.create('a@b.co'), passwordHash: 'h', roleIds: [role] });
    const u2 = User.onboard({ tenantId: t1, email: Email.create('c@b.co'), passwordHash: 'h', roleIds: [role] });
    u2.disable();
    await repo.save(u1);
    await repo.save(u2);
    expect(await repo.countActiveWithRole(t1, role)).toBe(1);
  });

  it('finds roles by name within a tenant only', async () => {
    const repo = new InMemoryRoleRepository();
    const t1 = TenantId.create();
    const role = Role.create({ tenantId: t1, name: 'member', permissions: [Permission.parse('tenant:read')] });
    await repo.saveAll([role]);
    expect((await repo.findByName(t1, 'member'))?.id.equals(role.id)).toBe(true);
    expect(await repo.findByName(TenantId.create(), 'member')).toBeNull();
  });
});
```

Run: `npx jest apps/tenant-identity/src/infrastructure/persistence`
Expected: PASS (3 tests).

- [ ] **Step 4: Commit**

```bash
git add apps/tenant-identity/src/infrastructure
git commit -m "feat(identity): add in-memory repositories, clock, idempotency store"
```

---

## Task 8: Infrastructure — JWT/argon2 identity adapter + in-memory outbox

**Files:**
- Create: `infrastructure/auth/jwt-identity.adapter.ts`, `infrastructure/messaging/in-memory-outbox.ts`
- Test: `infrastructure/auth/jwt-identity.adapter.spec.ts`, `infrastructure/messaging/in-memory-outbox.spec.ts`

- [ ] **Step 1: Write the failing test for the identity adapter**

`apps/tenant-identity/src/infrastructure/auth/jwt-identity.adapter.spec.ts`:
```ts
import { ConfigService } from '@nestjs/config';
import { JwtIdentityAdapter } from './jwt-identity.adapter';

describe('JwtIdentityAdapter', () => {
  const makeAdapter = (secret: string) => {
    const values: Record<string, string> = {
      JWT_SECRET: secret,
      JWT_ACCESS_TTL_SECONDS: '900',
      JWT_REFRESH_TTL_SECONDS: '604800',
    };
    const config = { get: (key: string) => values[key] } as unknown as ConfigService;
    return new JwtIdentityAdapter(config);
  };
  const adapter = makeAdapter('test-secret');

  it('hashes and verifies passwords', async () => {
    const hash = await adapter.hashPassword('s3cret!');
    expect(await adapter.verifyPassword('s3cret!', hash)).toBe(true);
    expect(await adapter.verifyPassword('wrong', hash)).toBe(false);
  });

  it('issues and verifies access tokens with claims', () => {
    const { accessToken } = adapter.issueTokens({ userId: 'u1', tenantId: 't1', roleIds: ['r1'], platform: false });
    const claims = adapter.verifyAccessToken(accessToken);
    expect(claims?.sub).toBe('u1');
    expect(claims?.tenantId).toBe('t1');
    expect(claims?.roleIds).toEqual(['r1']);
    expect(claims?.platform).toBe(false);
    expect(claims?.type).toBe('access');
    expect(claims?.jti).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('keeps access and refresh token types separate', () => {
    const { refreshToken } = adapter.issueTokens({ userId: 'u1', tenantId: 't1', roleIds: [], platform: false });
    expect(adapter.verifyAccessToken(refreshToken)).toBeNull();
    expect(adapter.verifyRefreshToken(refreshToken)?.type).toBe('refresh');
  });

  it('rejects tokens signed with a different secret', () => {
    const other = makeAdapter('other-secret');
    const { accessToken } = other.issueTokens({ userId: 'u1', tenantId: 't1', roleIds: [], platform: false });
    expect(adapter.verifyAccessToken(accessToken)).toBeNull();
  });
});
```

Run: `npx jest apps/tenant-identity/src/infrastructure/auth`
Expected: FAIL with `Cannot find module './jwt-identity.adapter'`.

- [ ] **Step 2: Implement the adapter**

`apps/tenant-identity/src/infrastructure/auth/jwt-identity.adapter.ts`:
```ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import {
  AccessTokenClaims,
  IdentityProvider,
  IssuedTokens,
  RefreshTokenClaims,
} from '../../domain/ports/identity-provider.port';

@Injectable()
export class JwtIdentityAdapter implements IdentityProvider {
  private readonly secret: string;
  private readonly accessTtlSeconds: number;
  private readonly refreshTtlSeconds: number;

  constructor(config: ConfigService) {
    this.secret = config.get<string>('JWT_SECRET') ?? 'dev-secret-change-me';
    this.accessTtlSeconds = Number(config.get<string>('JWT_ACCESS_TTL_SECONDS') ?? 900);
    this.refreshTtlSeconds = Number(config.get<string>('JWT_REFRESH_TTL_SECONDS') ?? 604800);
  }

  async hashPassword(plain: string): Promise<string> {
    return argon2.hash(plain);
  }

  async verifyPassword(plain: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plain);
    } catch {
      return false;
    }
  }

  issueTokens(input: { userId: string; tenantId: string; roleIds: string[]; platform: boolean }): IssuedTokens {
    const access: AccessTokenClaims = {
      sub: input.userId,
      tenantId: input.tenantId,
      roleIds: input.roleIds,
      platform: input.platform,
      type: 'access',
      jti: randomUUID(),
    };
    const refresh: RefreshTokenClaims = {
      sub: input.userId,
      tenantId: input.tenantId,
      type: 'refresh',
      jti: randomUUID(),
    };
    return {
      accessToken: jwt.sign({ ...access }, this.secret, { expiresIn: this.accessTtlSeconds }),
      refreshToken: jwt.sign({ ...refresh }, this.secret, { expiresIn: this.refreshTtlSeconds }),
    };
  }

  verifyAccessToken(token: string): AccessTokenClaims | null {
    const claims = this.verify(token);
    return claims && claims.type === 'access' ? claims : null;
  }

  verifyRefreshToken(token: string): RefreshTokenClaims | null {
    const claims = this.verify(token);
    return claims && claims.type === 'refresh' ? claims : null;
  }

  private verify(token: string): (AccessTokenClaims | RefreshTokenClaims) | null {
    try {
      const decoded = jwt.verify(token, this.secret) as Record<string, unknown>;
      if (decoded.type === 'access' || decoded.type === 'refresh') {
        return decoded as unknown as AccessTokenClaims | RefreshTokenClaims;
      }
      return null;
    } catch {
      return null;
    }
  }
}
```

Run: `npx jest apps/tenant-identity/src/infrastructure/auth`
Expected: PASS (4 tests).

- [ ] **Step 3: Write failing test then implement the outbox**

`apps/tenant-identity/src/infrastructure/messaging/in-memory-outbox.spec.ts`:
```ts
import { InMemoryOutboxPublisher } from './in-memory-outbox';
import { DomainEvent } from '@daos/shared-kernel';

class TestEvent extends DomainEvent {
  get eventType(): string {
    return 'test.event.v1';
  }
}

describe('InMemoryOutboxPublisher', () => {
  it('records published events and notifies listeners', async () => {
    const outbox = new InMemoryOutboxPublisher();
    const seen: string[] = [];
    outbox.onEvent((event) => {
      seen.push(event.eventId);
    });
    const event = new TestEvent('agg', 'tenant');
    await outbox.publish([event]);
    expect(outbox.getPublished()).toHaveLength(1);
    expect(seen).toEqual([event.eventId]);
  });

  it('supports idempotent listeners keyed by eventId', async () => {
    const outbox = new InMemoryOutboxPublisher();
    const seen = new Set<string>();
    const delivered: string[] = [];
    outbox.onEvent((event) => {
      if (seen.has(event.eventId)) return;
      seen.add(event.eventId);
      delivered.push(event.eventId);
    });
    const event = new TestEvent('agg', 'tenant');
    await outbox.publish([event]);
    await outbox.publish([event]); // redelivery
    expect(delivered).toHaveLength(1);
  });
});
```

Run: `npx jest apps/tenant-identity/src/infrastructure/messaging`
Expected: FAIL.

`apps/tenant-identity/src/infrastructure/messaging/in-memory-outbox.ts`:
```ts
import { Injectable } from '@nestjs/common';
import { DomainEvent, OutboxPublisher } from '@daos/shared-kernel';

export type EventListener = (event: DomainEvent) => Promise<void> | void;

@Injectable()
export class InMemoryOutboxPublisher implements OutboxPublisher {
  private readonly published: DomainEvent[] = [];
  private readonly listeners: EventListener[] = [];

  onEvent(listener: EventListener): void {
    this.listeners.push(listener);
  }

  async publish(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      this.published.push(event);
      for (const listener of this.listeners) {
        await listener(event);
      }
    }
  }

  getPublished(): DomainEvent[] {
    return [...this.published];
  }

  clear(): void {
    this.published.length = 0;
  }
}
```

Run: `npx jest apps/tenant-identity/src/infrastructure/messaging`
Expected: PASS (2 tests).

- [ ] **Step 4: Commit**

```bash
git add apps/tenant-identity/src/infrastructure
git commit -m "feat(identity): add JWT/argon2 identity adapter and in-memory outbox"
```

---

## Task 9: Application — request DTOs

**Files:** Create `application/dto/{provision-tenant,login,refresh,onboard-user,assign-role,update-white-label}.dto.ts`

- [ ] **Step 1: Implement all request DTOs**

`apps/tenant-identity/src/application/dto/provision-tenant.dto.ts`:
```ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class ProvisionTenantDto {
  @ApiProperty({ example: 'acme' })
  @IsString()
  @Matches(/^[a-zA-Z0-9-]{3,63}$/, { message: 'subdomain must be 3-63 chars of a-z, 0-9, -' })
  subdomain!: string;

  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: 'boss@acme.test' })
  @IsEmail()
  adminEmail!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8)
  adminPassword!: string;
}
```

`apps/tenant-identity/src/application/dto/login.dto.ts`:
```ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'acme' })
  @IsString()
  @Matches(/^[a-zA-Z0-9-]{3,63}$/)
  subdomain!: string;

  @ApiProperty({ example: 'boss@acme.test' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password!: string;
}
```

`apps/tenant-identity/src/application/dto/refresh.dto.ts`:
```ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty()
  @IsString()
  refreshToken!: string;
}
```

`apps/tenant-identity/src/application/dto/onboard-user.dto.ts`:
```ts
import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsEmail, IsString, MinLength } from 'class-validator';

export class OnboardUserDto {
  @ApiProperty({ example: 'member@acme.test' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ type: [String], example: ['role-uuid'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  roleIds!: string[];
}
```

`apps/tenant-identity/src/application/dto/assign-role.dto.ts`:
```ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty()
  @IsString()
  roleId!: string;
}
```

`apps/tenant-identity/src/application/dto/update-white-label.dto.ts`:
```ts
import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateWhiteLabelDto {
  @ApiProperty({ example: '#112233' })
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/)
  brandColor!: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  customDomain?: string;

  @ApiProperty({ required: false, example: { beta: true } })
  @IsOptional()
  @IsObject()
  featureFlags?: Record<string, boolean>;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/tenant-identity/src/application/dto
git commit -m "feat(identity): add application request DTOs"
```

---

## Task 10: Application — commands

**Files:** Create `application/commands/{provision-tenant,login,refresh-token,onboard-user,assign-role,revoke-role,suspend-user,update-white-label}.command.ts` (command class + handler in each file)

- [ ] **Step 1: ProvisionTenant**

`apps/tenant-identity/src/application/commands/provision-tenant.command.ts`:
```ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ConflictError, Email, OutboxPublisher, TenantContextHolder } from '@daos/shared-kernel';
import { ProvisionTenantDto } from '../dto/provision-tenant.dto';
import { TenantProvisioningService } from '../../domain/services/tenant-provisioning.service';
import { TenantRepository } from '../../domain/repositories/tenant.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { IdentityProvider } from '../../domain/ports/identity-provider.port';
import {
  IDENTITY_PROVIDER,
  OUTBOX_PUBLISHER,
  ROLE_REPOSITORY,
  TENANT_REPOSITORY,
  USER_REPOSITORY,
} from '../../domain/repositories/repository.tokens';

export class ProvisionTenantCommand {
  constructor(public readonly dto: ProvisionTenantDto) {}
}

@CommandHandler(ProvisionTenantCommand)
export class ProvisionTenantHandler implements ICommandHandler<ProvisionTenantCommand, { tenantId: string }> {
  constructor(
    private readonly provisioning: TenantProvisioningService,
    @Inject(TENANT_REPOSITORY) private readonly tenants: TenantRepository,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
    @Inject(IDENTITY_PROVIDER) private readonly identity: IdentityProvider,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: ProvisionTenantCommand): Promise<{ tenantId: string }> {
    const dto = command.dto;
    if (!TenantContextHolder.get().isPlatform) {
      throw new ConflictError('Tenant provisioning requires the platform context');
    }
    const subdomain = dto.subdomain.toLowerCase();
    if (await this.tenants.findBySubdomain(subdomain)) {
      throw new ConflictError(`Subdomain already in use: ${subdomain}`);
    }

    const adminPasswordHash = await this.identity.hashPassword(dto.adminPassword);
    const { tenant, admin, roles } = this.provisioning.provision({
      subdomain,
      name: dto.name,
      adminEmail: Email.create(dto.adminEmail),
      adminPasswordHash,
    });

    tenant.activate();
    await this.tenants.save(tenant);
    await this.roles.saveAll(roles);
    await this.users.save(admin);

    await this.outbox.publish([...tenant.pullEvents(), ...admin.pullEvents()]);
    return { tenantId: tenant.id.value };
  }
}
```

- [ ] **Step 2: Login**

`apps/tenant-identity/src/application/commands/login.command.ts`:
```ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Email, InvalidCredentialsError } from '@daos/shared-kernel';
import { LoginDto } from '../dto/login.dto';
import { TenantRepository } from '../../domain/repositories/tenant.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { IdentityProvider, IssuedTokens } from '../../domain/ports/identity-provider.port';
import { TenantStatus, UserStatus } from '../../domain/value-objects/status';
import { IDENTITY_PROVIDER, TENANT_REPOSITORY, USER_REPOSITORY } from '../../domain/repositories/repository.tokens';

export class LoginCommand {
  constructor(public readonly dto: LoginDto) {}
}

export interface LoginResult extends IssuedTokens {
  userId: string;
  tenantId: string;
}

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand, LoginResult> {
  constructor(
    @Inject(TENANT_REPOSITORY) private readonly tenants: TenantRepository,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(IDENTITY_PROVIDER) private readonly identity: IdentityProvider,
  ) {}

  async execute(command: LoginCommand): Promise<LoginResult> {
    const dto = command.dto;
    const tenant = await this.tenants.findBySubdomain(dto.subdomain.toLowerCase());
    if (!tenant || tenant.status !== TenantStatus.Active) throw new InvalidCredentialsError();

    const user = await this.users.findByEmail(tenant.id, Email.create(dto.email));
    if (!user || user.status !== UserStatus.Active) throw new InvalidCredentialsError();

    if (!(await this.identity.verifyPassword(dto.password, user.passwordHash))) {
      throw new InvalidCredentialsError();
    }

    const tokens = this.identity.issueTokens({
      userId: user.id.value,
      tenantId: tenant.id.value,
      roleIds: user.roleIds.map((r) => r.value),
      platform: tenant.subdomain === 'platform',
    });
    return { ...tokens, userId: user.id.value, tenantId: tenant.id.value };
  }
}
```

- [ ] **Step 3: RefreshToken**

`apps/tenant-identity/src/application/commands/refresh-token.command.ts`:
```ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { InvalidCredentialsError, TenantId, UserId } from '@daos/shared-kernel';
import { RefreshDto } from '../dto/refresh.dto';
import { IdentityProvider, IssuedTokens } from '../../domain/ports/identity-provider.port';
import { UserRepository } from '../../domain/repositories/user.repository';
import { TenantRepository } from '../../domain/repositories/tenant.repository';
import { UserStatus } from '../../domain/value-objects/status';
import { IDENTITY_PROVIDER, TENANT_REPOSITORY, USER_REPOSITORY } from '../../domain/repositories/repository.tokens';

export class RefreshTokenCommand {
  constructor(public readonly dto: RefreshDto) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand, IssuedTokens> {
  constructor(
    @Inject(IDENTITY_PROVIDER) private readonly identity: IdentityProvider,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(TENANT_REPOSITORY) private readonly tenants: TenantRepository,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<IssuedTokens> {
    const claims = this.identity.verifyRefreshToken(command.dto.refreshToken);
    if (!claims) throw new InvalidCredentialsError('Invalid refresh token');

    const tenantId = TenantId.create(claims.tenantId);
    const user = await this.users.findById(tenantId, UserId.create(claims.sub));
    if (!user || user.status !== UserStatus.Active) throw new InvalidCredentialsError();

    const tenant = await this.tenants.findById(tenantId);
    return this.identity.issueTokens({
      userId: user.id.value,
      tenantId: tenantId.value,
      roleIds: user.roleIds.map((r) => r.value),
      platform: tenant?.subdomain === 'platform',
    });
  }
}
```

- [ ] **Step 4: OnboardUser**

`apps/tenant-identity/src/application/commands/onboard-user.command.ts`:
```ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  ConflictError,
  Email,
  NotFoundError,
  OutboxPublisher,
  RoleId,
  TenantContextHolder,
  TenantId,
} from '@daos/shared-kernel';
import { OnboardUserDto } from '../dto/onboard-user.dto';
import { User } from '../../domain/aggregates/user.aggregate';
import { UserRepository } from '../../domain/repositories/user.repository';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { IdentityProvider } from '../../domain/ports/identity-provider.port';
import {
  IDENTITY_PROVIDER,
  OUTBOX_PUBLISHER,
  ROLE_REPOSITORY,
  USER_REPOSITORY,
} from '../../domain/repositories/repository.tokens';

export class OnboardUserCommand {
  constructor(public readonly dto: OnboardUserDto) {}
}

@CommandHandler(OnboardUserCommand)
export class OnboardUserHandler implements ICommandHandler<OnboardUserCommand, { userId: string }> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
    @Inject(IDENTITY_PROVIDER) private readonly identity: IdentityProvider,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: OnboardUserCommand): Promise<{ userId: string }> {
    const dto = command.dto;
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());

    const email = Email.create(dto.email);
    if (await this.users.findByEmail(tenantId, email)) {
      throw new ConflictError(`User already exists: ${dto.email}`);
    }

    const roleIds: RoleId[] = [];
    for (const raw of dto.roleIds) {
      const roleId = RoleId.create(raw);
      if (!(await this.roles.findById(tenantId, roleId))) {
        throw new NotFoundError(`Role not found: ${raw}`);
      }
      roleIds.push(roleId);
    }

    const passwordHash = await this.identity.hashPassword(dto.password);
    const user = User.onboard({ tenantId, email, passwordHash, roleIds });
    await this.users.save(user);
    await this.outbox.publish(user.pullEvents());
    return { userId: user.id.value };
  }
}
```

- [ ] **Step 5: AssignRole**

`apps/tenant-identity/src/application/commands/assign-role.command.ts`:
```ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { NotFoundError, OutboxPublisher, RoleId, TenantContextHolder, TenantId, UserId } from '@daos/shared-kernel';
import { AssignRoleDto } from '../dto/assign-role.dto';
import { UserRepository } from '../../domain/repositories/user.repository';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { OUTBOX_PUBLISHER, ROLE_REPOSITORY, USER_REPOSITORY } from '../../domain/repositories/repository.tokens';

export class AssignRoleCommand {
  constructor(public readonly userId: string, public readonly dto: AssignRoleDto) {}
}

@CommandHandler(AssignRoleCommand)
export class AssignRoleHandler implements ICommandHandler<AssignRoleCommand, void> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: AssignRoleCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const user = await this.users.findById(tenantId, UserId.create(command.userId));
    if (!user) throw new NotFoundError(`User not found: ${command.userId}`);

    const roleId = RoleId.create(command.dto.roleId);
    if (!(await this.roles.findById(tenantId, roleId))) {
      throw new NotFoundError(`Role not found: ${command.dto.roleId}`);
    }

    user.assignRole(roleId);
    await this.users.save(user);
    await this.outbox.publish(user.pullEvents());
  }
}
```

- [ ] **Step 6: RevokeRole** (enforces last-active-admin invariant)

`apps/tenant-identity/src/application/commands/revoke-role.command.ts`:
```ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  DomainInvariantError,
  NotFoundError,
  OutboxPublisher,
  RoleId,
  TenantContextHolder,
  TenantId,
  UserId,
} from '@daos/shared-kernel';
import { UserRepository } from '../../domain/repositories/user.repository';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { ROLE_NAMES } from '../../domain/services/default-roles';
import { OUTBOX_PUBLISHER, ROLE_REPOSITORY, USER_REPOSITORY } from '../../domain/repositories/repository.tokens';

export class RevokeRoleCommand {
  constructor(public readonly userId: string, public readonly roleId: string) {}
}

@CommandHandler(RevokeRoleCommand)
export class RevokeRoleHandler implements ICommandHandler<RevokeRoleCommand, void> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: RevokeRoleCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const user = await this.users.findById(tenantId, UserId.create(command.userId));
    if (!user) throw new NotFoundError(`User not found: ${command.userId}`);

    const roleId = RoleId.create(command.roleId);
    const role = await this.roles.findById(tenantId, roleId);
    if (!role) throw new NotFoundError(`Role not found: ${command.roleId}`);

    if (role.name === ROLE_NAMES.tenantAdmin && user.hasRole(roleId)) {
      const activeAdmins = await this.users.countActiveWithRole(tenantId, roleId);
      if (activeAdmins <= 1) throw new DomainInvariantError('Cannot revoke the last active admin role');
    }

    user.revokeRole(roleId);
    await this.users.save(user);
    await this.outbox.publish(user.pullEvents());
  }
}
```

- [ ] **Step 7: SuspendUser** (enforces last-active-admin invariant)

`apps/tenant-identity/src/application/commands/suspend-user.command.ts`:
```ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DomainInvariantError, NotFoundError, TenantContextHolder, TenantId, UserId } from '@daos/shared-kernel';
import { UserRepository } from '../../domain/repositories/user.repository';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { ROLE_NAMES } from '../../domain/services/default-roles';
import { ROLE_REPOSITORY, USER_REPOSITORY } from '../../domain/repositories/repository.tokens';

export class SuspendUserCommand {
  constructor(public readonly userId: string) {}
}

@CommandHandler(SuspendUserCommand)
export class SuspendUserHandler implements ICommandHandler<SuspendUserCommand, void> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
  ) {}

  async execute(command: SuspendUserCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const user = await this.users.findById(tenantId, UserId.create(command.userId));
    if (!user) throw new NotFoundError(`User not found: ${command.userId}`);

    const adminRole = await this.roles.findByName(tenantId, ROLE_NAMES.tenantAdmin);
    if (adminRole && user.hasRole(adminRole.id)) {
      const activeAdmins = await this.users.countActiveWithRole(tenantId, adminRole.id);
      if (activeAdmins <= 1) throw new DomainInvariantError('Cannot disable the last active admin');
    }

    user.disable();
    await this.users.save(user);
  }
}
```

- [ ] **Step 8: UpdateWhiteLabel**

`apps/tenant-identity/src/application/commands/update-white-label.command.ts`:
```ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { UpdateWhiteLabelDto } from '../dto/update-white-label.dto';
import { TenantRepository } from '../../domain/repositories/tenant.repository';
import { WhiteLabelConfig } from '../../domain/value-objects/white-label-config';
import { TENANT_REPOSITORY } from '../../domain/repositories/repository.tokens';

export class UpdateWhiteLabelCommand {
  constructor(public readonly dto: UpdateWhiteLabelDto) {}
}

@CommandHandler(UpdateWhiteLabelCommand)
export class UpdateWhiteLabelHandler implements ICommandHandler<UpdateWhiteLabelCommand, void> {
  constructor(@Inject(TENANT_REPOSITORY) private readonly tenants: TenantRepository) {}

  async execute(command: UpdateWhiteLabelCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const tenant = await this.tenants.findById(tenantId);
    if (!tenant) throw new NotFoundError('Tenant not found');

    const config = WhiteLabelConfig.create({
      brandColor: command.dto.brandColor,
      logoUrl: command.dto.logoUrl ?? null,
      customDomain: command.dto.customDomain ?? null,
      featureFlags: command.dto.featureFlags ?? {},
    });
    tenant.updateWhiteLabel(config);
    await this.tenants.save(tenant);
  }
}
```

- [ ] **Step 9: Logout** (jti denylist via the IdempotencyStore port)

`apps/tenant-identity/src/application/commands/logout.command.ts`:
```ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IdempotencyStore } from '@daos/shared-kernel';
import { IDEMPOTENCY_STORE } from '../../domain/repositories/repository.tokens';

export class LogoutCommand {
  constructor(public readonly jti: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand, void> {
  constructor(@Inject(IDEMPOTENCY_STORE) private readonly idempotency: IdempotencyStore) {}

  async execute(command: LogoutCommand): Promise<void> {
    await this.idempotency.mark(`jti-denylist:${command.jti}`);
  }
}
```

- [ ] **Step 10: Commit**

```bash
git add apps/tenant-identity/src/application/commands
git commit -m "feat(identity): add application commands and handlers"
```

---

## Task 11: Application — queries + outbox dispatcher

**Files:**
- Create: `application/queries/{get-tenant,list-users,get-user,list-roles,get-my-profile}.query.ts`
- Create: `application/events/outbox-dispatcher.ts`

- [ ] **Step 1: GetTenant**

`apps/tenant-identity/src/application/queries/get-tenant.query.ts`:
```ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { TenantDetailDto } from '@daos/identity-api';
import { TenantRepository } from '../../domain/repositories/tenant.repository';
import { TENANT_REPOSITORY } from '../../domain/repositories/repository.tokens';

export class GetTenantQuery {}

@QueryHandler(GetTenantQuery)
export class GetTenantHandler implements IQueryHandler<GetTenantQuery, TenantDetailDto> {
  constructor(@Inject(TENANT_REPOSITORY) private readonly tenants: TenantRepository) {}

  async execute(): Promise<TenantDetailDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const tenant = await this.tenants.findById(tenantId);
    if (!tenant) throw new NotFoundError('Tenant not found');
    return {
      id: tenant.id.value,
      subdomain: tenant.subdomain,
      name: tenant.name,
      status: tenant.status,
      whiteLabel: {
        brandColor: tenant.whiteLabel.brandColor,
        logoUrl: tenant.whiteLabel.logoUrl,
        customDomain: tenant.whiteLabel.customDomain,
        featureFlags: tenant.whiteLabel.featureFlags,
      },
    };
  }
}
```

- [ ] **Step 2: ListUsers**

`apps/tenant-identity/src/application/queries/list-users.query.ts`:
```ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { UserProfileDto } from '@daos/identity-api';
import { UserRepository } from '../../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../domain/repositories/repository.tokens';

export class ListUsersQuery {}

@QueryHandler(ListUsersQuery)
export class ListUsersHandler implements IQueryHandler<ListUsersQuery, UserProfileDto[]> {
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepository) {}

  async execute(): Promise<UserProfileDto[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const users = await this.users.findAll(tenantId);
    return users.map((user) => ({
      id: user.id.value,
      tenantId: user.tenantId.value,
      email: user.email.value,
      status: user.status,
      roleIds: user.roleIds.map((r) => r.value),
    }));
  }
}
```

- [ ] **Step 3: GetUser**

`apps/tenant-identity/src/application/queries/get-user.query.ts`:
```ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { NotFoundError, TenantContextHolder, TenantId, UserId } from '@daos/shared-kernel';
import { UserProfileDto } from '@daos/identity-api';
import { UserRepository } from '../../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../domain/repositories/repository.tokens';

export class GetUserQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery, UserProfileDto> {
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepository) {}

  async execute(query: GetUserQuery): Promise<UserProfileDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const user = await this.users.findById(tenantId, UserId.create(query.userId));
    if (!user) throw new NotFoundError(`User not found: ${query.userId}`);
    return {
      id: user.id.value,
      tenantId: user.tenantId.value,
      email: user.email.value,
      status: user.status,
      roleIds: user.roleIds.map((r) => r.value),
    };
  }
}
```

- [ ] **Step 4: ListRoles**

`apps/tenant-identity/src/application/queries/list-roles.query.ts`:
```ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { RoleDto } from '@daos/identity-api';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { ROLE_REPOSITORY } from '../../domain/repositories/repository.tokens';

export class ListRolesQuery {}

@QueryHandler(ListRolesQuery)
export class ListRolesHandler implements IQueryHandler<ListRolesQuery, RoleDto[]> {
  constructor(@Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository) {}

  async execute(): Promise<RoleDto[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const roles = await this.roles.findAll(tenantId);
    return roles.map((role) => ({
      id: role.id.value,
      tenantId: role.tenantId.value,
      name: role.name,
      permissions: role.permissionList.map((p) => p.toString()),
    }));
  }
}
```

- [ ] **Step 5: GetMyProfile**

`apps/tenant-identity/src/application/queries/get-my-profile.query.ts`:
```ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { NotFoundError, TenantContextHolder, TenantId, UserId } from '@daos/shared-kernel';
import { MeResponseDto } from '@daos/identity-api';
import { UserRepository } from '../../domain/repositories/user.repository';
import { TenantRepository } from '../../domain/repositories/tenant.repository';
import { TENANT_REPOSITORY, USER_REPOSITORY } from '../../domain/repositories/repository.tokens';

export class GetMyProfileQuery {}

@QueryHandler(GetMyProfileQuery)
export class GetMyProfileHandler implements IQueryHandler<GetMyProfileQuery, MeResponseDto> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(TENANT_REPOSITORY) private readonly tenants: TenantRepository,
  ) {}

  async execute(): Promise<MeResponseDto> {
    const ctx = TenantContextHolder.get();
    if (!ctx.tenantId || !ctx.userId) throw new NotFoundError('Not authenticated');
    const tenantId = TenantId.create(ctx.tenantId);

    const user = await this.users.findById(tenantId, UserId.create(ctx.userId));
    if (!user) throw new NotFoundError('User not found');
    const tenant = await this.tenants.findById(tenantId);
    if (!tenant) throw new NotFoundError('Tenant not found');

    return {
      user: {
        id: user.id.value,
        tenantId: user.tenantId.value,
        email: user.email.value,
        status: user.status,
        roleIds: user.roleIds.map((r) => r.value),
      },
      tenant: { id: tenant.id.value, subdomain: tenant.subdomain, name: tenant.name, status: tenant.status },
      whiteLabel: {
        brandColor: tenant.whiteLabel.brandColor,
        logoUrl: tenant.whiteLabel.logoUrl,
        customDomain: tenant.whiteLabel.customDomain,
        featureFlags: tenant.whiteLabel.featureFlags,
      },
    };
  }
}
```

- [ ] **Step 6: OutboxDispatcher (idempotent audit-log listener)**

`apps/tenant-identity/src/application/events/outbox-dispatcher.ts`:
```ts
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { IdempotencyStore } from '@daos/shared-kernel';
import { InMemoryOutboxPublisher } from '../../infrastructure/messaging/in-memory-outbox';
import { IDEMPOTENCY_STORE, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';

@Injectable()
export class OutboxDispatcher implements OnModuleInit {
  private readonly logger = new Logger(OutboxDispatcher.name);

  constructor(
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: InMemoryOutboxPublisher,
    @Inject(IDEMPOTENCY_STORE) private readonly idempotency: IdempotencyStore,
  ) {}

  onModuleInit(): void {
    this.outbox.onEvent(async (event) => {
      if (await this.idempotency.seen(event.eventId)) return;
      await this.idempotency.mark(event.eventId);
      this.logger.log(`[audit] ${event.eventType} aggregate=${event.aggregateId} tenant=${event.tenantId}`);
    });
  }
}
```

- [ ] **Step 7: Commit**

```bash
git add apps/tenant-identity/src/application
git commit -m "feat(identity): add application queries and outbox dispatcher"
```

---

## Task 12: Interface/http — decorators, guards, interceptor, exception filter

**Files:**
- Create: `interface/http/decorators/{require-permission,current-user}.decorator.ts`
- Create: `interface/http/guards/{jwt-auth,rbac}.guard.ts`
- Create: `interface/http/interceptors/tenant-context.interceptor.ts`
- Create: `interface/http/filters/domain-exception.filter.ts`

- [ ] **Step 1: Decorators**

`apps/tenant-identity/src/interface/http/decorators/current-user.decorator.ts`:
```ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthContext {
  userId: string;
  tenantId: string;
  roleIds: string[];
  permissions: string[];
  platform: boolean;
  jti: string;
}

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): AuthContext => {
  const request = ctx.switchToHttp().getRequest();
  return request.auth;
});
```

`apps/tenant-identity/src/interface/http/decorators/require-permission.decorator.ts`:
```ts
import { SetMetadata } from '@nestjs/common';

export const REQUIRE_PERMISSION_KEY = 'requiredPermissions';

export const RequirePermission = (...permissions: string[]) => SetMetadata(REQUIRE_PERMISSION_KEY, permissions);
```

- [ ] **Step 2: JwtAuthGuard** (verifies token, resolves role→permissions, attaches `request.auth`)

`apps/tenant-identity/src/interface/http/guards/jwt-auth.guard.ts`:
```ts
import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IdempotencyStore, TenantId } from '@daos/shared-kernel';
import { IdentityProvider } from '../../../domain/ports/identity-provider.port';
import { RoleRepository } from '../../../domain/repositories/role.repository';
import { IDENTITY_PROVIDER, IDEMPOTENCY_STORE, ROLE_REPOSITORY } from '../../../domain/repositories/repository.tokens';
import { AuthContext } from '../decorators/current-user.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(IDENTITY_PROVIDER) private readonly identity: IdentityProvider,
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
    @Inject(IDEMPOTENCY_STORE) private readonly idempotency: IdempotencyStore,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const header: string = request.headers['authorization'] ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new UnauthorizedException('Missing bearer token');

    const claims = this.identity.verifyAccessToken(token);
    if (!claims) throw new UnauthorizedException('Invalid or expired token');

    if (await this.idempotency.seen(`jti-denylist:${claims.jti}`)) {
      throw new UnauthorizedException('Token has been revoked');
    }

    const tenantRoles = await this.roles.findAll(TenantId.create(claims.tenantId));
    const permissions = new Set<string>();
    for (const roleId of claims.roleIds) {
      const role = tenantRoles.find((r) => r.id.value === roleId);
      role?.permissionList.forEach((p) => permissions.add(p.toString()));
    }

    const auth: AuthContext = {
      userId: claims.sub,
      tenantId: claims.tenantId,
      roleIds: claims.roleIds,
      permissions: [...permissions],
      platform: claims.platform,
      jti: claims.jti,
    };
    request.auth = auth;
    return true;
  }
}
```

- [ ] **Step 3: RbacGuard**

`apps/tenant-identity/src/interface/http/guards/rbac.guard.ts`:
```ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { AuthContext } from '../decorators/current-user.decorator';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[] | undefined>(REQUIRE_PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const auth: AuthContext | undefined = request.auth;
    if (!auth) throw new ForbiddenException('Missing auth context');

    if (!required.every((permission) => auth.permissions.includes(permission))) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }
}
```

- [ ] **Step 4: TenantContextInterceptor** (moves `request.auth` into AsyncLocalStorage for handlers)

`apps/tenant-identity/src/interface/http/interceptors/tenant-context.interceptor.ts`:
```ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContextHolder } from '@daos/shared-kernel';
import { AuthContext } from '../decorators/current-user.decorator';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const auth: AuthContext | undefined = request.auth;
    TenantContextHolder.enterWith({
      tenantId: auth?.tenantId ?? null,
      userId: auth?.userId ?? null,
      roleIds: auth?.roleIds ?? [],
      permissions: auth?.permissions ?? [],
      isPlatform: auth?.platform ?? false,
    });
    return next.handle();
  }
}
```

- [ ] **Step 5: DomainExceptionFilter** (maps domain errors → HTTP statuses)

`apps/tenant-identity/src/interface/http/filters/domain-exception.filter.ts`:
```ts
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionsFilter,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConflictError, DomainInvariantError, InvalidCredentialsError, NotFoundError } from '@daos/shared-kernel';

@Catch()
export class DomainExceptionFilter implements ExceptionsFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = 500;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof ConflictError) {
      status = 409;
      message = exception.message;
    } else if (exception instanceof NotFoundError) {
      status = 404;
      message = exception.message;
    } else if (exception instanceof InvalidCredentialsError) {
      status = 401;
      message = exception.message;
    } else if (exception instanceof DomainInvariantError) {
      status = 400;
      message = exception.message;
    } else if (exception instanceof UnauthorizedException) {
      status = 401;
      message = exception.message;
    } else if (exception instanceof ForbiddenException) {
      status = 403;
      message = exception.message;
    } else if (exception instanceof BadRequestException) {
      status = 400;
      const body = exception.getResponse();
      message = typeof body === 'string' ? body : ((body as { message?: string | string[] }).message ?? exception.message);
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({ statusCode: status, message, path: request.url });
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add apps/tenant-identity/src/interface
git commit -m "feat(identity): add guards, decorators, tenant context interceptor, exception filter"
```

---

## Task 13: Interface/http — controllers

**Files:** Create `interface/http/controllers/{auth,tenant,user,role,me}.controller.ts`

- [ ] **Step 1: AuthController (public routes)**

`apps/tenant-identity/src/interface/http/controllers/auth.controller.ts`:
```ts
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto } from '../../../application/dto/login.dto';
import { RefreshDto } from '../../../application/dto/refresh.dto';
import { LoginCommand } from '../../../application/commands/login.command';
import { LogoutCommand } from '../../../application/commands/logout.command';
import { RefreshTokenCommand } from '../../../application/commands/refresh-token.command';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthContext, CurrentUser } from '../decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('login')
  @ApiOperation({ summary: 'Authenticate and receive access + refresh tokens' })
  login(@Body() dto: LoginDto) {
    return this.commandBus.execute(new LoginCommand(dto));
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Rotate tokens using a refresh token' })
  refresh(@Body() dto: RefreshDto) {
    return this.commandBus.execute(new RefreshTokenCommand(dto));
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke the current access token (jti denylist)' })
  logout(@CurrentUser() auth: AuthContext) {
    return this.commandBus.execute(new LogoutCommand(auth.jti));
  }
}
```

- [ ] **Step 2: TenantController**

`apps/tenant-identity/src/interface/http/controllers/tenant.controller.ts`:
```ts
import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProvisionTenantDto } from '../../../application/dto/provision-tenant.dto';
import { UpdateWhiteLabelDto } from '../../../application/dto/update-white-label.dto';
import { ProvisionTenantCommand } from '../../../application/commands/provision-tenant.command';
import { UpdateWhiteLabelCommand } from '../../../application/commands/update-white-label.command';
import { GetTenantQuery } from '../../../application/queries/get-tenant.query';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RbacGuard } from '../guards/rbac.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';

@ApiTags('tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('tenants')
export class TenantController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Post()
  @RequirePermission('tenant:provision')
  @ApiOperation({ summary: 'Provision a new tenant (platform admin only)' })
  provision(@Body() dto: ProvisionTenantDto) {
    return this.commandBus.execute(new ProvisionTenantCommand(dto));
  }

  @Get('me')
  @RequirePermission('tenant:read')
  @ApiOperation({ summary: 'Get the current tenant including white-label config' })
  getMe() {
    return this.queryBus.execute(new GetTenantQuery());
  }

  @Patch('me/white-label')
  @RequirePermission('tenant:update')
  @ApiOperation({ summary: 'Update white-label configuration' })
  updateWhiteLabel(@Body() dto: UpdateWhiteLabelDto) {
    return this.commandBus.execute(new UpdateWhiteLabelCommand(dto));
  }
}
```

- [ ] **Step 3: UserController**

`apps/tenant-identity/src/interface/http/controllers/user.controller.ts`:
```ts
import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OnboardUserDto } from '../../../application/dto/onboard-user.dto';
import { AssignRoleDto } from '../../../application/dto/assign-role.dto';
import { OnboardUserCommand } from '../../../application/commands/onboard-user.command';
import { AssignRoleCommand } from '../../../application/commands/assign-role.command';
import { RevokeRoleCommand } from '../../../application/commands/revoke-role.command';
import { SuspendUserCommand } from '../../../application/commands/suspend-user.command';
import { GetUserQuery } from '../../../application/queries/get-user.query';
import { ListUsersQuery } from '../../../application/queries/list-users.query';
import { GetMyProfileQuery } from '../../../application/queries/get-my-profile.query';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RbacGuard } from '../guards/rbac.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('users')
export class UserController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Post()
  @RequirePermission('user:invite')
  @ApiOperation({ summary: 'Onboard a new user' })
  onboard(@Body() dto: OnboardUserDto) {
    return this.commandBus.execute(new OnboardUserCommand(dto));
  }

  @Get()
  @RequirePermission('user:read')
  @ApiOperation({ summary: 'List users in the current tenant' })
  list() {
    return this.queryBus.execute(new ListUsersQuery());
  }

  @Get('me')
  @ApiOperation({ summary: 'Get the authenticated user profile + tenant white-label' })
  me() {
    return this.queryBus.execute(new GetMyProfileQuery());
  }

  @Get(':id')
  @RequirePermission('user:read')
  @ApiOperation({ summary: 'Get a user by id' })
  get(@Param('id') id: string) {
    return this.queryBus.execute(new GetUserQuery(id));
  }

  @Post(':id/roles')
  @RequirePermission('user:assign-role')
  @ApiOperation({ summary: 'Assign a role to a user' })
  assignRole(@Param('id') id: string, @Body() dto: AssignRoleDto) {
    return this.commandBus.execute(new AssignRoleCommand(id, dto));
  }

  @Delete(':id/roles/:roleId')
  @RequirePermission('user:assign-role')
  @ApiOperation({ summary: 'Revoke a role from a user' })
  revokeRole(@Param('id') id: string, @Param('roleId') roleId: string) {
    return this.commandBus.execute(new RevokeRoleCommand(id, roleId));
  }

  @Post(':id/suspend')
  @RequirePermission('user:update')
  @ApiOperation({ summary: 'Suspend (disable) a user' })
  suspend(@Param('id') id: string) {
    return this.commandBus.execute(new SuspendUserCommand(id));
  }
}
```

Note: Nest registers `GET /users/me` before `GET /users/:id` because it appears earlier in the class body. Do not reorder these methods.

- [ ] **Step 4: RoleController**

`apps/tenant-identity/src/interface/http/controllers/role.controller.ts`:
```ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListRolesQuery } from '../../../application/queries/list-roles.query';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RbacGuard } from '../guards/rbac.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';

@ApiTags('roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('roles')
export class RoleController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @RequirePermission('role:read')
  @ApiOperation({ summary: 'List roles in the current tenant' })
  list() {
    return this.queryBus.execute(new ListRolesQuery());
  }
}
```

- [ ] **Step 5: MeController (top-level `/me` for gateway composition parity)**

`apps/tenant-identity/src/interface/http/controllers/me.controller.ts`:
```ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetMyProfileQuery } from '../../../application/queries/get-my-profile.query';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RbacGuard } from '../guards/rbac.guard';

@ApiTags('me')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('me')
export class MeController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: 'Authenticated user profile + tenant + white-label' })
  getMe() {
    return this.queryBus.execute(new GetMyProfileQuery());
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add apps/tenant-identity/src/interface
git commit -m "feat(identity): add HTTP controllers"
```

---

## Task 14: Identity service wiring — seeder, billing stub, module, main.ts

**Files:**
- Create: `infrastructure/auth/platform-seeder.ts`, `infrastructure/external/billing.adapter.ts`, `tenant-identity.module.ts`, `main.ts`

- [ ] **Step 1: BillingAdapter stub (port defined, stub impl)**

`apps/tenant-identity/src/infrastructure/external/billing.adapter.ts`:
```ts
import { Injectable, Logger } from '@nestjs/common';

export interface BillingAdapter {
  notifyTenantProvisioned(tenantId: string): Promise<void>;
}

@Injectable()
export class StubBillingAdapter implements BillingAdapter {
  private readonly logger = new Logger(StubBillingAdapter.name);

  async notifyTenantProvisioned(tenantId: string): Promise<void> {
    this.logger.log(`[billing-stub] tenant provisioned: ${tenantId}`);
  }
}
```

- [ ] **Step 2: PlatformSeeder (idempotent bootstrap of the platform tenant + admin)**

`apps/tenant-identity/src/infrastructure/auth/platform-seeder.ts`:
```ts
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Email, OutboxPublisher } from '@daos/shared-kernel';
import { Tenant } from '../../domain/aggregates/tenant.aggregate';
import { User } from '../../domain/aggregates/user.aggregate';
import { Role } from '../../domain/entities/role.entity';
import { Permission } from '../../domain/value-objects/permission';
import { ROLE_NAMES } from '../../domain/services/default-roles';
import { TenantRepository } from '../../domain/repositories/tenant.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { IdentityProvider } from '../../domain/ports/identity-provider.port';
import {
  IDENTITY_PROVIDER,
  OUTBOX_PUBLISHER,
  ROLE_REPOSITORY,
  TENANT_REPOSITORY,
  USER_REPOSITORY,
} from '../../domain/repositories/repository.tokens';

export const PLATFORM_SUBDOMAIN = 'platform';

@Injectable()
export class PlatformSeeder implements OnModuleInit {
  private readonly logger = new Logger(PlatformSeeder.name);

  constructor(
    private readonly config: ConfigService,
    @Inject(TENANT_REPOSITORY) private readonly tenants: TenantRepository,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
    @Inject(IDENTITY_PROVIDER) private readonly identity: IdentityProvider,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async onModuleInit(): Promise<void> {
    if (await this.tenants.findBySubdomain(PLATFORM_SUBDOMAIN)) return;

    const tenant = Tenant.provision({ subdomain: PLATFORM_SUBDOMAIN, name: 'Platform' });
    tenant.activate();

    const platformRole = Role.create({
      tenantId: tenant.id,
      name: ROLE_NAMES.platformAdmin,
      permissions: [
        Permission.parse('tenant:provision'),
        Permission.parse('tenant:read'),
        Permission.parse('user:read'),
        Permission.parse('role:read'),
      ],
    });

    const email = this.config.get<string>('PLATFORM_ADMIN_EMAIL') ?? 'admin@platform.local';
    const password = this.config.get<string>('PLATFORM_ADMIN_PASSWORD') ?? 'platform-admin-password';
    const passwordHash = await this.identity.hashPassword(password);

    const admin = User.onboard({
      tenantId: tenant.id,
      email: Email.create(email),
      passwordHash,
      roleIds: [platformRole.id],
    });

    await this.tenants.save(tenant);
    await this.roles.saveAll([platformRole]);
    await this.users.save(admin);
    await this.outbox.publish([...tenant.pullEvents(), ...admin.pullEvents()]);
    this.logger.log(`Seeded platform tenant and admin user ${email}`);
  }
}
```

- [ ] **Step 3: TenantIdentityModule**

`apps/tenant-identity/src/tenant-identity.module.ts`:
```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';

import { TenantProvisioningService } from './domain/services/tenant-provisioning.service';
import {
  CLOCK,
  IDEMPOTENCY_STORE,
  IDENTITY_PROVIDER,
  OUTBOX_PUBLISHER,
  ROLE_REPOSITORY,
  TENANT_REPOSITORY,
  USER_REPOSITORY,
} from './domain/repositories/repository.tokens';

import { InMemoryTenantRepository } from './infrastructure/persistence/in-memory-tenant.repository';
import { InMemoryUserRepository } from './infrastructure/persistence/in-memory-user.repository';
import { InMemoryRoleRepository } from './infrastructure/persistence/in-memory-role.repository';
import { JwtIdentityAdapter } from './infrastructure/auth/jwt-identity.adapter';
import { PlatformSeeder } from './infrastructure/auth/platform-seeder';
import { InMemoryOutboxPublisher } from './infrastructure/messaging/in-memory-outbox';
import { SystemClock } from './infrastructure/clock/system-clock';
import { InMemoryIdempotencyStore } from './infrastructure/idempotency/in-memory-idempotency.store';
import { StubBillingAdapter } from './infrastructure/external/billing.adapter';

import { ProvisionTenantHandler } from './application/commands/provision-tenant.command';
import { LoginHandler } from './application/commands/login.command';
import { LogoutHandler } from './application/commands/logout.command';
import { RefreshTokenHandler } from './application/commands/refresh-token.command';
import { OnboardUserHandler } from './application/commands/onboard-user.command';
import { AssignRoleHandler } from './application/commands/assign-role.command';
import { RevokeRoleHandler } from './application/commands/revoke-role.command';
import { SuspendUserHandler } from './application/commands/suspend-user.command';
import { UpdateWhiteLabelHandler } from './application/commands/update-white-label.command';
import { GetTenantHandler } from './application/queries/get-tenant.query';
import { ListUsersHandler } from './application/queries/list-users.query';
import { GetUserHandler } from './application/queries/get-user.query';
import { ListRolesHandler } from './application/queries/list-roles.query';
import { GetMyProfileHandler } from './application/queries/get-my-profile.query';
import { OutboxDispatcher } from './application/events/outbox-dispatcher';

import { AuthController } from './interface/http/controllers/auth.controller';
import { TenantController } from './interface/http/controllers/tenant.controller';
import { UserController } from './interface/http/controllers/user.controller';
import { RoleController } from './interface/http/controllers/role.controller';
import { MeController } from './interface/http/controllers/me.controller';
import { TenantContextInterceptor } from './interface/http/interceptors/tenant-context.interceptor';
import { DomainExceptionFilter } from './interface/http/filters/domain-exception.filter';

const commandHandlers = [
  ProvisionTenantHandler,
  LoginHandler,
  LogoutHandler,
  RefreshTokenHandler,
  OnboardUserHandler,
  AssignRoleHandler,
  RevokeRoleHandler,
  SuspendUserHandler,
  UpdateWhiteLabelHandler,
];

const queryHandlers = [GetTenantHandler, ListUsersHandler, GetUserHandler, ListRolesHandler, GetMyProfileHandler];

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), CqrsModule],
  controllers: [AuthController, TenantController, UserController, RoleController, MeController],
  providers: [
    { provide: TENANT_REPOSITORY, useClass: InMemoryTenantRepository },
    { provide: USER_REPOSITORY, useClass: InMemoryUserRepository },
    { provide: ROLE_REPOSITORY, useClass: InMemoryRoleRepository },
    { provide: IDENTITY_PROVIDER, useClass: JwtIdentityAdapter },
    { provide: OUTBOX_PUBLISHER, useClass: InMemoryOutboxPublisher },
    { provide: CLOCK, useClass: SystemClock },
    { provide: IDEMPOTENCY_STORE, useClass: InMemoryIdempotencyStore },
    StubBillingAdapter,
    TenantProvisioningService,
    PlatformSeeder,
    OutboxDispatcher,
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class TenantIdentityModule {}
```

- [ ] **Step 4: main.ts**

`apps/tenant-identity/src/main.ts`:
```ts
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TenantIdentityModule } from './tenant-identity.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(TenantIdentityModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('DAOS Tenant & Identity')
    .setDescription('Tenant Management & Identity bounded context')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.IDENTITY_PORT ?? 3001);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`tenant-identity listening on http://localhost:${port} (docs at /docs)`);
}

void bootstrap();
```

- [ ] **Step 5: Verify the service boots and the seeder runs**

Run: `npx nest start tenant-identity`
Expected: log lines include `Seeded platform tenant and admin user admin@platform.local` and `tenant-identity listening on http://localhost:3001`.

Then in a second terminal:
```bash
curl -s -X POST http://localhost:3001/auth/login -H "content-type: application/json" -d '{"subdomain":"platform","email":"admin@platform.local","password":"platform-admin-password"}'
```
Expected: JSON containing `accessToken` and `refreshToken`. Stop the server (Ctrl+C) afterwards.

- [ ] **Step 6: Commit**

```bash
git add apps/tenant-identity/src
git commit -m "feat(identity): wire module, platform seeder, and bootstrap"
```

---

## Task 15: API Gateway — middleware, rate limiting, proxy, /me composition

**Files:**
- Create: `apps/api-gateway/src/rate-limit/{rate-limiter.port,in-memory-rate-limiter}.ts`
- Create: `apps/api-gateway/src/middleware/{tenant-resolution,rate-limit}.middleware.ts`, `auth/jwt-verify.middleware.ts`
- Create: `apps/api-gateway/src/proxy/identity-http.client.ts`, `me/me.controller.ts`
- Create: `apps/api-gateway/src/{gateway.module,main}.ts`

- [ ] **Step 1: Rate limiter port + in-memory sliding-window adapter (with test)**

`apps/api-gateway/src/rate-limit/rate-limiter.port.ts`:
```ts
export const RATE_LIMITER = 'RATE_LIMITER';

export interface RateLimiter {
  allow(key: string): Promise<boolean>;
}
```

`apps/api-gateway/src/rate-limit/in-memory-rate-limiter.ts`:
```ts
import { Injectable } from '@nestjs/common';
import { RateLimiter } from './rate-limiter.port';

@Injectable()
export class InMemoryRateLimiter implements RateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly max: number = Number(process.env.RATE_LIMIT_MAX ?? 1000),
    private readonly windowMs: number = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000),
  ) {}

  async allow(key: string): Promise<boolean> {
    const now = Date.now();
    const recent = (this.hits.get(key) ?? []).filter((t) => now - t < this.windowMs);
    if (recent.length >= this.max) {
      this.hits.set(key, recent);
      return false;
    }
    recent.push(now);
    this.hits.set(key, recent);
    return true;
  }
}
```

`apps/api-gateway/src/rate-limit/in-memory-rate-limiter.spec.ts`:
```ts
import { InMemoryRateLimiter } from './in-memory-rate-limiter';

describe('InMemoryRateLimiter', () => {
  it('allows up to max then rejects within the window', async () => {
    const limiter = new InMemoryRateLimiter(3, 60000);
    expect(await limiter.allow('k')).toBe(true);
    expect(await limiter.allow('k')).toBe(true);
    expect(await limiter.allow('k')).toBe(true);
    expect(await limiter.allow('k')).toBe(false);
  });

  it('tracks keys independently', async () => {
    const limiter = new InMemoryRateLimiter(1, 60000);
    expect(await limiter.allow('a')).toBe(true);
    expect(await limiter.allow('b')).toBe(true);
    expect(await limiter.allow('a')).toBe(false);
  });
});
```

Run: `npx jest apps/api-gateway/src/rate-limit`
Expected: PASS (2 tests).

- [ ] **Step 2: Tenant resolution middleware**

`apps/api-gateway/src/middleware/tenant-resolution.middleware.ts`:
```ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class TenantResolutionMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const headerTenant = req.headers['x-tenant-id'];
    let tenantKey: string | null = typeof headerTenant === 'string' ? headerTenant : null;
    if (!tenantKey) {
      const host = req.headers.host ?? '';
      const firstLabel = host.split('.')[0];
      // localhost and bare IPs are not tenant subdomains
      if (firstLabel && firstLabel !== 'localhost' && !/^\d+$/.test(firstLabel)) {
        tenantKey = firstLabel;
      }
    }
    (req as Request & { tenantKey?: string | null }).tenantKey = tenantKey;
    next();
  }
}
```

- [ ] **Step 3: Rate-limit middleware**

`apps/api-gateway/src/middleware/rate-limit.middleware.ts`:
```ts
import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { RATE_LIMITER, RateLimiter } from '../rate-limit/rate-limiter.port';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(@Inject(RATE_LIMITER) private readonly limiter: RateLimiter) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const tenantKey = (req as Request & { tenantKey?: string | null }).tenantKey;
    const key = tenantKey ?? req.ip ?? 'anonymous';
    if (!(await this.limiter.allow(key))) {
      res.status(429).json({ statusCode: 429, message: 'Too many requests' });
      return;
    }
    next();
  }
}
```

- [ ] **Step 4: JWT verification middleware (gateway-side early reject)**

`apps/api-gateway/src/auth/jwt-verify.middleware.ts`:
```ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtVerifyMiddleware implements NestMiddleware {
  private readonly secret = process.env.JWT_SECRET ?? 'dev-secret-change-me';

  use(req: Request, res: Response, next: NextFunction): void {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      res.status(401).json({ statusCode: 401, message: 'Missing bearer token' });
      return;
    }
    try {
      const claims = jwt.verify(token, this.secret) as { type?: string };
      if (claims.type !== 'access') {
        res.status(401).json({ statusCode: 401, message: 'Invalid token type' });
        return;
      }
      next();
    } catch {
      res.status(401).json({ statusCode: 401, message: 'Invalid or expired token' });
    }
  }
}
```

- [ ] **Step 5: Identity HTTP client** (used by the `/me` composition endpoint; proxying itself is the middleware in `main.ts`, Step 8)

`apps/api-gateway/src/proxy/identity-http.client.ts`:
```ts
import { HttpException, Injectable } from '@nestjs/common';

@Injectable()
export class IdentityHttpClient {
  private readonly baseUrl = process.env.IDENTITY_URL ?? 'http://localhost:3001';

  async getJson<T>(path: string, authorization?: string): Promise<T> {
    const headers: Record<string, string> = {};
    if (authorization) headers.authorization = authorization;
    const response = await fetch(`${this.baseUrl}${path}`, { headers });
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      throw new HttpException(payload.message ?? 'Upstream error', response.status);
    }
    return (await response.json()) as T;
  }
}
```

- [ ] **Step 6: MeController (BFF composition)**

`apps/api-gateway/src/me/me.controller.ts`:
```ts
import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { MeResponseDto, TenantDetailDto } from '@daos/identity-api';
import { IdentityHttpClient } from '../proxy/identity-http.client';

@ApiTags('me')
@ApiBearerAuth()
@Controller('me')
export class MeController {
  constructor(private readonly client: IdentityHttpClient) {}

  @Get()
  @ApiOperation({ summary: 'Compose user profile + tenant white-label from the identity service' })
  async getMe(@Req() req: Request): Promise<MeResponseDto> {
    const auth = typeof req.headers.authorization === 'string' ? req.headers.authorization : undefined;
    const me = await this.client.getJson<MeResponseDto>('/users/me', auth);
    const tenantDetail = await this.client.getJson<TenantDetailDto>('/tenants/me', auth);
    return { user: me.user, tenant: me.tenant, whiteLabel: tenantDetail.whiteLabel };
  }
}
```

- [ ] **Step 7: GatewayModule** (middleware ordering: tenant resolution → rate limit → [jwt for protected paths] → proxy)

`apps/api-gateway/src/gateway.module.ts`:
```ts
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { IdentityHttpClient } from './proxy/identity-http.client';
import { MeController } from './me/me.controller';
import { TenantResolutionMiddleware } from './middleware/tenant-resolution.middleware';
import { RateLimitMiddleware } from './middleware/rate-limit.middleware';
import { JwtVerifyMiddleware } from './auth/jwt-verify.middleware';
import { InMemoryRateLimiter } from './rate-limit/in-memory-rate-limiter';
import { RATE_LIMITER } from './rate-limit/rate-limiter.port';

@Module({
  controllers: [MeController],
  providers: [IdentityHttpClient, { provide: RATE_LIMITER, useClass: InMemoryRateLimiter }],
})
export class GatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Explicit prefixes (no '*' wildcard — Express 5 / path-to-regexp v8 dropped bare '*').
    consumer.apply(TenantResolutionMiddleware, RateLimitMiddleware).forRoutes('auth', 'tenants', 'users', 'roles', 'me');
    consumer.apply(JwtVerifyMiddleware).forRoutes('tenants', 'users', 'roles', 'me');
  }
}
```

- [ ] **Step 8: main.ts with raw proxy middleware for passthrough routes**

`apps/api-gateway/src/main.ts`:
```ts
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NextFunction, Request, Response } from 'express';
import { GatewayModule } from './gateway.module';

function proxyToIdentity(prefixes: string[]) {
  const baseUrl = process.env.IDENTITY_URL ?? 'http://localhost:3001';
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const isProxied = prefixes.some((p) => req.path === `/${p}` || req.path.startsWith(`/${p}/`));
    if (!isProxied) {
      next();
      return;
    }
    const headers: Record<string, string> = { 'content-type': 'application/json' };
    const auth = req.headers.authorization;
    if (typeof auth === 'string') headers.authorization = auth;
    const body =
      req.method === 'GET' || req.method === 'HEAD' || req.method === 'DELETE'
        ? undefined
        : JSON.stringify(req.body ?? {});
    try {
      const upstream = await fetch(`${baseUrl}${req.originalUrl}`, { method: req.method, headers, body });
      const text = await upstream.text();
      res.status(upstream.status);
      res.setHeader('content-type', 'application/json');
      res.send(text.length > 0 ? text : '{}');
    } catch {
      res.status(502).json({ statusCode: 502, message: 'Identity service unavailable' });
    }
  };
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(GatewayModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Passthrough proxy for identity routes not owned by the gateway itself.
  app.use(proxyToIdentity(['auth', 'tenants', 'users', 'roles']));

  const config = new DocumentBuilder()
    .setTitle('DAOS API Gateway')
    .setDescription('Edge: tenant resolution, rate limiting, routing, composition')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.GATEWAY_PORT ?? 3000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`api-gateway listening on http://localhost:${port} (docs at /docs)`);
}

void bootstrap();
```

Important ordering note: `app.use(proxyToIdentity(...))` is registered AFTER Nest middleware configured in `GatewayModule.configure` (tenant resolution + rate limit + JWT verify), so those run first. The proxy handles `/auth/**`, `/tenants/**`, `/users/**`, `/roles/**`; Nest's `MeController` handles `/me` (the proxy prefix list deliberately excludes `me`).

- [ ] **Step 9: Boot both services and smoke-test through the gateway**

Terminal 1: `npx nest start tenant-identity`
Terminal 2: `npx nest start api-gateway`

Then:
```bash
curl -s -X POST http://localhost:3000/auth/login -H "content-type: application/json" -d '{"subdomain":"platform","email":"admin@platform.local","password":"platform-admin-password"}'
```
Expected: JSON with `accessToken`. Save it as TOKEN and run:
```bash
TOKEN="<accessToken from above>"
curl -s http://localhost:3000/me -H "authorization: Bearer $TOKEN"
```
Expected: JSON with `user`, `tenant`, `whiteLabel` (platform tenant). Stop both servers.

- [ ] **Step 10: Commit**

```bash
git add apps/api-gateway
git commit -m "feat(gateway): add tenant resolution, rate limiting, JWT check, proxy and /me composition"
```

---

## Task 16: E2E golden path (both apps, real HTTP)

**Files:**
- Create: `apps/api-gateway/test/golden-path.e2e-spec.ts`, `apps/api-gateway/test/proxy-helper.ts`

- [ ] **Step 1: Write the golden-path e2e test**

`apps/api-gateway/test/golden-path.e2e-spec.ts`:
```ts
import 'reflect-metadata';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TenantIdentityModule } from '../../tenant-identity/src/tenant-identity.module';
import { GatewayModule } from '../src/gateway.module';
import { createProxyMiddleware } from './proxy-helper';

const IDENTITY_PORT = 3101;
const GATEWAY_PORT = 3100;
const GATEWAY = `http://localhost:${GATEWAY_PORT}`;

async function post(path: string, body: unknown, token?: string): Promise<{ status: number; body: any }> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (token) headers.authorization = `Bearer ${token}`;
  const res = await fetch(`${GATEWAY}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

async function get(path: string, token?: string): Promise<{ status: number; body: any }> {
  const headers: Record<string, string> = {};
  if (token) headers.authorization = `Bearer ${token}`;
  const res = await fetch(`${GATEWAY}${path}`, { headers });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

async function del(path: string, token?: string): Promise<{ status: number; body: any }> {
  const headers: Record<string, string> = {};
  if (token) headers.authorization = `Bearer ${token}`;
  const res = await fetch(`${GATEWAY}${path}`, { method: 'DELETE', headers });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

describe('DAOS golden path (e2e through gateway)', () => {
  let identityApp: INestApplication;
  let gatewayApp: INestApplication;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'e2e-secret';
    process.env.IDENTITY_URL = `http://localhost:${IDENTITY_PORT}`;

    const identityModule = await Test.createTestingModule({ imports: [TenantIdentityModule] }).compile();
    identityApp = identityModule.createNestApplication();
    identityApp.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    // DomainExceptionFilter is already active via the module's APP_FILTER provider.
    await identityApp.listen(IDENTITY_PORT);

    const gatewayModule = await Test.createTestingModule({ imports: [GatewayModule] }).compile();
    gatewayApp = gatewayModule.createNestApplication();
    gatewayApp.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    gatewayApp.use(createProxyMiddleware(['auth', 'tenants', 'users', 'roles']));
    await gatewayApp.listen(GATEWAY_PORT);
  });

  afterAll(async () => {
    await gatewayApp?.close();
    await identityApp?.close();
  });

  it('runs the full lifecycle', async () => {
    // 1. Platform admin logs in (seeded at boot)
    const platformLogin = await post('/auth/login', {
      subdomain: 'platform',
      email: 'admin@platform.local',
      password: 'platform-admin-password',
    });
    expect(platformLogin.status).toBe(201);
    const platformToken = platformLogin.body.accessToken as string;
    expect(platformToken).toBeTruthy();

    // 2. Platform admin provisions tenant "acme"
    const provision = await post(
      '/tenants',
      { subdomain: 'acme', name: 'Acme Corp', adminEmail: 'boss@acme.test', adminPassword: 'password123' },
      platformToken,
    );
    expect(provision.status).toBe(201);
    expect(provision.body.tenantId).toBeTruthy();

    // 3. Duplicate subdomain is rejected (409)
    const dup = await post(
      '/tenants',
      { subdomain: 'acme', name: 'Other', adminEmail: 'x@acme.test', adminPassword: 'password123' },
      platformToken,
    );
    expect(dup.status).toBe(409);

    // 4. Acme admin logs in
    const acmeLogin = await post('/auth/login', {
      subdomain: 'acme',
      email: 'boss@acme.test',
      password: 'password123',
    });
    expect(acmeLogin.status).toBe(201);
    const acmeToken = acmeLogin.body.accessToken as string;

    // 5. Non-platform user cannot provision tenants (403)
    const forbidden = await post(
      '/tenants',
      { subdomain: 'nope', name: 'Nope', adminEmail: 'n@nope.test', adminPassword: 'password123' },
      acmeToken,
    );
    expect(forbidden.status).toBe(403);

    // 6. Acme admin lists roles and finds the member role
    const roles = await get('/roles', acmeToken);
    expect(roles.status).toBe(200);
    const memberRole = roles.body.find((r: any) => r.name === 'member');
    expect(memberRole).toBeTruthy();

    // 7. Acme admin onboards a member user
    const onboard = await post(
      '/users',
      { email: 'member@acme.test', password: 'password123', roleIds: [memberRole.id] },
      acmeToken,
    );
    expect(onboard.status).toBe(201);
    const memberId = onboard.body.userId as string;

    // 8. Duplicate email rejected (409)
    const dupUser = await post(
      '/users',
      { email: 'member@acme.test', password: 'password123', roleIds: [memberRole.id] },
      acmeToken,
    );
    expect(dupUser.status).toBe(409);

    // 9. Member logs in and reads own profile via gateway /me composition
    const memberLogin = await post('/auth/login', {
      subdomain: 'acme',
      email: 'member@acme.test',
      password: 'password123',
    });
    expect(memberLogin.status).toBe(201);
    const memberToken = memberLogin.body.accessToken as string;

    const me = await get('/me', memberToken);
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe('member@acme.test');
    expect(me.body.tenant.subdomain).toBe('acme');
    expect(me.body.whiteLabel.brandColor).toBe('#000000');

    // 10. Member CANNOT invite users (RBAC denial)
    const memberTriesInvite = await post(
      '/users',
      { email: 'x@acme.test', password: 'password123', roleIds: [memberRole.id] },
      memberToken,
    );
    expect(memberTriesInvite.status).toBe(403);

    // 11. Member cannot see other tenants' users (tenant isolation)
    const memberListsUsers = await get('/users', memberToken);
    expect(memberListsUsers.status).toBe(200);
    expect(memberListsUsers.body.every((u: any) => u.tenantId === me.body.user.tenantId)).toBe(true);

    // 12. Admin updates white-label, member sees it on /me
    const updateWl = await fetch(`${GATEWAY}/tenants/me/white-label`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${acmeToken}` },
      body: JSON.stringify({ brandColor: '#112233', featureFlags: { beta: true } }),
    });
    expect(updateWl.status).toBe(200);
    const meAfter = await get('/me', memberToken);
    expect(meAfter.body.whiteLabel.brandColor).toBe('#112233');

    // 13. Admin assigns an extra role to the member, then revokes it
    const adminRole = roles.body.find((r: any) => r.name === 'compliance-officer');
    const assign = await post(`/users/${memberId}/roles`, { roleId: adminRole.id }, acmeToken);
    expect(assign.status).toBe(201);
    const meAssigned = await get('/me', memberToken);
    expect(meAssigned.body.user.roleIds).toContain(adminRole.id);

    const revoke = await del(`/users/${memberId}/roles/${adminRole.id}`, acmeToken);
    expect(revoke.status).toBe(200);

    // 14. Admin cannot be suspended while they are the last active admin (400)
    const adminUserId = acmeLogin.body.userId as string;
    const suspendAdmin = await post(`/users/${adminUserId}/suspend`, {}, acmeToken);
    expect(suspendAdmin.status).toBe(400);

    // 15. Missing token → 401; garbage token → 401
    expect((await get('/users')).status).toBe(401);
    expect((await get('/users', 'garbage')).status).toBe(401);

    // 16. Refresh rotation works
    const refresh = await post('/auth/refresh', { refreshToken: memberLogin.body.refreshToken });
    expect(refresh.status).toBe(201);
    expect(refresh.body.accessToken).toBeTruthy();

    // 17. Logout revokes the current access token via the jti denylist
    const logout = await post('/auth/logout', {}, memberToken);
    expect(logout.status).toBe(201);
    const meAfterLogout = await get('/me', memberToken);
    expect(meAfterLogout.status).toBe(401);
  });
});
```

Also create the test-only proxy helper — identical behavior to `proxyToIdentity` in `apps/api-gateway/src/main.ts` (Task 15 Step 8):

`apps/api-gateway/test/proxy-helper.ts`:
```ts
import { NextFunction, Request, Response } from 'express';

export function createProxyMiddleware(prefixes: string[]) {
  const baseUrl = process.env.IDENTITY_URL ?? 'http://localhost:3001';
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const isProxied = prefixes.some((p) => req.path === `/${p}` || req.path.startsWith(`/${p}/`));
    if (!isProxied) {
      next();
      return;
    }
    const headers: Record<string, string> = { 'content-type': 'application/json' };
    const auth = req.headers.authorization;
    if (typeof auth === 'string') headers.authorization = auth;
    const body =
      req.method === 'GET' || req.method === 'HEAD' || req.method === 'DELETE'
        ? undefined
        : JSON.stringify(req.body ?? {});
    try {
      const upstream = await fetch(`${baseUrl}${req.originalUrl}`, { method: req.method, headers, body });
      const text = await upstream.text();
      res.status(upstream.status);
      res.setHeader('content-type', 'application/json');
      res.send(text.length > 0 ? text : '{}');
    } catch {
      res.status(502).json({ statusCode: 502, message: 'Identity service unavailable' });
    }
  };
}
```

- [ ] **Step 2: Run the e2e suite**

Run: `npx jest --runInBand`
Expected: all suites PASS, including `golden path (e2e through gateway)`. Use `--runInBand` so the two apps bind ports sequentially without races.

If ports 3100/3101 are busy, change `IDENTITY_PORT`/`GATEWAY_PORT` constants and `process.env.IDENTITY_URL` consistently.

- [ ] **Step 3: Verify outbox events were observed**

The e2e run logs `[audit] identity.tenant.provisioned.v1 ...`, `[audit] identity.user.onboarded.v1 ...`, and role events from `OutboxDispatcher`. Confirm these appear in the test output. This is the spec's "events observed in the outbox" criterion.

- [ ] **Step 4: Commit**

```bash
git add apps/api-gateway/test
git commit -m "test: add golden-path e2e through gateway and identity service"
```

---

## Task 17: Final polish — README, lint, full verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Write the real README**

`README.md`:
```markdown
# DAOS — Private Capital Market Platform for Digital Assets

Sub-project 1: monorepo foundation + Tenant Management & Identity context.

## Layout

- `apps/api-gateway` — edge (tenant resolution, rate limiting, JWT check, routing, /me composition). Port 3000.
- `apps/tenant-identity` — Tenant Management & Identity bounded context. Port 3001.
- `libs/shared-kernel` — DDD toolkit (value objects, aggregate root, domain events, tenant context, ports).
- `libs/identity-api` — shared API contracts between gateway and identity service.

## Quickstart

```bash
npm install
cp .env.example .env
npm run start:dev        # starts identity (:3001) and gateway (:3000) with watch
```

Swagger: http://localhost:3000/docs and http://localhost:3001/docs

## Bootstrapped platform admin

On first boot the identity service seeds a `platform` tenant with an admin:

- email: `admin@platform.local`
- password: `platform-admin-password`

Login through the gateway:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "content-type: application/json" \
  -d '{"subdomain":"platform","email":"admin@platform.local","password":"platform-admin-password"}'
```

Use the returned `accessToken` to provision tenants (`POST /tenants`) and manage users/roles.

## Tests

```bash
npm test                 # unit + e2e
npm run test:cov         # with coverage
```

## Design

See `docs/superpowers/specs/2026-08-29-daos-foundation-tenant-identity-design.md` and
`docs/superpowers/plans/2026-08-29-daos-foundation-tenant-identity.md`.
```

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: no errors. Fix any reported issues before continuing (warnings about `no-explicit-any` are acceptable in test files only).

- [ ] **Step 3: Run the full test suite**

Run: `npm test -- --runInBand`
Expected: all tests PASS.

- [ ] **Step 4: Manual smoke — both apps boot together**

Run: `npm run start:dev`
Expected: two watch processes; logs show identity seeding the platform tenant and both apps listening. Open http://localhost:3000/docs and http://localhost:3001/docs in a browser; both render Swagger UI. Repeat the login curl from Step 1 of this task's README through port 3000 and confirm tokens are returned. Stop the processes.

- [ ] **Step 5: Final commit**

```bash
git add README.md
git commit -m "docs: add README with quickstart and bootstrap credentials"
```

---

## Definition-of-done checklist

Before reporting the sub-project complete, verify every item:

1. `npm install` succeeds from a clean clone (argon2 included).
2. `npm test -- --runInBand` — all unit and e2e tests green, including the gateway golden path.
3. `npm run start:dev` boots both apps; platform tenant seeded.
4. Golden path works manually through port 3000: platform login → provision tenant → tenant login → onboard user → member login → `/me` returns composed profile → RBAC denial for member invite (403).
5. Swagger UI reachable on both apps.
6. `npm run lint` clean (errors = 0).
7. Domain layer has zero imports from `infrastructure`, `interface`, or `@nestjs/*` (enforced by ESLint).
8. Git history contains the per-task commits listed above.

## Known deferrals (sub-project #2+)

- PostgreSQL + RLS adapters replacing in-memory repositories (port signatures already tenant-scoped).
- Redis rate limiter + jti denylist for logout.
- Kafka/RabbitMQ outbox relay with schema registry.
- TestContainers integration tests (requires Docker).
- `Organization` and `ServiceEntitlement` aggregates; billing integration beyond the stub.
- gRPC inter-service calls; gateway BFFs for web/mobile/admin portals.
