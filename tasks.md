# DAOS Platform — Implementation Tasks

## Overview

Full implementation plan for the DAOS multi-tenant private capital market platform.
Sub-Project #1 (Tenant/Identity + API Gateway foundation) is **complete**.
This document tracks Sub-Projects #2–#10.

**Conventions (binding for every sub-project):**
- Domain layer first; never import infrastructure from domain
- Every aggregate extends `AggregateRoot` from `@daos/shared-kernel`
- Every domain event extends `DomainEvent`; event type is past-tense
- Every repository port takes `tenantId`; compile-time tenant scoping
- Money = `Money` (bigint + ISO currency); never `number`/`float`
- Typed IDs everywhere — never raw strings for entity references
- NestJS CQRS module for all command/query handlers
- Outbox pattern for all domain event publishing
- `class-validator` DTOs at every application-layer boundary
- Swagger/OpenAPI on every HTTP controller

---

## Sub-Project #2 — Infrastructure Adapters

**Status:** [ ] Not started  
**Depends on:** Sub-Project #1 (complete)  
**Unblocks:** All subsequent sub-projects

### Goals
Replace all in-memory adapters with production-grade infrastructure.
Establish reusable patterns (TypeORM base entity, RLS helper, Kafka relay)
that every later service copies.

### Tasks

- [ ] **2.1** Add `docker-compose.yml` — postgres, redis, kafka, zookeeper, schema-registry
- [ ] **2.2** Add `docker-compose.override.yml` — dev overrides (ports, volumes)
- [ ] **2.3** Install production dependencies: `@nestjs/typeorm`, `typeorm`, `pg`, `ioredis`, `kafkajs`, `@nestjs/microservices`
- [ ] **2.4** Create `libs/shared-kernel/src/infrastructure/` — `TenantScopedEntity` TypeORM base, `PostgresRepository` base with RLS helper, `KafkaOutboxRelay` base
- [ ] **2.5** Add Flyway migration baseline: `db/migrations/tenant_identity/V1__baseline.sql`
- [ ] **2.6** Implement `PostgresTenantRepository` (tenant-identity)
- [ ] **2.7** Implement `PostgresUserRepository` (tenant-identity)
- [ ] **2.8** Implement `PostgresRoleRepository` (tenant-identity)
- [ ] **2.9** Implement `RedisIdempotencyStore` (replaces in-memory)
- [ ] **2.10** Implement `RedisRateLimiter` for API gateway (replaces in-memory)
- [ ] **2.11** Implement `KafkaOutboxPublisher` for tenant-identity
- [ ] **2.12** Wire real adapters into `TenantIdentityModule` behind feature flag / env switch
- [ ] **2.13** TestContainers integration tests: all 3 Postgres repos
- [ ] **2.14** TestContainers integration test: `RedisIdempotencyStore`
- [ ] **2.15** E2E test suite (supertest): full golden path through gateway
- [ ] **2.16** Extend `.env.example` with `DATABASE_URL`, `REDIS_URL`, `KAFKA_BROKERS`

---

## Sub-Project #3 — Investor Management & Accreditation

**Status:** [x] Complete  
**Depends on:** Sub-Project #2  
**Unblocks:** Issuance (#6), Distribution (#7), Marketplace (#8), Compliance (#10)

### Domain Model
- **Aggregates:** `Investor`, `KycProfile`, `BeneficialOwner`
- **Value Objects:** `InvestorProfile`, `AccreditationLevel`, `RiskProfile`, `KycDocument`, `AccreditationStatus`, `KycStatus`
- **Domain Events:** `KycSubmitted`, `KycApproved`, `KycRejected`, `AccreditationVerified`, `AccreditationExpired`, `WalletLinked`, `InvestorApproved`, `InvestorSuspended`
- **Domain Services:** `AccreditationVerificationService`, `SuitabilityAssessor`
- **Ports:** `InvestorRepository`, `KycProfileRepository`, `KycProviderPort`

### Tasks

- [x] **3.1** Scaffold `apps/investor-management/` NestJS app (port 3002)
- [x] **3.2** Add to `nest-cli.json` and `tsconfig.json` paths
- [x] **3.3** Create `libs/investor-api/` shared DTOs library
- [x] **3.4** Domain: `InvestorId`, `KycProfileId`, `BeneficialOwnerId`, `WalletId` typed IDs
- [x] **3.5** Domain: value objects — `InvestorProfile`, `AccreditationLevel`, `RiskProfile`, `KycDocument`, `AccreditationStatus`, `KycStatus`
- [x] **3.6** Domain: `KycProfile` entity
- [x] **3.7** Domain: `BeneficialOwner` entity
- [x] **3.8** Domain: `Investor` aggregate root (full lifecycle + invariants)
- [x] **3.9** Domain: 8 domain events
- [x] **3.10** Domain: `InvestorRepository`, `KycProfileRepository` ports
- [x] **3.11** Domain: `AccreditationVerificationService` domain service
- [x] **3.12** Domain: `SuitabilityAssessor` domain service
- [x] **3.13** Application: commands — `RegisterInvestor`, `SubmitKyc`, `ApproveKyc`, `RejectKyc`, `VerifyAccreditation`, `LinkWallet`, `UpdateRiskProfile`, `SuspendInvestor`
- [x] **3.14** Application: queries — `GetInvestor`, `ListInvestors`, `GetKycProfile`, `CheckInvestorEligibility`
- [x] **3.15** Application: all DTOs with class-validator
- [x] **3.16** Infrastructure: `PostgresInvestorRepository`
- [x] **3.17** Infrastructure: `PostgresKycProfileRepository`
- [x] **3.18** Infrastructure: `SumsubKycAdapter` (stub behind `KycProviderPort`)
- [x] **3.19** Infrastructure: `KafkaOutboxPublisher` for investor events
- [x] **3.20** Interface: `InvestorController`, `KycController` with Swagger
- [x] **3.21** Interface: `InvestorGrpcService` (for marketplace pre-trade checks)
- [x] **3.22** Wire `InvestorManagementModule`
- [x] **3.23** Flyway migration: `db/migrations/investor_management/V1__baseline.sql`
- [x] **3.24** Unit tests: aggregate invariants, domain services
- [x] **3.25** Add proxy route `investors` to API gateway

---

## Sub-Project #4 — Asset Origination + Opportunity Engineering

**Status:** [x] Complete  
**Depends on:** Sub-Project #2  
**Unblocks:** Deal Structuring (#5), Issuance (#6), Pricing (#9)

### Domain Model — Asset Origination
- **Aggregates:** `Asset`, `DueDiligenceReport`, `CashFlowModel`
- **Value Objects:** `AssetClass`, `AssetStatus`, `ValuationMethodology`, `Collateral`, `ProvenanceRecord`, `Finding`, `DDRating`
- **Domain Events:** `AssetOriginated`, `DueDiligenceCompleted`, `ValuationUpdated`, `AssetApproved`, `AssetRejected`
- **Ports:** `AssetRepository`, `DueDiligenceReportRepository`, `ValuationEnginePort`

### Domain Model — Opportunity Engineering
- **Aggregates:** `Opportunity`, `ScenarioModel`
- **Value Objects:** `TargetReturnProfile`, `OpportunityScore`, `SensitivityFactor`, `OpportunityStatus`, `ScenarioType`
- **Domain Events:** `OpportunityEngineered`, `ScenarioApproved`, `OpportunityApproved`, `OpportunityRejected`, `StructureOptimized`
- **Domain Services:** `MonteCarloSimulationService`, `OpportunityScoringEngine`
- **Ports:** `OpportunityRepository`, `ScenarioModelRepository`

### Tasks

- [x] **4.1** Scaffold `apps/asset-origination/` (port 3003)
- [x] **4.2** Scaffold `apps/opportunity-engineering/` (port 3004)
- [x] **4.3** Create `libs/asset-api/` shared DTOs library
- [x] **4.4** Domain (asset): typed IDs — `AssetId`, `DueDiligenceReportId`, `CashFlowModelId`
- [x] **4.5** Domain (asset): value objects
- [x] **4.6** Domain (asset): `DueDiligenceReport` entity, `CashFlowModel` aggregate
- [x] **4.7** Domain (asset): `Asset` aggregate root
- [x] **4.8** Domain (asset): 5 domain events
- [x] **4.9** Domain (asset): repository ports + `ValuationEnginePort`
- [x] **4.10** Application (asset): commands — `OriginateAsset`, `SubmitDueDiligence`, `CompleteDueDiligence`, `UpdateValuation`, `ApproveAsset`, `RejectAsset`
- [x] **4.11** Application (asset): queries — `GetAsset`, `ListAssets`, `GetDueDiligenceReport`
- [x] **4.12** Infrastructure (asset): Postgres repositories, stub valuation adapter
- [x] **4.13** Interface (asset): `AssetController`, `DueDiligenceController` with Swagger
- [x] **4.14** Domain (opportunity): typed IDs — `OpportunityId`, `ScenarioModelId`
- [x] **4.15** Domain (opportunity): value objects
- [x] **4.16** Domain (opportunity): `ScenarioModel` aggregate, `Opportunity` aggregate root
- [x] **4.17** Domain (opportunity): 5 domain events
- [x] **4.18** Domain (opportunity): `MonteCarloSimulationService`, `OpportunityScoringEngine`
- [x] **4.19** Application (opportunity): commands — `EngineerOpportunity`, `AddScenario`, `ApproveScenario`, `ScoreOpportunity`, `ApproveOpportunity`, `RejectOpportunity`
- [x] **4.20** Application (opportunity): queries — `GetOpportunity`, `ListOpportunities`, `GetScenarioModel`
- [x] **4.21** Infrastructure (opportunity): Postgres repositories
- [x] **4.22** Interface (opportunity): `OpportunityController` with Swagger
- [x] **4.23** Flyway migrations for both schemas
- [x] **4.24** Unit tests: aggregate invariants, `MonteCarloSimulationService`, `OpportunityScoringEngine`
- [x] **4.25** Add proxy routes `assets`, `opportunities` to API gateway

---

## Sub-Project #5 — Deal Structuring + Legal Entity + Product Design Studio

**Status:** [x] Complete  
**Depends on:** Sub-Project #4  
**Unblocks:** Issuance (#6), Distribution (#7)

### Domain Model — Deal Structuring
- **Aggregates:** `Deal`, `TermSheet`
- **Value Objects:** `CapitalStack`, `CapitalTranche`, `GovernanceTerms`, `EconomicRights`, `VestingSchedule`, `TransferRestriction`, `ClosingCondition`, `DealStatus`
- **Domain Events:** `DealStructured`, `TermSheetFinalized`, `ClosingConditionMet`, `DealApproved`, `DealClosed`, `DealCancelled`
- **Domain Services:** `CapitalStackValidator`, `ClosingConditionChecker`

### Domain Model — Legal Entity Structuring
- **Aggregates:** `LegalEntity`, `CorporateDocument`
- **Value Objects:** `EntityType`, `EntityStatus`, `EntityHierarchyNode`, `RegisteredAgent`, `BeneficialOwnerRecord`, `EntityDocument`, `SignatureStatus`, `Signatory`, `CorporateDocType`
- **Domain Events:** `EntityFormed`, `EntityActivated`, `HierarchyUpdated`, `DocumentGenerated`, `RegisteredAgentAppointed`, `EntityDissolved`
- **Ports:** `LegalFormationProvider`, `ESignatureProvider`

### Domain Model — Investment Product Design
- **Aggregates:** `InvestmentProduct`, `ShareClass`
- **Value Objects:** `ProductType`, `ProductStrategy`, `ConcentrationLimit`, `Benchmark`, `LiquidityTerms`, `FeeStructure`, `ProductStatus`, `InvestmentRestriction`
- **Domain Events:** `ProductDesigned`, `ShareClassCreated`, `FeeStructureApproved`, `ProductApproved`, `ProductClosed`
- **Domain Services:** `FeeModelCalculator`, `MandateRuleEngine`

### Tasks

- [x] **5.1** Scaffold `apps/deal-studio/` (port 3005)
- [x] **5.2** Scaffold `apps/legal-entity-studio/` (port 3006)
- [x] **5.3** Scaffold `apps/product-design-studio/` (port 3007)
- [x] **5.4** Shared DTOs for the deal/entity/product contexts (per-app `application/dto` modules; no separate `libs/deal-api` lib created — keeps builds green)
- [x] **5.5** Domain (deal): typed IDs — `DealId`, `TermSheetId`
- [x] **5.6** Domain (deal): all value objects
- [x] **5.7** Domain (deal): `TermSheet` entity, `Deal` aggregate root
- [x] **5.8** Domain (deal): 6 domain events
- [x] **5.9** Domain (deal): `CapitalStackValidator`, `ClosingConditionChecker` domain services
- [x] **5.10** Application (deal): commands — `StructureDeal`, `UpdateCapitalStack`, `FinalizeTermSheet`, `MeetClosingCondition`, `ApproveDeal`, `CloseDeal`, `CancelDeal`
- [x] **5.11** Application (deal): queries — `GetDeal`, `ListDeals`, `GetTermSheet`
- [x] **5.12** Infrastructure (deal): Postgres repositories
- [x] **5.13** Interface (deal): `DealController`, `TermSheetController` with Swagger
- [x] **5.14** Domain (entity): typed IDs — `LegalEntityId`, `CorporateDocumentId`
- [x] **5.15** Domain (entity): all value objects
- [x] **5.16** Domain (entity): `CorporateDocument` aggregate, `LegalEntity` aggregate root
- [x] **5.17** Domain (entity): 6 domain events
- [x] **5.18** Domain (entity): `LegalFormationProvider`, `ESignatureProvider` ports
- [x] **5.19** Application (entity): commands — `FormLegalEntity`, `ActivateEntity`, `AddEntityDocument`, `UpdateEntityHierarchy`, `DissolveLegalEntity`
- [x] **5.20** Application (entity): queries — `GetLegalEntity`, `ListLegalEntities`, `GetEntityHierarchy`
- [x] **5.21** Infrastructure (entity): Postgres repositories, stub `LegalFormationApiAdapter`, stub `DocuSignAdapter`
- [x] **5.22** Interface (entity): `LegalEntityController`, `CorporateDocumentController` with Swagger
- [x] **5.23** Domain (product): typed IDs — `InvestmentProductId`, `ShareClassId`
- [x] **5.24** Domain (product): all value objects
- [x] **5.25** Domain (product): `ShareClass` entity, `InvestmentProduct` aggregate root
- [x] **5.26** Domain (product): 5 domain events
- [x] **5.27** Domain (product): `FeeModelCalculator`, `MandateRuleEngine` domain services
- [x] **5.28** Application (product): commands — `DesignProduct`, `AddShareClass`, `UpdateFeeStructure`, `SubmitProductForApproval`, `ApproveProduct`, `CloseProduct`
- [x] **5.29** Application (product): queries — `GetProduct`, `ListProducts`, `GetShareClass`, `CalculateFeeProjection`
- [x] **5.30** Infrastructure (product): Postgres repositories
- [x] **5.31** Interface (product): `ProductController`, `ShareClassController` with Swagger
- [x] **5.32** Flyway migrations for all 3 schemas
- [x] **5.33** Unit tests: aggregate invariants, `CapitalStackValidator`, `FeeModelCalculator`, `MandateRuleEngine`
- [x] **5.34** Add proxy routes `deals`, `entities`, `products` to API gateway

---

## Sub-Project #6 — Issuance Studio + Document Management + Cap Table

**Status:** [x] Complete  
**Depends on:** Sub-Projects #3, #5  
**Unblocks:** Distribution (#7), Marketplace (#8), Waterfall (#9)

### Domain Model — Issuance Studio
- **Aggregates:** `Issuance`, `MintRequest`
- **Value Objects:** `InstrumentType`, `TokenStandard`, `BlockchainNetwork`, `IssuanceStatus`, `MintStatus`, `WhitelistEntry`, `TokenTransferRestriction`
- **Domain Events:** `IssuanceCreated`, `LegalDocsSigned`, `TokenMinted`, `WhitelistUpdated`, `TransferRestrictionApplied`, `CapTableSynced`
- **Ports:** `BlockchainGatewayPort`, `TokenStandardProvider`
- **Domain Services:** `IssuanceWorkflowOrchestrator`

### Domain Model — Document Management
- **Aggregates:** `Document`, `DocumentVersion`
- **Value Objects:** `DocumentCategory`, `EntityReference`
- **Domain Events:** `DocumentUploaded`, `DocumentVersionAdded`
- **Ports:** `DocumentStoragePort`

### Domain Model — Cap Table
- **Aggregates:** `CapTable`, `ShareholderRecord`
- **Value Objects:** `TransferLog`
- **Domain Events:** `CapTableUpdated`, `TransferRecorded`, `CapTableSynced`

### Tasks

- [x] **6.1** Scaffold `apps/issuance-studio/` (port 3008)
- [x] **6.2** Scaffold `apps/document-management/` (port 3015)
- [x] **6.3** Create `libs/issuance-api/` shared DTOs library
- [x] **6.4** Domain (issuance): typed IDs — `IssuanceId`, `MintRequestId`
- [x] **6.5** Domain (issuance): all value objects
- [x] **6.6** Domain (issuance): `MintRequest` entity, `Issuance` aggregate root
- [x] **6.7** Domain (issuance): 6 domain events
- [x] **6.8** Domain (issuance): `BlockchainGatewayPort`, `TokenStandardProvider` ports
- [x] **6.9** Domain (issuance): `IssuanceWorkflowOrchestrator` domain service
- [x] **6.10** Application (issuance): commands — `CreateIssuance`, `SignIssuanceLegalDocs`, `RequestTokenMint`, `ConfirmTokenMint`, `AddToWhitelist`, `RemoveFromWhitelist`, `SyncCapTable`
- [x] **6.11** Application (issuance): queries — `GetIssuance`, `ListIssuances`, `GetWhitelist`, `GetMintRequest`
- [x] **6.12** Infrastructure (issuance): Postgres repository, stub `BlockchainGatewayAdapter` (ERC-1400/ERC-3643 interface)
- [x] **6.13** Interface (issuance): `IssuanceController`, `WhitelistController` with Swagger
- [x] **6.14** Domain (document): typed IDs — `DocumentId`, `DocumentVersionId`
- [x] **6.15** Domain (document): value objects, `DocumentVersion` entity, `Document` aggregate root
- [x] **6.16** Domain (document): 2 domain events, `DocumentStoragePort`
- [x] **6.17** Application (document): commands — `UploadDocument`, `AddDocumentVersion`
- [x] **6.18** Application (document): queries — `GetDocument`, `ListDocuments`, `GetDocumentVersion`, `GenerateDownloadUrl`
- [x] **6.19** Infrastructure (document): Postgres repository, `S3DocumentStorageAdapter` (stub)
- [x] **6.20** Interface (document): `DocumentController` with Swagger
- [x] **6.21** Domain (cap table): typed IDs — `CapTableId`, `ShareholderRecordId`
- [x] **6.22** Domain (cap table): `ShareholderRecord` entity, `CapTable` aggregate root
- [x] **6.23** Domain (cap table): 3 domain events
- [x] **6.24** Application (cap table): commands — `InitializeCapTable`, `TransferShares`, `SyncCapTableFromChain`
- [x] **6.25** Application (cap table): queries — `GetCapTable`, `GetShareholderRecord`, `GetCapTableWaterfallView`
- [x] **6.26** Infrastructure (cap table): Postgres repository
- [x] **6.27** Interface (cap table): `CapTableController` with Swagger
- [x] **6.28** Flyway migrations for all 3 schemas
- [x] **6.29** Unit tests: aggregate invariants, `IssuanceWorkflowOrchestrator`
- [x] **6.30** Add proxy routes `issuances`, `documents`, `cap-tables` to API gateway

---

## Sub-Project #7 — Distribution & Capital Raising

**Status:** [x] Complete  
**Depends on:** Sub-Projects #3, #6  
**Unblocks:** Marketplace (#8), Waterfall (#9)

### Domain Model
- **Aggregates:** `Subscription`, `Allocation`, `CapitalCall`, `Closing`
- **Value Objects:** `SubscriptionStatus`, `AllocationMethod`, `AllocationStatus`, `CapitalCallStatus`, `ClosingStatus`, `SubscriptionAllocation`
- **Domain Events:** `SubscriptionReceived`, `SubscriptionDocumentsSent`, `SubscriptionExecuted`, `AllocationApproved`, `SubscriptionFunded`, `SubscriptionRejected`, `CapitalCallIssued`, `CapitalCallFunded`, `ClosingCompleted`
- **Ports:** `PaymentGatewayPort`, `EscrowProvider`
- **Domain Services:** `AllocationEngine`, `CapitalCallCalculator`

### Tasks

- [x] **7.1** Scaffold `apps/distribution/` (port 3009)
- [x] **7.2** Create `libs/distribution-api/` shared DTOs library
- [x] **7.3** Domain: typed IDs — `SubscriptionId`, `AllocationId`, `CapitalCallId`, `ClosingId`
- [x] **7.4** Domain: all value objects
- [x] **7.5** Domain: `SubscriptionAllocation` VO, `Allocation` aggregate, `CapitalCall` aggregate
- [x] **7.6** Domain: `Closing` aggregate, `Subscription` aggregate root
- [x] **7.7** Domain: 9 domain events
- [x] **7.8** Domain: `PaymentGatewayPort`, `EscrowProvider` ports
- [x] **7.9** Domain: `AllocationEngine`, `CapitalCallCalculator` domain services
- [x] **7.10** Application: commands — `ReceiveSubscription`, `SendSubscriptionDocuments`, `ExecuteSubscriptionDocuments`, `AllocateSubscriptions`, `FundSubscription`, `RejectSubscription`, `IssueCapitalCall`, `FundCapitalCall`, `CompleteClosing`
- [x] **7.11** Application: queries — `GetSubscription`, `ListSubscriptions`, `GetAllocation`, `GetCapitalCall`, `GetClosing`, `GetFundraisingProgress`
- [x] **7.12** Infrastructure: Postgres repositories, stub `StripePaymentAdapter`, stub `EscrowAdapter`
- [x] **7.13** Interface: `SubscriptionController`, `AllocationController`, `CapitalCallController`, `ClosingController` with Swagger
- [x] **7.14** Flyway migration
- [x] **7.15** Unit tests: aggregate invariants, `AllocationEngine` (pro-rata), `CapitalCallCalculator`
- [x] **7.16** Add proxy routes `subscriptions`, `capital-calls`, `closings` to API gateway

---

## Sub-Project #8 — Marketplace + Settlement & Clearing

**Status:** [x] Complete  
**Depends on:** Sub-Projects #3, #6, #7  
**Unblocks:** Waterfall (#9), Compliance (#10)

### Domain Model — Marketplace
- **Aggregates:** `Listing`, `Order`, `Trade`
- **Value Objects:** `ListingType`, `TradingMechanism`, `ListingStatus`, `OrderType`, `OrderSide`, `OrderStatus`, `PriceDiscovery`, `MarketSession`, `TradeStatus`
- **Domain Events:** `ListingPublished`, `ListingSuspended`, `ListingDelisted`, `OrderPlaced`, `OrderFilled`, `OrderPartiallyFilled`, `OrderCancelled`, `TradeExecuted`
- **Domain Services:** `OrderMatchingEngine`, `CompliancePreTradeCheck`

### Domain Model — Settlement
- **Aggregates:** `SettlementInstruction`, `CustodyAccount`
- **Value Objects:** `SettlementType`, `SettlementCycle`, `SettlementParty`, `SettlementStatus`, `CustodyType`, `Holding`
- **Domain Events:** `SettlementInitiated`, `SettlementMatched`, `TradeSettled`, `SettlementFailed`, `CustodyUpdated`
- **Ports:** `CustodianBankPort`, `BlockchainSettlementPort`

### Tasks

- [x] **8.1** Scaffold `apps/marketplace/` (port 3010)
- [x] **8.2** Scaffold `apps/settlement/` (port 3012)
- [x] **8.3** Create `libs/marketplace-api/` shared DTOs library
- [x] **8.4** Domain (marketplace): typed IDs — `ListingId`, `OrderId`, `TradeId`
- [x] **8.5** Domain (marketplace): all value objects
- [x] **8.6** Domain (marketplace): `Order` aggregate, `Trade` aggregate, `Listing` aggregate root
- [x] **8.7** Domain (marketplace): 8 domain events
- [x] **8.8** Domain (marketplace): `OrderMatchingEngine` domain service (price-time priority)
- [x] **8.9** Domain (marketplace): `CompliancePreTradeCheck` domain service
- [x] **8.10** Application (marketplace): commands — `PublishListing`, `SuspendListing`, `DelistListing`, `PlaceOrder`, `CancelOrder`, `ExecuteTrade`
- [x] **8.11** Application (marketplace): queries — `GetListing`, `ListListings`, `GetOrderBook`, `GetOrder`, `ListOrders`, `GetTrade`, `ListTrades`
- [x] **8.12** Infrastructure (marketplace): Postgres repositories, Redis order book cache
- [x] **8.13** Interface (marketplace): `ListingController`, `OrderController`, `TradeController` with Swagger
- [x] **8.14** Domain (settlement): typed IDs — `SettlementInstructionId`, `CustodyAccountId`
- [x] **8.15** Domain (settlement): all value objects
- [x] **8.16** Domain (settlement): `CustodyAccount` aggregate, `SettlementInstruction` aggregate root
- [x] **8.17** Domain (settlement): 5 domain events, `CustodianBankPort`, `BlockchainSettlementPort`
- [x] **8.18** Application (settlement): commands — `InitiateSettlement`, `MatchSettlement`, `ConfirmSettlement`, `FailSettlement`
- [x] **8.19** Application (settlement): queries — `GetSettlementInstruction`, `GetCustodyAccount`, `ListPendingSettlements`
- [x] **8.20** Infrastructure (settlement): Postgres repositories, stub `CustodianBankAdapter`, stub `BlockchainSettlementAdapter`
- [x] **8.21** Interface (settlement): `SettlementController`, `CustodyController` with Swagger
- [x] **8.22** Flyway migrations for both schemas
- [x] **8.23** Unit tests: `OrderMatchingEngine`, `CompliancePreTradeCheck`, settlement lifecycle
- [x] **8.24** Add proxy routes `listings`, `orders`, `trades`, `settlements` to API gateway

---

## Sub-Project #9 — Waterfall Engine + Pricing & Valuation + Corporate Actions

**Status:** [x] Complete  
**Depends on:** Sub-Projects #6, #7, #8  
**Unblocks:** Compliance (#10), Reporting (#10)

### Domain Model — Waterfall Engine & Corporate Actions
- **Aggregates:** `WaterfallModel`, `Distribution`, `CorporateAction`
- **Value Objects:** `WaterfallType`, `WaterfallTier`, `WaterfallTierType`, `DistributionType`, `DistributionStatus`, `InvestorDistribution`, `CorporateActionType`, `CorporateActionStatus`, `InvestorElection`
- **Domain Events:** `WaterfallModelApproved`, `DistributionCalculated`, `DistributionDeclared`, `DistributionApproved`, `DistributionPaid`, `PromoteDistributed`, `CorporateActionAnnounced`, `ElectionClosed`, `CorporateActionExecuted`
- **Domain Services:** `WaterfallCalculationService`, `TaxWithholdingCalculator`

### Domain Model — Pricing & Valuation
- **Aggregates:** `Price`, `ValuationModel`
- **Value Objects:** `PricingSource`, `FairValueHierarchy`, `ValuationModelType`, `ReviewStatus`
- **Domain Events:** `PriceUpdated`, `StalePriceDetected`, `ValuationDiscrepancyDetected`, `ValuationModelRun`, `ValuationApproved`, `ValuationRejected`
- **Ports:** `PricingVendorPort`, `ValuationAgentPort`

### Tasks

- [x] **9.1** Scaffold `apps/waterfall-engine/` (port 3011)
- [x] **9.2** Scaffold `apps/pricing-valuation/` (port 3018)
- [x] **9.3** Create `libs/waterfall-api/` shared DTOs library
- [x] **9.4** Domain (waterfall): typed IDs — `WaterfallModelId`, `DistributionId`, `CorporateActionId`
- [x] **9.5** Domain (waterfall): all value objects
- [x] **9.6** Domain (waterfall): `Distribution` aggregate, `CorporateAction` aggregate, `WaterfallModel` aggregate root
- [x] **9.7** Domain (waterfall): 9 domain events
- [x] **9.8** Domain (waterfall): `WaterfallCalculationService` (tiered cascade, American/European/hybrid)
- [x] **9.9** Domain (waterfall): `TaxWithholdingCalculator` (W-8BEN/FATCA/CRS)
- [x] **9.10** Application (waterfall): commands — `CreateWaterfallModel`, `ApproveWaterfallModel`, `DeclareDistribution`, `CalculateDistribution`, `ApproveDistribution`, `PayDistribution`, `AnnounceCorporateAction`, `CollectInvestorElection`, `ExecuteCorporateAction`
- [x] **9.11** Application (waterfall): queries — `GetWaterfallModel`, `GetDistribution`, `ListDistributions`, `GetCorporateAction`, `GetDistributionBreakdown`
- [x] **9.12** Infrastructure (waterfall): Postgres repositories
- [x] **9.13** Interface (waterfall): `WaterfallController`, `DistributionController`, `CorporateActionController` with Swagger
- [x] **9.14** Domain (pricing): typed IDs — `PriceId`, `ValuationModelId`
- [x] **9.15** Domain (pricing): all value objects
- [x] **9.16** Domain (pricing): `ValuationModel` aggregate, `Price` aggregate root
- [x] **9.17** Domain (pricing): 6 domain events, `PricingVendorPort`, `ValuationAgentPort`
- [x] **9.18** Application (pricing): commands — `UpdatePrice`, `RunValuationModel`, `ApproveValuation`, `RejectValuation`, `DetectStalePrice`
- [x] **9.19** Application (pricing): queries — `GetCurrentPrice`, `GetPriceHistory`, `GetValuationModel`
- [x] **9.20** Infrastructure (pricing): Postgres + TimescaleDB for price history, stub `BloombergPricingAdapter`
- [x] **9.21** Interface (pricing): `PriceController`, `ValuationController` with Swagger
- [x] **9.22** Flyway migrations for both schemas
- [x] **9.23** Unit tests: `WaterfallCalculationService` (all tier types), `TaxWithholdingCalculator`
- [x] **9.24** Add proxy routes `distributions`, `corporate-actions`, `prices`, `valuations` to API gateway

---

## Sub-Project #10 — Compliance + Reporting + Risk + Governance + Notification + Wallet & Custody

**Status:** [x] Complete  
**Depends on:** Sub-Projects #3–#9  
**Unblocks:** Platform complete

### Domain Model — Compliance & Regulatory Reporting
- **Aggregates:** `ComplianceRule`, `RegulatoryFiling`, `InvestorCount`
- **Domain Events:** `ComplianceRuleTriggered`, `FilingSubmitted`, `FilingAccepted`, `InvestorLimitApproached`, `InvestorLimitReached`
- **Domain Services:** `ComplianceRuleEngine`, `BeneficialOwnershipMonitor`

### Domain Model — Reporting & Analytics
- **Aggregates:** `NavCalculation`, `PerformanceMetric`, `InvestorStatement`
- **Domain Events:** `NavCalculated`, `NavRestated`, `PerformanceMetricsCalculated`, `StatementGenerated`, `StatementDistributed`

### Domain Model — Risk Management
- **Aggregates:** `RiskAssessment`, `RiskLimit`, `StressTest`
- **Domain Events:** `RiskLimitBreached`, `RiskLimitWarning`, `StressTestCompleted`

### Domain Model — Governance & Voting
- **Aggregates:** `Proposal`, `Vote`, `Meeting`
- **Domain Events:** `ProposalCreated`, `VotingOpened`, `VoteCast`, `QuorumReached`, `ProposalPassed`, `ProposalFailed`

### Domain Model — Notification & Communication
- **Aggregates:** `Notification`, `NotificationTemplate`, `CommunicationCampaign`
- **Domain Events:** `NotificationSent`, `NotificationDelivered`, `NotificationBounced`, `CampaignLaunched`, `CampaignCompleted`
- **Ports:** `EmailPort`, `SmsPort`, `PushNotificationPort`

### Domain Model — Wallet & Custody Infrastructure
- **Aggregates:** `Wallet`, `TransactionRelay`
- **Domain Events:** `WalletProvisioned`, `WalletFrozen`, `CustodySwitched`, `TransactionRelayed`, `TransactionConfirmed`
- **Ports:** `MpcProviderPort`, `HsmPort`, `BlockchainNodePort`

### Tasks

- [x] **10.1** Scaffold `apps/compliance/` (port 3013)
- [x] **10.2** Scaffold `apps/reporting/` (port 3014)
- [x] **10.3** Scaffold `apps/risk-management/` (port 3019)
- [x] **10.4** Scaffold `apps/governance/` (port 3020)
- [x] **10.5** Scaffold `apps/notification/` (port 3016)
- [x] **10.6** Scaffold `apps/wallet-custody/` (port 3017)
- [x] **10.7** Create `libs/compliance-api/`, `libs/reporting-api/` shared DTOs libraries
- [x] **10.8** Domain (compliance): typed IDs, value objects, aggregates, 5 events, `ComplianceRuleEngine`, `BeneficialOwnershipMonitor`
- [x] **10.9** Application (compliance): commands — `ActivateComplianceRule`, `DeactivateComplianceRule`, `CreateRegulatoryFiling`, `SubmitFiling`, `UpdateInvestorCount`; queries — `GetComplianceStatus`, `ListFilings`, `GetInvestorCount`
- [x] **10.10** Infrastructure (compliance): Postgres repos, `EDGARFilingAdapter` (stub)
- [x] **10.11** Interface (compliance): `ComplianceController`, `FilingController` with Swagger
- [x] **10.12** Domain (reporting): typed IDs, value objects, aggregates, 5 events
- [x] **10.13** Application (reporting): commands — `CalculateNav`, `RecalculatePerformanceMetrics`, `GenerateInvestorStatement`, `DistributeStatement`; queries — `GetNav`, `GetNavHistory`, `GetPerformanceMetrics`, `GetInvestorStatement`, `ListInvestorStatements`
- [x] **10.14** Infrastructure (reporting): Postgres + ClickHouse for analytics, `ReportTemplateAdapter`
- [x] **10.15** Interface (reporting): `NavController`, `PerformanceController`, `StatementController` with Swagger
- [x] **10.16** Domain (risk): typed IDs, value objects, aggregates — `RiskAssessment`, `RiskLimit`, `StressTest`, 5 events
- [x] **10.17** Application (risk): commands — `RunRiskAssessment`, `SetRiskLimit`, `RunStressTest`; queries — `GetRiskDashboard`, `GetRiskAssessment`, `GetStressTestResults`
- [x] **10.18** Infrastructure (risk): Postgres repos
- [x] **10.19** Interface (risk): `RiskController` with Swagger
- [x] **10.20** Domain (governance): typed IDs — `ProposalId`, `VoteId`, `MeetingId`; aggregates, 6 events
- [x] **10.21** Application (governance): commands — `CreateProposal`, `IssueVotingNotice`, `OpenVoting`, `CastVote`, `CloseVoting`, `ScheduleMeeting`; queries — `GetProposal`, `ListProposals`, `GetVotingResults`, `GetMeeting`
- [x] **10.22** Infrastructure (governance): Postgres repos
- [x] **10.23** Interface (governance): `ProposalController`, `VoteController`, `MeetingController` with Swagger
- [x] **10.24** Domain (notification): typed IDs — `NotificationId`, `NotificationTemplateId`, `CommunicationCampaignId`; aggregates, 5 events, `EmailPort`, `SmsPort`
- [x] **10.25** Application (notification): commands — `SendNotification`, `CreateTemplate`, `LaunchCampaign`; queries — `GetNotification`, `ListTemplates`, `GetCampaign`
- [x] **10.26** Infrastructure (notification): Postgres repos, `SendGridEmailAdapter` (stub), `TwilioSmsAdapter` (stub)
- [x] **10.27** Interface (notification): `NotificationController`, `TemplateController` with Swagger
- [x] **10.28** Domain (wallet): typed IDs — `WalletId`, `TransactionRelayId`; aggregates, 5 events, `MpcProviderPort`
- [x] **10.29** Application (wallet): commands — `ProvisionWallet`, `FreezeWallet`, `RelayTransaction`, `ConfirmTransaction`; queries — `GetWallet`, `ListWallets`, `GetTransactionRelay`
- [x] **10.30** Infrastructure (wallet): Postgres repos, `FireblocksAdapter` (stub)
- [x] **10.31** Interface (wallet): `WalletController`, `TransactionRelayController` with Swagger
- [x] **10.32** Flyway migrations for all 6 schemas
- [x] **10.33** Unit tests: `ComplianceRuleEngine`, `WaterfallCalculationService` edge cases, voting quorum logic
- [x] **10.34** Add proxy routes `compliance`, `reports`, `risks`, `proposals`, `notifications`, `wallets` to API gateway

---

## Cross-Cutting Tasks

### Shared Kernel Extensions

- [x] **11.1** Add all new typed IDs to `libs/shared-kernel/src/ids/domain-id.ts`
- [x] **11.2** Add `ISIN`, `LEI`, `BlockchainAddress`, `TaxId`, `PhoneNumber`, `Address` value objects
- [x] **11.3** Add `DocumentStoragePort`, `BlockchainGatewayPort`, `KycProviderPort`, `PaymentGatewayPort`, `ESignaturePort`, `SearchPort` to shared-kernel ports
- [x] **11.4** Export all new symbols from `libs/shared-kernel/src/index.ts`

### API Gateway Extensions

- [x] **12.1** Refactor gateway proxy to a generic `proxyToService(prefix, envVar)` helper
- [x] **12.2** Add routing for all 18 new service prefixes
- [x] **12.3** Add health-check aggregation endpoint `GET /health` (fan-out to all services)
- [x] **12.4** Add `X-Correlation-ID` header injection in gateway for distributed tracing

### Monorepo Config

- [x] **13.1** Add all 18 new app entries to `nest-cli.json`
- [x] **13.2** Add all new lib path aliases to root `tsconfig.json`
- [x] **13.3** Add all new `start:*` scripts to `package.json`
- [x] **13.4** Add `concurrently` dev script that starts all services

### Environment Config

- [x] **14.1** Extend `.env.example` with all new service URLs and ports
- [x] **14.2** Add database connection strings for each bounded context schema
- [x] **14.3** Add external provider keys (KYC, e-sign, payment, blockchain) as documented stubs
- [x] **14.4** Add `KAFKA_BROKERS`, `REDIS_URL`, `SCHEMA_REGISTRY_URL`

---

## Saga Workflows (Temporal.io — Post Sub-Project #10)

- [x] **S1** Deal Lifecycle Saga: `DealApproved` → entity formation → product activation → token mint → cap table init → subscription open → closing → listing published
- [x] **S2** Investor Onboarding Saga: `InvestorRegistered` → KYC → accreditation → wallet provisioning → whitelist update
- [x] **S3** Distribution & Payment Saga: `DistributionApproved` → waterfall calc → tax withholding → payment batch → notification → cap table update → statement refresh
- [x] **S4** Corporate Action Saga: `CorporateActionAnnounced` → election notices → collect elections → process → cap table update → settlement notification

---

## gRPC Service Contracts (to define per context)

- [x] **G1** `InvestorService` gRPC: `CheckEligibility`, `GetInvestorProfile`
- [x] **G2** `IssuanceService` gRPC: `GetWhitelistStatus`, `GetTokenBalance`
- [x] **G3** `WalletService` gRPC: `ValidateAddress`, `GetWalletStatus`
- [x] **G4** `ComplianceService` gRPC: `CheckPreTradeCompliance`, `GetInvestorCount`
- [x] **G5** `PricingService` gRPC: `GetCurrentPrice`, `GetNavPerShare`

---

## Definition of Done (per sub-project)

1. All domain layer files in place with no infrastructure imports
2. All application command/query handlers implemented and registered in module
3. All infrastructure adapters implemented (real or stub behind port)
4. All HTTP controllers documented with Swagger
5. Module fully wired (`providers`, `controllers`, `imports`)
6. Flyway migration baseline created
7. Unit tests passing for all aggregate invariants and domain services
8. Proxy route added to API gateway
9. `nest-cli.json` and `tsconfig.json` updated
10. `.env.example` extended with new variables
11. `npm run build` passes for the new app
