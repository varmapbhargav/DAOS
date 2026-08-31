# Migration Plan: Full Kong Gateway + Kuma Service Mesh

Target architecture for the DAOS Docker Compose platform. This plan upgrades the current
DeCK-less (declarative-config) Kong 3.5 into a full Kong Gateway backed by Postgres, and layers
a Kuma service mesh (control plane + Envoy sidecars) on top of all microservices, with mTLS
securing service-to-service traffic. External API concerns (auth, rate limiting, CORS, request
transformation) move from the NestJS `api-gateway` app into Kong plugins.

---

## 0. High-Level Target Topology

```
                 ┌────────────────────────────────────────────────────────────┐
                 │                        Edge                                │
                 │   Kong Gateway (full, DB-backed)  :8000/8443 (proxy)      │
                 │   - plugins: jwt | rate-limiting | cors | request-transformer
                 │   Postgres (kong-db) + Admin API :8001                      │
                 └───────────────┬────────────────────────────────────────────┘
                                 │  mTLS + mTLS (mutual TLS via mesh certs)
                 ┌───────────────▼────────────────────────────────────────────┐
                 │                        Kuma Mesh                            │
                 │   kuma-cp  :5681 (control plane)  +  :5680 (dataplane)
                 │   mTLS backends (built-in), per-service Envoy sidecars       │
                 └─────────────────────────────────────────────────────────────┘
   ┌─────────┬─────────┬─────────┬─────────┬──────────────────────┐
   │ svc a   │ svc b   │ svc c   │  ...    │ svc n                │
   │ (app)   │ (app)   │ (app)   │  (app)  │ (app)                │
   │  +Envoy │  +Envoy │  +Envoy │  +Envoy │ +Envoy               │
   └─────────┴─────────┴─────────┴─────────┴──────────────────────┘
   Kong routes now target each service's Envoy sidecar inbound (port 9000), NOT the app directly.
```

- Kong becomes the **only** external entry point. Traffic flows: client → Kong → Kuma Envoy
  sidecar inbound → app → (outbound to other services via the same mesh).
- The NestJS `api-gateway` app is retired for routing; it retains only the `/me` composition
  endpoint (which can be exposed through Kong or removed entirely).

---

## 1. Network Topology

Introduce **three explicit bridge networks** plus reuse existing infra connectivity:

| Network | Purpose |
|---------|---------|
| `mesh` | All mesh participants (every microservice sidecar + Kuma CP + Kong). Every service is on this network so sidecars can resolve each other and reach the CP. |
| `infra` | Postgres, Redis, Zookeeper, Kafka, Schema Registry — infrastructure asked for by services but not mesh-meshed themselves. |
| `kong-db` | Kong Gateway ↔ Kong Postgres (isolate Kong's DB traffic from the app DB). |

Design decisions:
- `postgres`, `redis`, `zookeeper`, `kafka`, `schema-registry` join **`infra`**.
- Every **microservice app container** joins both `mesh` and `infra` (apps need infra for DB/Redis/Kafka, and the mesh for sidecar communication).
- Every **Envoy sidecar** joins `mesh` only (sidecars never talk to infra directly — the app does).
- `kuma-cp`, `kong-gateway` join `mesh`.
- `kong-gateway` joins `mesh` + `kong-db`.
- `kong-db` joins `kong-db`.

> **Port strategy for Envoy sidecars (Kuma):** Kuma's generated dataplane binds the app's inbound
> port on 127.0.0.1 and exposes the "virtual" inbound on `0.0.0.0:<port>`. When running in a
> container, we configure the sidecar with `redirectInbound` off and expose the inbound on the
> **public** port `9000` so Kong (and the host, for debugging) can reach it. Concretely each app
> gets its sidecar at port `9000`, and Kong services point at `http://<service>:9000`.

---

## 2. Kuma Control Plane (`kuma-cp`)

Add to `docker-compose.yml`:

```yaml
  kuma-cp:
    image: kong/kuma-cp:2.9.1
    container_name: daos-kuma-cp
    hostname: kuma-cp
    restart: unless-stopped
    command: ["run"]
    ports:
      - '5681:5681'   # HTTP API for kumactl / management
      - '5680:5680'   # Data plane registration (DP-to-CP)
    environment:
      KUMA_MODE: standalone
      KUMA_STORE_TYPE: memory
      KUMA_GENERAL_DNS_SERVER_PORT: 5653
      KUMA_GENERAL_TLS_CERT_KEY_FILE: /kuma/tls/tls.key
      KUMA_GENERAL_TLS_CERT_FILE: /kuma/tls/tls.crt
      KUMA_CONTROL_PLANE_ENABLED: 'true'
    volumes:
      - ./kuma/tls:/kuma/tls:ro
    networks:
      - mesh
    healthcheck:
      test: ['CMD', 'wget', '-qO-', 'http://localhost:5681/health']
      interval: 5s
      timeout: 5s
      retries: 10
```

Notes:
- Control plane is **standalone with in-memory store** for this dev scope. For persistence use
  `KUMA_STORE_TYPE: postgres` and point it at a dedicated `kuma-db` (further hardening — out of
  scope here, flagged in Step 10).
- `5681` (REST/`kumactl`) and `5680` (DP config) are both needed. Ports are published to the host
  for `kumactl` management.
- The `/kuma/tls` volume holds a self-signed cert generated in Step 3 (or we can run CP with a
  generated cert and skip mounting by letting CP create it in its dataplane token dir — mount is
  the reproducible choice).

**Optional but recommended** — expose the GUI at `5681/gui` (bundled) for debugging.

---

## 3. TLS & Dataplane Token Bootstrap

Because Docker Compose has no init system or post-install hook, the CP certificate and the
dataplane token must be pre-generated before sidecars start. Two options:

**Option A (simplest, recommended for local dev) — disable token requirement:**
Set `KUMA_DP_SERVER_AUTH_TYPE: none`. Sidecars don't need a token file. Quick to wire, but mTLS
is still enforced at the mesh layer because each Envoy gets mesh certs from the CP.

**Option B (more production-faithful) — token auth:**
Drop a `kuma/dataplane-token` file (created via Cloud/CLI) and mount it into every sidecar at
`/kuma/token`, setting `KUMA_CONTROL_PLANE_BOOTSTRAP_SERVER_INSECURE` only in dev.

**TLS cert:** generate once and commit under `kuma/tls/`:
```bash
# one-time, run on the host before `docker compose up`
mkdir -p kuma/tls
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout kuma/tls/tls.key \
  -out kuma/tls/tls.crt \
  -days 365 -subj "/CN=kuma-cp"
```

---

## 4. Kong Database (`kong-db`) & Migration

Add a **second, separate** Postgres instance for Kong. Do **not** share the app's `postgres`
container with the same credentials/DB — this isolates Kong's control-plane data from app data
per the constraint.

```yaml
  kong-db:
    image: postgres:13-alpine        # Kong 3.5 requires PG 13+ (13–15 supported)
    container_name: daos-kong-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: kong
      POSTGRES_PASSWORD: kong_dev_password
      POSTGRES_DB: kong
    volumes:
      - kong_db_data:/var/lib/postgresql/data
    networks:
      - kong-db
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U kong']
      interval: 5s
      timeout: 5s
      retries: 10
```

Run Kong's schema migrations with a short-lived `kong-migration` job (analogous to the existing
`flyway` pattern):

```yaml
  kong-migration:
    image: kong:3.5-alpine
    container_name: daos-kong-migration
    command: ['kong', 'migrations', 'bootstrap']
    environment:
      KONG_DATABASE: 'postgres'
      KONG_PG_HOST: kong-db
      KONG_PG_PORT: '5432'
      KONG_PG_USER: kong
      KONG_PG_PASSWORD: kong_dev_password
      KONG_PG_DATABASE: kong
    depends_on:
      kong-db:
        condition: service_healthy
    networks:
      - kong-db
    restart: 'no'
```

> For upgrades use `kong migrations up` / `kong migrations finish`, but a fresh bootstrap is correct
> for this initial migration (DeCK-less → DB mode with no pre-existing Kong DB).

---

## 5. Full Kong Gateway (`kong-gateway`)

Replace the current `kong` DeCK-less service. It now runs in **postgres** mode:

```yaml
  kong-gateway:
    image: kong:3.5-alpine
    container_name: daos-kong
    restart: unless-stopped
    ports:
      - '8000:8000'   # Proxy (HTTP)
      - '8443:8443'   # Proxy (HTTPS)
      - '8001:8001'   # Admin API
      # - '8444:8444' # Admin API (HTTPS) - optional
    environment:
      KONG_DATABASE: 'postgres'
      KONG_PG_HOST: kong-db
      KONG_PG_PORT: '5432'
      KONG_PG_USER: kong
      KONG_PG_PASSWORD: kong_dev_password
      KONG_PG_DATABASE: kong
      # Declarative config file is NOT used; config is loaded from DB / Admin API.
      KONG_PROXY_ACCESS_LOG: '/dev/stdout'
      KONG_PROXY_ERROR_LOG: '/dev/stderr'
      KONG_ADMIN_ACCESS_LOG: '/dev/stdout'
      KONG_ADMIN_ERROR_LOG: '/dev/stderr'
      KONG_PLUGINS: 'bundled,jwt,rate-limiting,cors,request-transformer'
      KONG_ADMIN_LISTEN: '0.0.0.0:8001'
      # Security: require an admin token (uncomment for prod)
      # KONG_ADMIN_GUI_AUTH: basic-auth
      # KONG_PASSWORD: kong_admin_password
    depends_on:
      kong-migration:
        condition: service_completed_successfully
    networks:
      - mesh
      - kong-db
    healthcheck:
      test: ['CMD', 'kong', 'health']
      interval: 10s
      timeout: 5s
      retries: 5
```

Key differences from the old `kong` service:
- `KONG_DATABASE: 'postgres'` instead of `'off'`.
- No `KONG_DECLARATIVE_CONFIG` / `kong.yml` mount — config now lives in Postgres.
- Explicit `KONG_PLUGINS` list so jwt/cors/request-transformer/rate-limiting are enabled.
- `depends_on` the `kong-migration` job (must complete before Kong boots).

---

## 6. Updated `kong/kong.yml` → Declarative Bootstrap for DB-backed Kong

Kong supports **declarative config via `KONG_DECLARATIVE_CONFIG` even in DB mode only for
seed/import**, but the idiomatic DB-mode path is to load config through the Admin API. Two clean
options:

**Option A (recommended): keep `kong.yml` as an idempotent Admin-API seed.**
Rename the file to `kong/kong-import.yml`, remove the `_format_version`/`_transform` header, and
import it once via a one-shot `kong-deck` (direct `deck`, not the DeCK-less "scaffold") job:

```yaml
  kong-import:
    image: kong/deck:1.39   # idempotent 'kong.yml' → Admin API
    container_name: daos-kong-import
    depends_on:
      kong-gateway:
        condition: service_healthy
    command: ['gateway', 'sync', '/kong/kong.yml', '--konnect-addr', 'http://kong-gateway:8001']
    volumes:
      - ./kong:/kong
    networks:
      - mesh
    restart: 'no'
```

**Option B: keep `KONG_DECLARATIVE_CONFIG` for seed at boot.**
Kong loads the file on boot and writes it into DB on `kong start` when combined with
`KONG_DATABASE=postgres` — this is essentially "sync on boot." Simpler wiring (no deck job), but
re-runs can be non-deterministic. **Prefer Option A** for idempotency.

**Regardless of option, the `kong.yml` content must change to target sidecars** and add plugins.

### 6a. Service definitions — re-point upstreams to Envoy sidecars

Every `url` currently points at the app's Docker DNS/port (e.g. `http://investor-management:3002`).
Because Envoy inbound is on the mesh at port `9000`, **change every upstream URL to
`http://<app-name>:9000`**. Also add `retries` and `connect_timeout`/`read_timeout` sane values.

Example (representative subset — apply to all 22):
```yaml
services:
  - name: identity-service
    url: http://tenant-identity:9000
  - name: investors-service
    url: http://investor-management:9000
  # ... every url *:80xx becomes *:9000, and no service for api-gateway
```

### 6b. Add plugins (global where applicable)

The old DeCK-less config had **no plugins**. Add these as YAML plugin entities.

**Global plugins** (apply to all routes):
```yaml
plugins:
  # Rate limiting - replace the NestJS in-memory limiter
  - name: rate-limiting
    service: null          # global
    config:
      minute: 1000
      policy: redis
      redis_host: redis
      redis_port: 6379
      redis_password: daos_redis_password
      fault_tolerant: true
      hide_client_headers: false

  # CORS - all routes
  - name: cors
    service: null          # global
    config:
      origins: ['*']
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
      headers:
        - Authorization
        - Content-Type
        - X-Tenant-Id
        - X-Request-Id
      exposed_headers:
        - X-RateLimit-Limit
        - X-RateLimit-Remaining
      credentials: true
      max_age: 3600
      preflight_continue: false

  # Request transformer - normalize/forward tenant & request-id headers
  - name: request-transformer
    service: null          # global
    config:
      add:
        headers:
          - 'x-forwarded-by:kong-gateway'
          - 'x-kong-injected:true'
      remove:
        headers:
          - 'x-kong-debug'
```

**JWT plugin** — apply per-protected route (auth-checked resources). Kong verifies the JWT using
the same secret the identity service signs with. This **replaces** `JwtVerifyMiddleware`:

```yaml
  # Identity/auth endpoints stay open (issuer). All bounded-context routes are protected.
  - name: jwt
    service: investors-service
    config:
      key_claim_name: kid
      claims_to_verify: ['exp']
      anonymous: null
      secret_is_base64: false
      run_on_preflight: true
```

Because `JWT_SECRET=dev-secret-change-me` is a symmetric HS256 secret used by the identity service,
install it into Kong's `/consumers`/`jwt_secrets` or use `issuer`/`audience` claims. Simplest for a
shared symmetric secret is to configure a **consumer + JWT credential per service** or, more
practically for this migration, add the shared secret under a single JWK in the JWT plugin config.

Pragmatic migration note: Because all 22 services use the single shared `JWT_SECRET`, install one
global JWT config pointing at that shared key rather than per-consumer JWTs. (For production,
switch to asymmetric RS256 JWKS — see Step 10.)

### 6c. Consumer for rate-limit keying (optional)

Add a consumer and use `rate-limiting` with `consumer` in the key to enable per-consumer limits
later; for now the global minute limit + redis is sufficient.

---

## 7. Per-Microservice Envoy Sidecars

Every NestJS microservice app gets a **sidekick Envoy dataplane** container alongside it. The
sidecar:
- Registers with `kuma-cp` as a Kuma Dataplane with the app as its inbound target.
- Exposes a virtual inbound on `9000`.
- Sends the app's outbound service traffic into the mesh (mTLS + L7 policies).

Since Kuma's `kumactl generate dataplane` needs pre-known service names, we generate/commit
sidecar manifests under `kuma/dataplanes/` and reference them via volume mounts.

### 7a. Sidecar pattern (apply uniformly to every app container)

Using the **Kuma DP container** pattern (Envoy powered via `kuma-dp`), each microservice pair
looks like:

```yaml
  investor-management:
    image: daos/investor-management:dev      # your NestJS app image
    container_name: daos-investor-management
    restart: unless-stopped
    environment:
      INVESTOR_PORT: '3002'
      # App must bind on loopback so ONLY the sidecar receives external traffic:
      HOST: '127.0.0.1'
      # The app should NOT listen on 0.0.0.0:3002 for inbound mesh traffic.
      DATABASE_URL: postgres://daos:daos_dev_password@postgres:5432/daos
      ...
    networks:
      - mesh
      - infra
    depends_on:
      kuma-cp:
        condition: service_healthy
    healthcheck:
      test: ['CMD-SHELL', 'wget -qO- http://127.0.0.1:3002/health || exit 1']
      interval: 10s
      timeout: 5s
      retries: 5

  investor-management-envoy:
    image: kong/kuma-dp:2.9.1
    container_name: daos-investor-management-envoy
    restart: unless-stopped
    command: run
    environment:
      KUMA_CONTROL_PLANE_URL: http://kuma-cp:5680
      KUMA_DATAPLANE_NAME: investor-management
      KUMA_DATAPLANE_PROXIES_TYPE: dataplane
      KUMA_DATAPLANE_RUNTIME: kubernetes   # or 'universal'; see note
      KUMA_DATAPLANE_DRAIN_TIME: 30s
      KUMA_DATAPLANE_WORKDIR: /kuma
    volumes:
      - ./kuma/dataplanes/investor-management-dp.yaml:/kuma/dataplane.yaml:ro
      - ./kuma/tls:/kuma/tls:ro            # if using TLS/certs
    depends_on:
      kuma-cp:
        condition: service_healthy
    networks:
      - mesh
    ports:
      - '9000:9000'    # virtual inbound, Kong targets this
    healthcheck:
      test: ['CMD', 'wget', '-qO-', 'http://127.0.0.1:9901/admin/stats']  # Envoy admin
      interval: 10s
      timeout: 5s
      retries: 5
```

> Note on `KUMA_DATAPLANE_RUNTIME`: In a standalone/compose setup, the dataplane runs in
> "universal" mode (Kuma's non-K8s mode). Set `KUMA_DATAPLANE_RUNTIME: universal` and provide a
> `Dataplane` resource. The old generated `kumactl generate dataplane` output is the universal
> dataplane spec.

### 7b. Example Dataplane spec (`kuma/dataplanes/investor-management-dp.yaml`)

```yaml
type: Dataplane
mesh: default
name: investor-management
version: "1.0"
networking:
  address: 0.0.0.0
  inbound:
    - port: 9000
      servicePort: 3002
      tags:
        kuma.io/service: investor-management
        kuma.io/protocol: http
  outbound:
    - port: 10001
      tags:
        kuma.io/service: identity-service
    - port: 10002
      tags:
        kuma.io/service: investor-mgmt-db-interface   # example only
```

Explain mapping: `inbound.port` = `9000` (declared/public), `servicePort` = `3002` (the app's real
port). The `outbound` entries map logical service names (which resolve to other sidecars via the
`kuma.io/service` tags) to local ports on the sidecar — the app then calls
`http://127.0.0.1:<outbound-port>` instead of the direct Docker DNS name.

> **Critical behavioral change:** In a full mesh, an app should no longer call another service via
> `http://investor-management:3002` directly. It calls its **local Envoy outbound** at `127.0.0.1:<port>`.
> This means the Microservices' HTTP client base URLs (`IDENTITY_URL`, `INVESTOR_URL`, etc., and
> the `SERVICES` map in the old gateway) must be rewritten to `http://127.0.0.1:<outbound-port>`.
> See Step 8.

### 7c. Reusing one generic sidecar template

To keep `docker-compose.yml` manageable with 20+ sidecar services, use an **anchor/YAML extension**
framework field. e.g.:

```yaml
x-sidecar: &sidecar
  image: kong/kuma-dp:2.9.1
  restart: unless-stopped
  command: run
  networks: ['mesh']
  depends_on:
    kuma-cp: { condition: service_healthy }
  environment:
    KUMA_CONTROL_PLANE_URL: http://kuma-cp:5680
    KUMA_DATAPLANE_RUNTIME: universal
    KUMA_DATAPLANE_DRAIN_TIME: 30s
  volumes:
    - ./kuma/tls:/kuma/tls:ro

services:
  investor-management-envoy:
    <<: *sidecar
    container_name: daos-investor-management-envoy
    environment:
      KUMA_DATAPLANE_NAME: investor-management
    volumes:
      - ./kuma/dataplanes/investor-management-dp.yaml:/kuma/dataplane.yaml:ro
    ports: ['9000:9000']
  # ... repeat with unique container_name, KUMA_DATAPLANE_NAME, dp file, and outbound ports
```

---

## 8. Changes to the NestJS `api-gateway` App (Simplify)

Since Kong now owns routing/edge concerns, the `api-gateway`'s Node-side proxying should be
**removed**. Exact scoped changes:

### 8a. Delete proxy machinery
- `apps/api-gateway/src/main.ts`: remove `SERVICES`, `proxyToIdentity`, `proxyToService`, and
  both `app.use(...)` blocks (lines 10–40, 42–99, 105–141). Keep the Nest bootstrap, ValidationPipe,
  Swagger, and the `/me` controller only.

### 8b. Remove rate-limit + JWT from the gateway
These move to Kong plugins:
- Delete `src/middleware/rate-limit.middleware.ts`, `src/rate-limit/*`.
- Delete `src/auth/jwt-verify.middleware.ts` (Kong `jwt` plugin replaces it).
- Keep `src/middleware/tenant-resolution.middleware.ts` only if `/me` still needs tenant keying;
  otherwise remove.

### 8c. Keep only the `/me` composition
- Keep `src/me/me.controller.ts` and `src/proxy/identity-http.client.ts`.
- Rewrite `src/gateway.module.ts` to not register the removed middleware/limiter. Because the
  gateway runs **inside the mesh**, `IdentityHttpClient`'s base URL
  (`http://localhost:3001`) becomes the Envoy outbound URL `http://127.0.0.1:10001` (mapping to
  `identity-service`).

New `gateway.module.ts`:
```ts
import { Module } from '@nestjs/common';
import { MeController } from './me/me.controller';
import { IdentityHttpClient } from './proxy/identity-http.client';

@Module({
  controllers: [MeController],
  providers: [IdentityHttpClient],
})
export class GatewayModule {}
```

### 8d. Update service URLs in the microservices
Every NestJS service that makes outbound HTTP calls to a sibling service must switch from Docker
DNS (`http://investor-management:3002`) to the local Envoy outbound (`http://127.0.0.1:<outbound-port>`):
- `IDENTITY_URL` → `http://127.0.0.1:<outbound-port-for-identity>`
- Similar for `*_URL` env vars and any hardcoded URLs in `*.http.client.ts` files.

This is the single most invasive, error-prone change — inventory each app's `process.env.*_URL`
usage and map it to a corresponding dataplane `outbound` entry.

---

## 9. Service Definitions (`services.yaml` / mesh resources)

Kuma is configured via Mesh *resources* (not a single "services.yaml" in K8s style). Create a
`kuma/` config directory with mesh-wide policies applied through `kumactl` or CP REST:

```
kuma/
├── dataplanes/
│   ├── identity-dp.yaml
│   ├── investor-management-dp.yaml
│   └── ... (one per service)
├── tls/
│   ├── tls.crt
│   └── tls.key
└── policies/
    ├── mesh-default.yaml        # enables mTLS
    └── mesh-traffic-permissions.yaml
```

### 9a. Enable mTLS (`kuma/policies/mesh-default.yaml`)

```yaml
type: Mesh
name: default
mtls:
  enabledBackend: builtin
  backends:
    - name: builtin
      type: builtin
      dpCert:
        rotation: { expiration: 1d }
      conf:
        caCert:
          RSAbits: 2048
```

Apply with:
```bash
kumactl apply -f kuma/policies/mesh-default.yaml --context ...
# or curl -X PUT http://localhost:5681/meshes/default
```

### 9b. Default-deny traffic permissions (`kuma/policies/mesh-traffic-permissions.yaml`)

```yaml
type: MeshTrafficPermission
name: daos-default-deny
mesh: default
spec:
  targetRef:
    kind: Mesh
  from:
    - targetRef:
        kind: Mesh
      default:
        action: Deny
```

Followed by explicit `Allow` policies per (source → destination) pair you want to permit. This
implements least-privilege: nothing talks to anything unless allowed.

### 9c. Optional L7 traffic route (HTTP routing within mesh)

For route-based redirection through Envoy (not strictly needed since Kong already routes by path),
you may add `MeshHTTPRoute` resources. For this migration, plain mTLS + the builtin mesh routing
is sufficient; keep Kong as the single L7 path router.

---

## 10. Verification & Rollout Order

1. **Generate TLS** (`kuma/tls`), then `docker compose build` all app images (if not already built).
2. **Bring up infra first:** `docker compose up -d postgres redis zookeeper kafka schema-registry`.
3. **Bring up mesh CP:** `docker compose up -d kuma-cp`; verify `http://localhost:5681/health`.
4. **Apply mesh policies** (mTLS + default-deny) via `kumactl apply`.
5. **Bring up Kong stack:** `docker compose up -d kong-db kong-migration kong-gateway kong-import`;
   verify `http://localhost:8001` (Admin API) and that plugins are listed (`/plugins`).
6. **Bring up sidecars before apps** (so apps are never exposed unmasked), then apps. Verify Envoy
   admin at `127.0.0.1:9901` and zero rejected dataplanes in `kuma-cp` logs.
7. **End-to-end sanity:** `curl http://localhost:8000/investors` after issuing a JWT via
   `/auth`; confirm Kong's `jwt` plugin enforces auth, `rate-limiting` returns `429` after the
   burst, `cors` preflight works, and the mesh completes mTLS handshakes.
8. **Remove old `kong` service** from compose once `kong-gateway` proves green (this plan replaces
   it rather than running both).

### Health checks (summary of all new services)
| Service | Healthcheck |
|---------|-------------|
| `kuma-cp` | `wget http://localhost:5681/health` |
| `kong-db` | `pg_isready -U kong` |
| `kong-gateway` | `kong health` |
| per-app | `wget http://127.0.0.1:<port>/health` |
| per-envoy | `wget http://127.0.0.1:9901/admin/stats` |

---

## 11. Env / Dockerfile prep (prerequisite)

The microservices currently have **no Dockerfiles** (this repo builds/runs via `nest start`). To
mesh them you must first containerize each:
- Add a root `Dockerfile` (multi-stage: `node:22-alpine` build → runtime) that runs
  `nest build <app>` for each app, producing `dist/apps/<app>/main.js`.
- Add `docker-compose` `build:` blocks or pre-built images for each of the 20+ apps.
- Each app must bind to `127.0.0.1` (loopback) so only Envoy exposes it on the mesh — set `HOST`
  env or `app.listen(port, '127.0.0.1')`.
- Each app should expose a `/health` endpoint consumed by the app healthcheck.

---

## 12. File / Change Summary

**New files**
- `kuma/tls/tls.crt`, `kuma/tls/tls.key` (generated)
- `kuma/dataplanes/*-dp.yaml` (one per service)
- `kuma/policies/mesh-default.yaml`, `kuma/policies/mesh-traffic-permissions.yaml`
- `kong/kong-import.yml` (or reuse `kong/kong.yml` with new upstreams + plugins)
- `Dockerfile` (root, multi-stage for all apps)

**Modified files**
- `docker-compose.yml` — add `kong-db`, `kong-migration`, `kong-import`, `kong-gateway`
  (replaces `kong`), `kuma-cp`, plus one app+sidecar pair per microservice; add `mesh`, `infra`,
  `kong-db` networks and `kong_db_data` volume.
- `docker-compose.override.yml` — add dev port exposures for sidecars if host access is wanted.
- `kong/kong.yml` — re-point upstream URLs to `:9000`, add plugins (jwt, rate-limiting, cors,
  request-transformer), remove `_transform`.
- `apps/api-gateway/src/gateway.module.ts`, `main.ts` — strip routing/rate-limit/JWT.
- Delete: `apps/api-gateway/src/rate-limit/*`, `apps/api-gateway/src/auth/jwt-verify.middleware.ts`.
- `.env` — add Kuma/Kong DB creds, and adjust `*_URL` values to Envoy outbound ports.
- `package.json` — add `nest build` entries for newly containerized apps (compliance, governance,
  tenant-organization, etc. that aren't in the `build` script yet).

---

## 13. Follow-ups / Hardening (out of this migration's first pass)

1. Back Kuma CP with Postgres (`kuma-db`) for durable state instead of in-memory.
2. Swap shared HMAC `JWT_SECRET` for asymmetric RS256 + JWKS for Kong's `jwt` and the identity
   signer.
3. Move to per-consumer JWT credentials and per-consumer rate-limit keys.
4. Add `MeshCircuitBreaker`, `MeshRetry`, `MeshTimeout`, and `MeshRateLimit` policies inside the
   mesh rather than at Kong only.
5. Add `KONG_ADMIN_LISTEN` TLS + admin RBAC token (`KONG_PASSWORD`) before exposing Admin API
   beyond localhost.
6. Generate dataplane tokens + rotate CP certs (remove `KUMA_DP_SERVER_AUTH_TYPE: none`).
7. Add distributed tracing (Envoy → OpenTelemetry collector) and log aggregation for the mesh.
