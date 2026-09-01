# Digital Assets Operating System --- Asset Origination

## Complete TODO List / Implementation Backlog

> **Purpose:** Build Asset Origination as the institutional onboarding,
> verification, qualification, due-diligence and engineering-readiness
> layer of a Digital Assets Operating System.
>
> **Core boundary:** Asset Origination determines whether an asset can
> be truthfully identified, evidenced, verified, legally handled,
> assessed and approved for Opportunity Engineering. Investment thesis,
> IRR/NPV/XIRR, scenario return engineering, capital-stack engineering
> and investor-product economics belong primarily to **Opportunity
> Engineering**.

---

## 12 Core Modules (from requirements)

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

## 0. Target Domain Boundary

### 0.1 Canonical flow

``` text
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

### 0.2 Ownership boundaries

-   [ ] Asset Registry owns canonical asset identity.
-   [ ] Asset Origination owns the origination case and onboarding
    workflow.
-   [ ] Entity Studio owns legal entities/persons and corporate
    relationships.
-   [ ] Compliance OS owns KYC/KYB/AML/sanctions/PEP and compliance
    assessments.
-   [ ] Document Service owns document binaries, versions, OCR, hashes
    and retention.
-   [ ] Opportunity Engineering owns investment thesis, financial
    engineering, return engineering and scenarios.
-   [ ] Deal Studio owns legal/economic structuring.
-   [ ] Issuance owns instrument/token creation.
-   [ ] Distribution owns investor subscription/allocation workflows.
-   [ ] Secondary Market owns trading/transfer workflows.
-   [ ] Asset Lifecycle owns post-issuance servicing and lifecycle
    events.

### 0.3 Facts vs derived analysis

-   [ ] Store source facts separately from assumptions.
-   [ ] Store externally verified facts separately from user-entered
    facts.
-   [ ] Store derived metrics with formula/version/source references.
-   [ ] Never overwrite historical facts without versioning.
-   [ ] Make all material facts effective-dated where applicable.
-   [ ] Preserve provenance for every material derived result.

------------------------------------------------------------------------

# 0. Target Domain Boundary

## 0.1 Canonical flow

``` text
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

## 0.2 Ownership boundaries

-   [ ] Asset Registry owns canonical asset identity.
-   [ ] Asset Origination owns the origination case and onboarding
    workflow.
-   [ ] Entity Studio owns legal entities/persons and corporate
    relationships.
-   [ ] Compliance OS owns KYC/KYB/AML/sanctions/PEP and compliance
    assessments.
-   [ ] Document Service owns document binaries, versions, OCR, hashes
    and retention.
-   [ ] Opportunity Engineering owns investment thesis, financial
    engineering, return engineering and scenarios.
-   [ ] Deal Studio owns legal/economic structuring.
-   [ ] Issuance owns instrument/token creation.
-   [ ] Distribution owns investor subscription/allocation workflows.
-   [ ] Secondary Market owns trading/transfer workflows.
-   [ ] Asset Lifecycle owns post-issuance servicing and lifecycle
    events.

## 0.3 Facts vs derived analysis

-   [ ] Store source facts separately from assumptions.
-   [ ] Store externally verified facts separately from user-entered
    facts.
-   [ ] Store derived metrics with formula/version/source references.
-   [ ] Never overwrite historical facts without versioning.
-   [ ] Make all material facts effective-dated where applicable.
-   [ ] Preserve provenance for every material derived result.

------------------------------------------------------------------------

# 1. Product Foundation

## 1.1 Product requirements

-   [ ] Define Asset Origination product charter.
-   [ ] Define user personas.
-   [ ] Define internal roles.
-   [ ] Define external originator roles.
-   [ ] Define asset classes.
-   [ ] Define jurisdictions.
-   [ ] Define lifecycle states.
-   [ ] Define SLA policies.
-   [ ] Define approval policies.
-   [ ] Define DD policies.
-   [ ] Define screening policies.
-   [ ] Define evidence standards.
-   [ ] Define data-retention policies.
-   [ ] Define tenant isolation requirements.
-   [ ] Define regulatory audit requirements.

## 1.2 User personas

-   [ ] Originator
-   [ ] Broker
-   [ ] Relationship Manager
-   [ ] Origination Analyst
-   [ ] Asset Analyst
-   [ ] DD Analyst
-   [ ] Legal Reviewer
-   [ ] Compliance Reviewer
-   [ ] Valuation Analyst
-   \[Risk Analyst
-   [ ] Approver
-   [ ] Portfolio Manager
-   [ ] Operations Analyst
-   [ ] Tenant Administrator
-   [ ] External Asset Owner
-   [ ] External Originator

------------------------------------------------------------------------

# 2. Core Domain Model

## 2.1 OriginationCase

Create `OriginationCase`.

-   [ ] `id`
-   [ ] `tenantId`
-   [ ] `caseNumber`
-   [ ] `caseName`
-   [ ] `submissionType`
-   [ ] `submissionChannel`
-   [ ] `sourceId`
-   [ ] `submittedBy`
-   [ ] `relationshipManagerId`
-   [ ] `assignedTeamId`
-   [ ] `assignedAnalystId`
-   [ ] `assetClass`
-   [ ] `assetSubclass`
-   [ ] `jurisdictions`
-   [ ] `indicativeValue`
-   [ ] `currency`
-   [ ] `priority`
-   [ ] `status`
-   [ ] `nextAction`
-   [ ] `nextActionDue`
-   [ ] `duplicateCheckStatus`
-   [ ] `initialScreeningStatus`
-   [ ] `submittedAt`
-   [ ] `receivedAt`
-   [ ] `createdAt`
-   [ ] `updatedAt`

## 2.2 Submission

-   [ ] Submission entity.
-   [ ] Submission versioning.
-   [ ] Submission source.
-   [ ] Submission channel.
-   [ ] Submission payload.
-   [ ] Submission documents.
-   [ ] Submission status.
-   [ ] Submission timestamps.
-   [ ] Submission acknowledgement.
-   [ ] Submission rejection reason.
-   [ ] Submission-to-case conversion.

## 2.3 Asset Core

Create canonical asset core.

-   [ ] Asset ID.
-   [ ] Asset number.
-   [ ] Asset name.
-   [ ] Asset type.
-   [ ] Asset class.
-   [ ] Asset subclass.
-   [ ] Asset description.
-   [ ] Asset status.
-   [ ] Legal jurisdiction.
-   [ ] Operating jurisdiction.
-   [ ] Country.
-   [ ] Currency.
-   [ ] Creation date.
-   [ ] Effective date.
-   [ ] Source.
-   [ ] Registry reference.
-   [ ] External identifiers.
-   [ ] Industry/sector.
-   [ ] Geographic metadata.

## 2.4 Asset Registry integration

-   [ ] Define Asset Registry API.
-   [ ] Create canonical asset.
-   [ ] Search asset by external identifier.
-   [ ] Search by identity fingerprint.
-   [ ] Resolve duplicate candidate.
-   [ ] Link existing asset.
-   [ ] Update asset facts.
-   [ ] Receive asset lifecycle events.
-   [ ] Publish asset-created event.
-   [ ] Publish asset-updated event.
-   [ ] Publish asset-status event.
-   [ ] Preserve immutable asset identifier.

------------------------------------------------------------------------

# 3. Asset Classification

## 3.1 Classification hierarchy

-   [ ] Asset class taxonomy.
-   [ ] Asset subclass taxonomy.
-   [ ] Asset subtype taxonomy.
-   [ ] Industry taxonomy.
-   [ ] Jurisdiction taxonomy.
-   [ ] Regulatory classification.
-   [ ] Income-generating classification.
-   [ ] Physical/digital classification.
-   [ ] Fungible/non-fungible classification.
-   [ ] Fractionalizable classification.
-   [ ] Tokenization suitability classification.

## 3.2 Dynamic asset schemas

Implement schema-driven forms.

-   [ ] Common asset fields.
-   [ ] Asset-class schema.
-   [ ] Asset-subclass schema.
-   [ ] Required-field rules.
-   [ ] Conditional-field rules.
-   [ ] Validation rules.
-   [ ] Display rules.
-   [ ] Read-only rules.
-   [ ] Role-based fields.
-   [ ] Versioned schemas.

------------------------------------------------------------------------

# 4. Asset-Specific Profiles

## 4.1 Real Estate Profile

-   [ ] Property ID.
-   [ ] Property type.
-   [ ] Address.
-   [ ] Country.
-   [ ] City.
-   [ ] Coordinates.
-   [ ] Land area.
-   [ ] Built-up area.
-   [ ] Gross floor area.
-   [ ] Net lettable area.
-   [ ] Occupancy.
-   [ ] Tenant count.
-   [ ] Lease count.
-   [ ] Annual rental income.
-   [ ] Operating expenses.
-   [ ] NOI.
-   [ ] Lease expiry.
-   [ ] WAULT.
-   [ ] Rent escalation.
-   [ ] Valuation.
-   [ ] Valuation date.
-   [ ] Valuer.
-   [ ] Mortgage.
-   [ ] LTV.
-   [ ] Development status.
-   [ ] Construction status.
-   [ ] Developer.
-   [ ] Property manager.

## 4.2 Private Credit Profile

-   [ ] Borrower.
-   [ ] Facility type.
-   [ ] Original principal.
-   [ ] Outstanding principal.
-   [ ] Interest rate.
-   [ ] Reference rate.
-   [ ] Spread.
-   [ ] Fixed/floating.
-   [ ] Origination date.
-   [ ] Maturity date.
-   [ ] Payment frequency.
-   [ ] Amortisation.
-   [ ] Collateral.
-   [ ] Collateral value.
-   [ ] LTV.
-   [ ] DSCR.
-   [ ] Debt service.
-   [ ] Covenants.
-   [ ] Payment status.
-   [ ] Days past due.
-   [ ] Default status.
-   [ ] Restructuring status.
-   [ ] Guarantors.
-   [ ] Security ranking.
-   [ ] Recovery information.

## 4.3 Receivables Profile

-   [ ] Debtor.
-   [ ] Creditor.
-   [ ] Invoice count.
-   [ ] Gross receivable.
-   [ ] Outstanding receivable.
-   [ ] Collected amount.
-   [ ] Invoice date.
-   [ ] Due date.
-   [ ] Average tenor.
-   [ ] Historical collection rate.
-   [ ] Dilution.
-   [ ] Dispute amount.
-   [ ] Top debtor concentration.
-   [ ] Geographic concentration.
-   [ ] Industry concentration.
-   [ ] Credit insurance.
-   [ ] Recourse/non-recourse.

## 4.4 Private Equity Profile

-   [ ] Company.
-   [ ] Sector.
-   [ ] Country.
-   [ ] Ownership percentage.
-   [ ] Share class.
-   [ ] Entry date.
-   [ ] Entry valuation.
-   [ ] Revenue.
-   [ ] EBITDA.
-   [ ] EBITDA margin.
-   [ ] Debt.
-   [ ] Cash.
-   [ ] Employees.
-   [ ] Funding rounds.
-   [ ] Last valuation.
-   [ ] Board rights.
-   [ ] Voting rights.
-   [ ] Exit restrictions.
-   [ ] Transfer restrictions.
-   [ ] Shareholder agreement.

## 4.5 Infrastructure Profile

-   [ ] Project ID.
-   [ ] Infrastructure type.
-   [ ] Location.
-   [ ] Capacity.
-   [ ] Construction status.
-   [ ] Operating status.
-   [ ] Concession.
-   [ ] Concession expiry.
-   [ ] Revenue model.
-   [ ] Offtaker.
-   [ ] PPA.
-   [ ] Capex.
-   [ ] Opex.
-   [ ] Debt.
-   [ ] Permits.
-   [ ] Insurance.
-   [ ] Operator.

## 4.6 Fund Profile

-   [ ] Fund name.
-   [ ] Fund type.
-   [ ] Manager.
-   [ ] Administrator.
-   [ ] Custodian.
-   [ ] NAV.
-   [ ] AUM.
-   [ ] Share/class.
-   [ ] Subscription rules.
-   [ ] Redemption rules.
-   [ ] Lockup.
-   [ ] Management fee.
-   [ ] Performance fee.
-   [ ] Valuation frequency.
-   [ ] Fund jurisdiction.
-   [ ] Audited statements.

## 4.7 Commodity Profile

-   [ ] Commodity type.
-   [ ] Quantity.
-   [ ] Unit.
-   [ ] Quality/grade.
-   [ ] Location.
-   [ ] Custodian.
-   [ ] Warehouse.
-   [ ] Warehouse receipt.
-   [ ] Insurance.
-   [ ] Encumbrance.
-   [ ] Delivery terms.
-   [ ] Price reference.

## 4.8 IP / Royalty Profile

-   [ ] IP type.
-   [ ] Registration number.
-   [ ] Owner.
-   [ ] Licensee.
-   [ ] Territory.
-   [ ] License term.
-   [ ] Royalty rate.
-   [ ] Historical royalty.
-   [ ] Remaining term.
-   [ ] Exclusivity.
-   [ ] Encumbrances.
-   [ ] Infringement status.

## 4.9 Digital Asset Profile

-   [ ] Blockchain.
-   [ ] Network.
-   [ ] Chain ID.
-   [ ] Contract address.
-   [ ] Token standard.
-   [ ] Token name.
-   [ ] Token symbol.
-   [ ] Decimals.
-   [ ] Total supply.
-   [ ] Circulating supply.
-   [ ] Asset/protocol type.
-   [ ] Issuer.
-   [ ] Contract owner.
-   [ ] Admin key.
-   [ ] Upgradeability.
-   [ ] Proxy contract.
-   [ ] Implementation contract.
-   [ ] Mint authority.
-   [ ] Burn authority.
-   [ ] Pause authority.
-   [ ] Freeze authority.
-   [ ] Custodian.
-   [ ] Wallets.
-   [ ] Oracle.
-   [ ] Oracle provider.
-   [ ] Smart contract audit.
-   [ ] Deployment block.
-   [ ] Deployment transaction.
-   [ ] On-chain provenance.
-   [ ] Off-chain legal ownership.
-   [ ] Legal claim.
-   [ ] Token representation.

------------------------------------------------------------------------

# 5. Source / Originator Management

## 5.1 Source

-   [ ] Source profile.
-   [ ] Organization.
-   [ ] Contact.
-   [ ] Relationship owner.
-   [ ] Geography.
-   [ ] Asset classes.
-   [ ] Submission channels.
-   [ ] Source status.
-   [ ] Source quality score.
-   [ ] Historical submissions.
-   [ ] Qualification rate.
-   [ ] Approval rate.
-   [ ] Total asset value.
-   [ ] Average asset value.
-   [ ] Average processing time.

## 5.2 Source agreements

-   [ ] NDA.
-   [ ] Referral agreement.
-   [ ] Origination agreement.
-   [ ] Exclusivity.
-   [ ] Fee agreement.
-   [ ] Revenue share.
-   [ ] Territory.
-   [ ] Asset-class permissions.
-   [ ] Data rights.
-   [ ] Confidentiality.
-   [ ] Agreement expiry.
-   [ ] Agreement status.

## 5.3 Source performance

-   [ ] Submission volume.
-   [ ] Acceptance rate.
-   [ ] Qualification rate.
-   [ ] DD pass rate.
-   [ ] Approval rate.
-   [ ] Rejection reasons.
-   [ ] Average asset size.
-   [ ] Source risk score.
-   [ ] Source reliability score.

------------------------------------------------------------------------

# 6. Counterparty Model

Create structured `AssetCounterparty`.

-   [ ] Asset.
-   [ ] Entity.
-   [ ] Person.
-   [ ] Counterparty role.
-   [ ] Legal role.
-   [ ] Economic role.
-   [ ] Ownership percentage.
-   [ ] Effective from.
-   [ ] Effective to.
-   [ ] Verification status.
-   [ ] Compliance status.
-   [ ] Evidence references.

Counterparty roles:

-   [ ] Owner.
-   [ ] Beneficial owner.
-   [ ] Seller.
-   [ ] Buyer.
-   [ ] Borrower.
-   [ ] Lender.
-   [ ] Issuer.
-   [ ] Sponsor.
-   [ ] Operator.
-   [ ] Servicer.
-   [ ] Custodian.
-   [ ] Trustee.
-   [ ] Administrator.
-   [ ] Manager.
-   [ ] Valuer.
-   [ ] Auditor.
-   [ ] Legal advisor.
-   [ ] Broker.
-   [ ] Originator.
-   [ ] Insurer.
-   [ ] Regulator.
-   [ ] Security holder.

------------------------------------------------------------------------

# 7. Ownership / Control

## 7.1 Ownership

-   [ ] Legal owner.
-   [ ] Economic owner.
-   [ ] Beneficial owner.
-   [ ] Ownership percentage.
-   [ ] Economic interest percentage.
-   [ ] Control percentage.
-   [ ] Ownership type.
-   [ ] Acquisition date.
-   [ ] Effective from.
-   [ ] Effective to.
-   [ ] Ownership evidence.
-   [ ] Verification status.
-   [ ] Verified by.
-   [ ] Verified at.

## 7.2 Ownership graph

-   [ ] UBO graph.
-   [ ] Holding company graph.
-   [ ] SPV graph.
-   [ ] Trust structure.
-   [ ] Nominee relationships.
-   [ ] Control relationships.
-   [ ] Cross-ownership.
-   [ ] Historical ownership.

## 7.3 Control

-   [ ] Voting control.
-   [ ] Board control.
-   [ ] Contractual control.
-   [ ] Administrative control.
-   [ ] Smart-contract admin control.
-   [ ] Custody control.

------------------------------------------------------------------------

# 8. Asset Rights

Create `AssetRights`.

-   [ ] Right type.
-   [ ] Holder.
-   [ ] Percentage.
-   [ ] Priority.
-   [ ] Effective from.
-   [ ] Effective to.
-   [ ] Transferable.
-   [ ] Assignable.
-   [ ] Evidence reference.

Right types:

-   [ ] Ownership.
-   [ ] Beneficial interest.
-   [ ] Revenue right.
-   [ ] Income right.
-   [ ] Debt claim.
-   [ ] Security interest.
-   [ ] Voting right.
-   [ ] Redemption right.
-   [ ] Royalty right.
-   [ ] Lease right.
-   [ ] Profit participation.
-   [ ] Governance right.

------------------------------------------------------------------------

# 9. Encumbrances

Create `AssetEncumbrance`.

-   [ ] Encumbrance ID.
-   [ ] Type.
-   [ ] Holder.
-   [ ] Amount.
-   [ ] Currency.
-   [ ] Priority.
-   [ ] Registration number.
-   [ ] Effective from.
-   [ ] Effective to.
-   [ ] Status.
-   [ ] Release conditions.
-   [ ] Evidence reference.
-   [ ] Verification status.

Types:

-   [ ] Mortgage.
-   [ ] Lien.
-   [ ] Pledge.
-   [ ] Charge.
-   [ ] Security interest.
-   [ ] Debt.
-   [ ] Claim.
-   [ ] Litigation claim.
-   [ ] Transfer restriction.

------------------------------------------------------------------------

# 10. Transferability

Create `AssetTransferability`.

-   [ ] Transferable?
-   [ ] Assignable?
-   [ ] Fractionalizable?
-   [ ] Tokenizable?
-   [ ] Beneficial interest transferable?
-   [ ] Issuer consent required?
-   [ ] Owner consent required?
-   [ ] Regulator approval required?
-   [ ] Geographic restrictions?
-   [ ] Investor restrictions?
-   [ ] Secondary transfer restrictions?
-   [ ] Lockup?
-   [ ] Pre-emption rights?
-   [ ] Transfer fees?
-   [ ] Transfer documentation?
-   [ ] Legal opinion required?
-   [ ] Assessment status.
-   [ ] Assessment evidence.
-   [ ] Reviewer.
-   [ ] Assessment date.

------------------------------------------------------------------------

# 11. Provenance

Create structured `AssetProvenance`.

Event types:

-   [ ] Created.
-   [ ] Acquired.
-   [ ] Transferred.
-   [ ] Assigned.
-   [ ] Pledged.
-   [ ] Released.
-   [ ] Valued.
-   [ ] Restructured.
-   [ ] Split.
-   [ ] Merged.
-   [ ] Tokenized.
-   [ ] Redeemed.
-   [ ] Retired.

Fields:

-   [ ] Event ID.
-   [ ] Asset ID.
-   [ ] Event type.
-   [ ] From entity.
-   [ ] To entity.
-   [ ] Effective date.
-   [ ] Recorded date.
-   [ ] Jurisdiction.
-   [ ] Registry reference.
-   [ ] Document reference.
-   [ ] Transaction reference.
-   [ ] Verification status.
-   [ ] Evidence.
-   [ ] Hash where applicable.

------------------------------------------------------------------------

# 12. Evidence Model

Create `Evidence`.

-   [ ] Evidence ID.
-   [ ] Evidence type.
-   [ ] Source.
-   [ ] Source reference.
-   [ ] Evidence date.
-   [ ] Collected at.
-   [ ] Collected by.
-   [ ] Confidence.
-   [ ] Verification status.
-   [ ] Document ID.
-   [ ] External reference.
-   [ ] Hash.
-   [ ] Signature.
-   [ ] Expiry.
-   [ ] Access policy.

Evidence types:

-   [ ] Registry record.
-   [ ] Blockchain transaction.
-   [ ] API response.
-   [ ] Custodian confirmation.
-   [ ] Bank statement.
-   [ ] Legal opinion.
-   [ ] External database.
-   [ ] Valuation report.
-   [ ] Counterparty attestation.
-   [ ] Oracle data.
-   [ ] Photograph.
-   [ ] Inspection report.
-   [ ] Certificate.

------------------------------------------------------------------------

# 13. Claims and Verification

Create `AssetClaim`.

-   [ ] Claim ID.
-   [ ] Claim statement.
-   [ ] Claim type.
-   [ ] Claim owner.
-   [ ] Materiality.
-   [ ] Status.
-   [ ] Verification method.
-   [ ] Evidence references.
-   [ ] Confidence.
-   [ ] Reviewer.
-   [ ] Verified at.

Example:

``` text
Claim:
"ABC SPV legally owns the asset."

Evidence:
- Title deed
- Registry search
- Legal opinion

Verification:
VERIFIED
```

Implement:

-   [ ] Claim creation.
-   [ ] Evidence linking.
-   [ ] Verification workflow.
-   [ ] Reviewer assignment.
-   [ ] Rejection.
-   [ ] Re-verification.
-   [ ] Expiry.
-   [ ] Confidence scoring.

------------------------------------------------------------------------

# 14. Document / Data Room Integration

Do not store document binaries inside Asset Origination.

Integrate Document Service.

-   [ ] Document reference.
-   [ ] Document version.
-   [ ] Document type.
-   [ ] Owner.
-   [ ] Upload source.
-   [ ] Upload date.
-   [ ] Expiry.
-   [ ] Hash.
-   [ ] OCR status.
-   [ ] Extraction status.
-   [ ] Signature status.
-   [ ] Classification.
-   [ ] Confidentiality.
-   [ ] Retention policy.
-   [ ] Access policy.

Document categories:

-   [ ] Ownership.
-   [ ] Legal.
-   [ ] Financial.
-   \[Tax.
-   [ ] Valuation.
-   [ ] Insurance.
-   [ ] Regulatory.
-   [ ] Operational.
-   \[Technical.
-   [ ] ESG.
-   [ ] Corporate.
-   [ ] Agreements.
-   [ ] Smart contract.
-   [ ] Audit.
-   [ ] Custody.

------------------------------------------------------------------------

# 15. Data Request Workflow

Create `DataRequest`.

Fields:

-   [ ] Request ID.
-   [ ] Case ID.
-   [ ] Requested from.
-   [ ] Requested by.
-   [ ] Request type.
-   [ ] Description.
-   [ ] Priority.
-   [ ] Required by.
-   [ ] Status.
-   [ ] Response.
-   [ ] Evidence.
-   [ ] Created at.
-   [ ] Completed at.

Statuses:

-   [ ] Requested.
-   [ ] Partially received.
-   [ ] Received.
-   [ ] Under review.
-   [ ] Accepted.
-   [ ] Rejected.
-   [ ] Overdue.
-   [ ] Cancelled.

------------------------------------------------------------------------

# 16. Duplicate Detection / Entity Resolution

Implement:

-   [ ] Exact asset ID matching.
-   [ ] External ID matching.
-   [ ] Name matching.
-   [ ] Address matching.
-   [ ] Owner matching.
-   [ ] Contract matching.
-   [ ] Blockchain address matching.
-   [ ] Registry matching.
-   [ ] Fuzzy matching.
-   [ ] Similarity score.
-   [ ] Duplicate candidate queue.
-   [ ] Merge review.
-   [ ] Link existing asset.
-   [ ] Separate asset decision.
-   [ ] Immutable merge history.

UI:

``` text
Potential duplicate found
Similarity: 92%

Existing Asset: AST-00231

[View Existing]
[Link]
[Create Separate Asset]
[Merge Review]
```

------------------------------------------------------------------------

# 17. Asset Relationship Graph

Implement relationships:

-   [ ] Owned by.
-   [ ] Beneficially owned by.
-   [ ] Managed by.
-   [ ] Operated by.
-   [ ] Secured by.
-   [ ] Backed by.
-   [ ] Part of pool.
-   [ ] Derived from.
-   [ ] Represented by token.
-   [ ] Linked to opportunity.
-   [ ] Linked to deal.
-   [ ] Linked to instrument.
-   [ ] Linked to issuer.
-   [ ] Linked to custodian.
-   [ ] Linked to service provider.

Support:

-   [ ] Relationship creation.
-   [ ] Relationship removal.
-   [ ] Relationship history.
-   [ ] Effective dates.
-   [ ] Graph visualization.
-   [ ] Relationship search.

------------------------------------------------------------------------

# 18. Asset Versioning

Implement versioning for:

-   [ ] Core asset facts.
-   [ ] Ownership.
-   [ ] Rights.
-   [ ] Encumbrances.
-   [ ] Valuation.
-   [ ] Counterparties.
-   [ ] Risk.
-   [ ] DD.
-   [ ] Classification.
-   [ ] Transferability.

Every version should contain:

-   [ ] Version number.
-   [ ] Changed fields.
-   [ ] Previous value.
-   [ ] New value.
-   [ ] Changed by.
-   [ ] Changed at.
-   [ ] Reason.
-   [ ] Evidence.
-   [ ] Approval if required.

------------------------------------------------------------------------

# 19. Effective-Dated Data

Use `validFrom` and `validTo` for:

-   [ ] Ownership.
-   [ ] Beneficial ownership.
-   [ ] Rights.
-   [ ] Encumbrances.
-   [ ] Counterparties.
-   [ ] Servicers.
-   [ ] Custodians.
-   [ ] Managers.
-   [ ] Valuations.
-   [ ] Restrictions.

------------------------------------------------------------------------

# 20. Screening Engine

## 20.1 Screening objective

Answer:

> Can this asset enter the origination process?

Implement policy-driven screening.

-   [ ] Asset eligibility.
-   [ ] Asset class eligibility.
-   [ ] Jurisdiction eligibility.
-   [ ] Minimum/maximum asset size.
-   [ ] Ownership requirements.
-   [ ] Documentation requirements.
-   [ ] Regulatory restrictions.
-   [ ] Transferability requirements.
-   [ ] Counterparty requirements.
-   [ ] Data completeness requirements.
-   [ ] Prohibited asset rules.
-   [ ] Concentration rules.
-   [ ] Source eligibility.

## 20.2 Screening policy

Create:

`ScreeningPolicy`

-   [ ] Policy ID.
-   [ ] Version.
-   [ ] Tenant.
-   [ ] Asset classes.
-   [ ] Jurisdictions.
-   [ ] Conditions.
-   [ ] Rule severity.
-   [ ] Required evidence.
-   [ ] Effective date.
-   [ ] Expiry.

## 20.3 Screening result

-   [ ] Pass.
-   [ ] Fail.
-   [ ] Conditional.
-   [ ] Manual review.
-   [ ] Rule-by-rule result.
-   [ ] Evidence.
-   [ ] Exceptions.
-   [ ] Reviewer.
-   [ ] Timestamp.

------------------------------------------------------------------------

# 21. Qualification Engine

Qualification should answer:

> Is the asset sufficiently verified, documented and structurally
> eligible to enter Opportunity Engineering?

Criteria:

-   [ ] Identity completeness.
-   [ ] Ownership verification.
-   [ ] Existence verification.
-   [ ] Provenance quality.
-   [ ] Legal rights.
-   [ ] Transferability.
-   [ ] Documentation completeness.
-   [ ] Counterparty verification.
-   [ ] Jurisdiction eligibility.
-   [ ] Regulatory eligibility.
-   [ ] Data quality.
-   [ ] Valuation availability.
-   [ ] Critical DD issues.
-   [ ] Open exceptions.

Do NOT use qualification for:

-   [ ] Investment thesis.
-   [ ] Investor risk appetite.
-   [ ] Target IRR.
-   [ ] NPV.
-   [ ] Exit multiple.
-   [ ] Full investment scenario analysis.

------------------------------------------------------------------------

# 22. Asset Completeness Engine

Calculate:

-   [ ] Identity completeness.
-   [ ] Ownership completeness.
-   [ ] Rights completeness.
-   [ ] Evidence completeness.
-   [ ] Legal completeness.
-   [ ] Counterparty completeness.
-   [ ] Financial data completeness.
-   [ ] Valuation completeness.
-   [ ] DD completeness.
-   [ ] Risk completeness.
-   [ ] Compliance completeness.

Example:

``` text
Asset Readiness

Identity             100%
Ownership             92%
Legal                 86%
Evidence              94%
Financial Data        88%
Counterparty         100%
Valuation             100%
DD                     76%

Overall                89%
```

------------------------------------------------------------------------

# 23. Blocker Engine

Every case should expose:

-   [ ] Critical blockers.
-   [ ] High blockers.
-   [ ] Medium blockers.
-   [ ] Informational gaps.
-   [ ] Owner.
-   [ ] Due date.
-   [ ] Resolution action.
-   [ ] Evidence.
-   [ ] Resolution status.

Example:

``` text
ENGINEERING BLOCKERS — 3

RED  Missing legal ownership evidence
RED  Transferability not confirmed
AMBER Valuation older than 12 months
```

------------------------------------------------------------------------

# 24. Compliance OS Integration

Do not recreate compliance functionality inside Origination.

Integrate:

-   [ ] Entity lookup.
-   [ ] KYC status.
-   [ ] KYB status.
-   [ ] UBO status.
-   [ ] Sanctions status.
-   [ ] PEP status.
-   [ ] AML risk.
-   [ ] Jurisdiction eligibility.
-   [ ] Regulatory assessment.
-   [ ] Compliance exceptions.
-   [ ] Assessment version.
-   [ ] Assessment timestamp.

Store a reference/snapshot sufficient for audit.

------------------------------------------------------------------------

# 25. Legal Verification

Implement legal review workflows for:

-   [ ] Ownership.
-   [ ] Rights.
-   [ ] Transferability.
-   [ ] Encumbrances.
-   [ ] Contracts.
-   [ ] Title.
-   [ ] Security.
-   [ ] Litigation.
-   [ ] Regulatory restrictions.
-   [ ] Tokenization rights.

Support:

-   [ ] Legal checklist.
-   [ ] Legal findings.
-   [ ] Legal opinion.
-   [ ] Legal exceptions.
-   [ ] Legal approval.
-   [ ] Legal rejection.
-   [ ] Re-review.

------------------------------------------------------------------------

# 26. Due Diligence

Create `DueDiligenceCase`.

## 26.1 DD categories

-   [ ] Legal.
-   [ ] Financial.
-   [ ] Tax.
-   [ ] Commercial.
-   [ ] Regulatory.
-   [ ] Operational.
-   [ ] Technical.
-   [ ] ESG.
-   [ ] Insurance.
-   [ ] Cyber.
-   [ ] Digital asset.
-   [ ] Custody.
-   [ ] Smart contract.

## 26.2 DD program

-   [ ] DD template.
-   [ ] Asset-class-specific checklist.
-   [ ] Jurisdiction-specific checklist.
-   [ ] Materiality thresholds.
-   [ ] Mandatory evidence.
-   [ ] Reviewer assignment.
-   [ ] Due dates.
-   [ ] SLA.
-   [ ] Escalation.

## 26.3 DD finding

-   [ ] Finding ID.
-   [ ] Category.
-   [ ] Severity.
-   [ ] Description.
-   [ ] Evidence.
-   [ ] Impact.
-   [ ] Recommendation.
-   [ ] Remediation.
-   [ ] Owner.
-   [ ] Due date.
-   [ ] Status.
-   [ ] Reviewer.

Severity:

-   [ ] Critical.
-   [ ] High.
-   [ ] Medium.
-   [ ] Low.
-   [ ] Informational.

------------------------------------------------------------------------

# 27. Valuation

## 27.1 Asset valuation facts

Capture:

-   [ ] Current market value.
-   [ ] Fair value.
-   [ ] Book value.
-   [ ] NAV.
-   [ ] Face value.
-   [ ] Outstanding principal.
-   [ ] Indicative acquisition value.
-   [ ] Purchase price.
-   [ ] Valuation date.
-   [ ] Valuation source.
-   [ ] Valuer.
-   [ ] Methodology.
-   [ ] Confidence.
-   [ ] Currency.

## 27.2 Valuation workflow

-   [ ] Request valuation.
-   [ ] Assign valuer.
-   [ ] Upload valuation.
-   [ ] Review valuation.
-   [ ] Approve valuation.
-   [ ] Reject valuation.
-   [ ] Revalue.
-   [ ] Maintain valuation history.

## 27.3 Keep out of Origination

-   [ ] Investment DCF.
-   [ ] IRR optimization.
-   [ ] XIRR.
-   [ ] Scenario valuation.
-   [ ] Exit valuation.
-   [ ] Investor return optimization.

These belong in Opportunity Engineering.

------------------------------------------------------------------------

# 28. Asset-Level Risk

Create `AssetRiskAssessment`.

Risk categories:

-   [ ] Ownership risk.
-   [ ] Legal risk.
-   [ ] Documentation risk.
-   [ ] Counterparty risk.
-   [ ] Jurisdiction risk.
-   [ ] Regulatory eligibility risk.
-   [ ] Valuation confidence risk.
-   [ ] Data quality risk.
-   [ ] Operational risk.
-   [ ] Asset-specific market risk.
-   [ ] Technology risk.
-   [ ] Smart contract risk.
-   [ ] Custody risk.
-   [ ] Concentration risk.
-   [ ] Fraud/provenance risk.

For every risk:

-   [ ] Risk ID.
-   [ ] Category.
-   [ ] Description.
-   [ ] Probability.
-   [ ] Impact.
-   [ ] Score.
-   [ ] Mitigation.
-   [ ] Owner.
-   [ ] Due date.
-   [ ] Evidence.
-   [ ] Status.

------------------------------------------------------------------------

# 29. Approval Engine

Implement:

``` text
DRAFT
 ↓
SUBMITTED
 ↓
INTAKE
 ↓
SCREENING
 ↓
QUALIFICATION
 ↓
DUE_DILIGENCE
 ↓
VALUATION
 ↓
ASSET_RISK_REVIEW
 ↓
READY_FOR_APPROVAL
 ↓
APPROVAL_IN_PROGRESS
 ↓
APPROVED
 ↓
ENGINEERING_READY
```

Exception states:

-   [ ] Rejected.
-   [ ] Withdrawn.
-   [ ] On hold.
-   [ ] Superseded.

Approval model:

-   [ ] Single approver.
-   [ ] Multi-level approval.
-   [ ] Parallel approval.
-   [ ] Sequential approval.
-   [ ] Conditional approval.
-   [ ] Delegated authority.
-   [ ] Approval thresholds.
-   [ ] Conflict-of-interest check.
-   [ ] Approval evidence.
-   [ ] Approval timestamp.
-   [ ] Rejection reason.

------------------------------------------------------------------------

# 30. Engineering Readiness

Create `EngineeringReadinessAssessment`.

Checks:

-   [ ] Asset identity.
-   [ ] Ownership.
-   [ ] Beneficial ownership.
-   [ ] Legal rights.
-   [ ] Transferability.
-   [ ] Provenance.
-   [ ] Evidence.
-   [ ] Counterparties.
-   [ ] Compliance.
-   [ ] DD.
-   [ ] Valuation.
-   [ ] Asset risk.
-   [ ] Data completeness.
-   [ ] Critical blockers.
-   [ ] High blockers.
-   [ ] Open exceptions.

Output:

``` text
READY
CONDITIONALLY_READY
NOT_READY
```

Publish:

`AssetEngineeringReady`

------------------------------------------------------------------------

# 31. Asset Pooling

Create `AssetPool`.

-   [ ] Pool ID.
-   [ ] Pool name.
-   [ ] Pool type.
-   [ ] Pool strategy.
-   [ ] Eligibility policy.
-   [ ] Constituent assets.
-   [ ] Concentration rules.
-   [ ] Gross value.
-   [ ] Net value.
-   [ ] Outstanding value.
-   [ ] Currency.
-   [ ] Jurisdictions.
-   [ ] Weighted average maturity.
-   [ ] Weighted average LTV.
-   [ ] Concentration.
-   [ ] Pool status.

Support:

-   [ ] Add asset.
-   [ ] Remove asset.
-   [ ] Split pool.
-   [ ] Merge pool.
-   [ ] Rebalance.
-   [ ] Eligibility calculation.
-   [ ] Pool versioning.

------------------------------------------------------------------------

# 32. Communications / Interaction History

Create `Interaction`.

Types:

-   [ ] Email.
-   [ ] Meeting.
-   [ ] Call.
-   [ ] Message.
-   [ ] Data request.
-   [ ] Document request.
-   [ ] Site visit.
-   [ ] Negotiation.
-   [ ] Review.

Link to:

-   [ ] Origination Case.
-   [ ] Asset.
-   [ ] Source.
-   [ ] Counterparty.

------------------------------------------------------------------------

# 33. Task Management

Create task engine.

-   [ ] Task.
-   [ ] Owner.
-   [ ] Assignee.
-   [ ] Priority.
-   [ ] SLA.
-   [ ] Due date.
-   [ ] Dependency.
-   [ ] Status.
-   [ ] Evidence.
-   [ ] Escalation.

Task types:

-   [ ] Request document.
-   [ ] Verify ownership.
-   [ ] Legal review.
-   [ ] Compliance review.
-   [ ] DD.
-   [ ] Valuation.
-   [ ] Risk review.
-   [ ] Approval.
-   [ ] Resolve blocker.

------------------------------------------------------------------------

# 34. API / Ingestion Layer

Support:

-   [ ] REST API.
-   [ ] Webhooks.
-   [ ] SFTP.
-   [ ] CSV.
-   [ ] Excel.
-   [ ] JSON.
-   [ ] Event streaming.
-   [ ] Partner APIs.
-   [ ] Registry APIs.
-   [ ] Blockchain adapters.

Implement:

-   [ ] Schema validation.
-   [ ] Idempotency.
-   [ ] Authentication.
-   [ ] Authorization.
-   [ ] Rate limiting.
-   [ ] Replay.
-   [ ] Dead-letter queue.
-   [ ] Error handling.
-   [ ] Import status.
-   [ ] Import audit.
-   [ ] Mapping templates.

------------------------------------------------------------------------

# 35. External Originator Portal

Build separate external experience.

Features:

-   [ ] Login.
-   [ ] Organization profile.
-   [ ] Submit asset.
-   [ ] Upload documents.
-   [ ] Answer DD.
-   [ ] Respond to data requests.
-   [ ] View status.
-   [ ] View outstanding actions.
-   [ ] View communications.
-   [ ] View submission history.
-   [ ] Withdraw submission.
-   [ ] Resubmit rejected submission.

Security:

-   [ ] Tenant isolation.
-   [ ] External RBAC.
-   [ ] Document access controls.
-   [ ] MFA.
-   [ ] Audit.
-   [ ] Session controls.

------------------------------------------------------------------------

# 36. Internal UI Inventory

## 36.1 Navigation

``` text
ASSET ORIGINATION

Command Center

Origination
 ├── Inbox
 ├── Cases
 ├── Submissions
 ├── Pipeline
 └── Tasks

Assets
 ├── All Assets
 ├── Asset Pools
 ├── Asset Profiles
 └── Relationships

Sources
 ├── Originators
 ├── Brokers
 ├── Partners
 └── Source Performance

Counterparties
 ├── Owners
 ├── Borrowers
 ├── Sellers
 ├── Operators
 └── Service Providers

Verification
 ├── Ownership
 ├── Provenance
 ├── Legal Rights
 ├── Transferability
 └── Evidence

Due Diligence
 ├── DD Workspace
 ├── Checklists
 ├── Findings
 ├── Exceptions
 └── Reports

Valuation
 ├── Valuations
 ├── Requests
 └── History

Risk
 ├── Reviews
 ├── Risk Register
 └── Mitigations

Approvals
 ├── Pending
 ├── Conditional
 ├── Approved
 └── Rejected

Data Room
Documents
Data Requests
Analytics
Audit
Settings
```

------------------------------------------------------------------------

# 37. Command Center UI

Widgets:

-   [ ] New submissions.
-   [ ] Active cases.
-   [ ] Screening.
-   [ ] Qualification.
-   [ ] DD.
-   [ ] Awaiting documents.
-   [ ] Awaiting review.
-   [ ] Qualified assets.
-   [ ] Approved assets.
-   [ ] Rejected assets.
-   [ ] Pipeline asset value.
-   [ ] SLA breaches.
-   [ ] Critical blockers.
-   [ ] Recent activity.
-   [ ] Source performance.

Charts:

-   [ ] Origination funnel.
-   [ ] Asset value by class.
-   [ ] Asset value by jurisdiction.
-   [ ] Case ageing.
-   [ ] Qualification rate.
-   [ ] Approval rate.
-   [ ] Source performance.

------------------------------------------------------------------------

# 38. Origination Inbox UI

Columns:

-   [ ] Case number.
-   [ ] Asset name.
-   [ ] Asset class.
-   [ ] Source.
-   [ ] Value.
-   [ ] Jurisdiction.
-   [ ] Status.
-   [ ] Owner.
-   [ ] Priority.
-   [ ] SLA.
-   [ ] Last activity.
-   [ ] Next action.

Filters:

-   [ ] Asset class.
-   [ ] Jurisdiction.
-   [ ] Source.
-   [ ] Status.
-   [ ] Owner.
-   [ ] Priority.
-   [ ] Value range.
-   [ ] Date range.
-   [ ] SLA.
-   [ ] Blockers.

------------------------------------------------------------------------

# 39. New Origination Case Wizard

## Step 1 --- Submission

-   [ ] Source.
-   [ ] Submitter.
-   [ ] Channel.
-   [ ] Submission type.
-   [ ] Case name.
-   [ ] Description.

## Step 2 --- Asset classification

-   [ ] Asset class.
-   [ ] Asset subclass.
-   [ ] Jurisdiction.
-   [ ] Country.
-   [ ] Currency.

## Step 3 --- Indicative economics

Capture facts only:

-   [ ] Indicative value.
-   [ ] Purchase price if known.
-   [ ] Face value if applicable.
-   [ ] Outstanding principal if applicable.
-   [ ] Income if contractual/observed.

## Step 4 --- Counterparties

-   [ ] Owner.
-   [ ] Sponsor.
-   [ ] Seller.
-   [ ] Borrower.
-   [ ] Other parties.

## Step 5 --- Documents

-   [ ] Upload.
-   [ ] Link existing document.
-   [ ] Request later.

## Step 6 --- Duplicate check

-   [ ] Search.
-   [ ] Match.
-   [ ] Resolve.

## Step 7 --- Review

-   [ ] Summary.
-   [ ] Missing fields.
-   [ ] Potential blockers.
-   [ ] Submit.

------------------------------------------------------------------------

# 40. New Asset Wizard

-   [ ] Asset identity.
-   [ ] Classification.
-   [ ] Jurisdiction.
-   [ ] Asset-specific profile.
-   [ ] Ownership.
-   [ ] Rights.
-   [ ] Encumbrances.
-   [ ] Counterparties.
-   [ ] Provenance.
-   [ ] Documents.
-   [ ] Transferability.
-   [ ] Review.
-   [ ] Create asset.

Wizard capabilities:

-   [ ] Save draft.
-   [ ] Resume.
-   [ ] Save & exit.
-   [ ] Assign.
-   [ ] Request information.
-   [ ] Validate.
-   [ ] Preview.
-   [ ] Audit changes.

------------------------------------------------------------------------

# 41. Asset 360 UI

Header:

``` text
Asset Name
Asset ID
Asset Class
Jurisdiction
Status
Readiness Score
```

Tabs:

-   [ ] Overview.
-   [ ] Identity.
-   [ ] Ownership.
-   [ ] Rights.
-   [ ] Encumbrances.
-   [ ] Counterparties.
-   [ ] Provenance.
-   [ ] Verification.
-   [ ] Transferability.
-   [ ] Economics.
-   [ ] DD.
-   [ ] Valuation.
-   [ ] Risk.
-   [ ] Documents.
-   [ ] Relationships.
-   [ ] Timeline.
-   [ ] Audit.

Actions:

-   [ ] Edit.
-   [ ] Request data.
-   [ ] Start DD.
-   [ ] Request valuation.
-   [ ] Start review.
-   [ ] Submit approval.
-   [ ] Put on hold.
-   [ ] Reject.
-   [ ] Approve.
-   [ ] Mark engineering ready.

------------------------------------------------------------------------

# 42. Ownership UI

Display:

-   [ ] Ownership table.
-   [ ] Legal ownership.
-   [ ] Economic ownership.
-   [ ] Beneficial ownership.
-   [ ] Control.
-   [ ] Ownership history.
-   [ ] Ownership graph.
-   [ ] Evidence.
-   [ ] Verification status.

Modals:

-   [ ] Add owner.
-   [ ] Edit ownership.
-   [ ] Add UBO.
-   [ ] Add control relationship.
-   [ ] Verify ownership.
-   [ ] View evidence.

------------------------------------------------------------------------

# 43. Rights UI

-   [ ] Rights summary.
-   [ ] Rights table.
-   [ ] Holder.
-   [ ] Right type.
-   [ ] Percentage.
-   [ ] Priority.
-   [ ] Transferability.
-   [ ] Evidence.

Modals:

-   [ ] Add right.
-   [ ] Edit right.
-   [ ] Assign holder.
-   [ ] Attach evidence.
-   [ ] Verify right.

------------------------------------------------------------------------

# 44. Encumbrance UI

-   [ ] Active encumbrances.
-   [ ] Released encumbrances.
-   [ ] Priority.
-   [ ] Holder.
-   [ ] Amount.
-   [ ] Registration.
-   [ ] Evidence.

Modals:

-   [ ] Add encumbrance.
-   [ ] Release encumbrance.
-   [ ] Update encumbrance.
-   [ ] Verify.
-   [ ] Attach document.

------------------------------------------------------------------------

# 45. Provenance UI

Use timeline + graph.

Timeline:

``` text
2021 Created
2022 Acquired
2023 Transferred
2024 Pledged
2025 Released
2026 Submitted
```

Features:

-   [ ] Event filter.
-   [ ] Source.
-   [ ] Evidence.
-   [ ] Transaction.
-   [ ] Verification.
-   [ ] Hash.
-   [ ] Blockchain link.

------------------------------------------------------------------------

# 46. Verification Workspace UI

Sections:

-   [ ] Claims.
-   [ ] Evidence.
-   [ ] Verification status.
-   [ ] Reviewer.
-   [ ] Confidence.
-   [ ] Exceptions.

Actions:

-   [ ] Verify.
-   [ ] Reject.
-   [ ] Request evidence.
-   [ ] Escalate.
-   [ ] Reverify.

------------------------------------------------------------------------

# 47. Screening UI

Show:

``` text
SCREENING RESULT

PASS
FAIL
CONDITIONAL
MANUAL REVIEW
```

Rule table:

-   [ ] Rule.
-   [ ] Result.
-   [ ] Severity.
-   [ ] Evidence.
-   [ ] Explanation.
-   [ ] Override.
-   [ ] Reviewer.

------------------------------------------------------------------------

# 48. Qualification UI

Show readiness matrix:

-   [ ] Identity.
-   [ ] Ownership.
-   [ ] Legal.
-   [ ] Evidence.
-   [ ] Compliance.
-   [ ] DD.
-   [ ] Valuation.
-   [ ] Transferability.
-   [ ] Data quality.
-   [ ] Risk.

Show:

-   [ ] Score.
-   [ ] Blockers.
-   [ ] Exceptions.
-   [ ] Missing evidence.
-   [ ] Reviewer recommendation.

------------------------------------------------------------------------

# 49. DD Workspace UI

-   [ ] DD dashboard.
-   [ ] Checklist.
-   [ ] Findings.
-   [ ] Evidence.
-   [ ] Requests.
-   [ ] Exceptions.
-   [ ] Reviewer assignment.
-   [ ] Report.
-   [ ] Approval.

Finding modal:

-   [ ] Category.
-   [ ] Severity.
-   [ ] Description.
-   [ ] Evidence.
-   [ ] Impact.
-   [ ] Recommendation.
-   [ ] Remediation.
-   [ ] Owner.
-   [ ] Due date.

------------------------------------------------------------------------

# 50. Valuation UI

-   [ ] Current value.
-   [ ] Previous values.
-   [ ] Valuation date.
-   [ ] Valuer.
-   [ ] Methodology.
-   [ ] Confidence.
-   [ ] Source.
-   [ ] Supporting document.

Actions:

-   [ ] Request valuation.
-   [ ] Upload valuation.
-   [ ] Review.
-   [ ] Approve.
-   [ ] Reject.
-   [ ] Revalue.

------------------------------------------------------------------------

# 51. Risk UI

-   [ ] Risk score.
-   [ ] Risk categories.
-   [ ] Heatmap.
-   [ ] Risk register.
-   [ ] Mitigations.
-   [ ] Open issues.
-   [ ] Owner.
-   [ ] Due dates.
-   [ ] Risk history.

------------------------------------------------------------------------

# 52. Approval UI

Show:

-   [ ] Approval stage.
-   [ ] Approvers.
-   [ ] Delegation.
-   [ ] Conditions.
-   [ ] Exceptions.
-   [ ] Evidence.
-   [ ] Decision history.

Modals:

-   [ ] Approve.
-   [ ] Conditional approve.
-   [ ] Reject.
-   [ ] Request changes.
-   [ ] Escalate.
-   [ ] Delegate.

------------------------------------------------------------------------

# 53. Engineering Readiness UI

``` text
ENGINEERING READINESS

Identity                 ✓
Ownership                ✓
Rights                   ✓
Legal                    ✓
Transferability          ✓
Evidence                 ✓
Compliance               ✓
DD                       ✓
Valuation                ✓
Risk                     ✓

Critical Blockers        0
High Blockers            0
Open Exceptions          2

READY FOR
OPPORTUNITY ENGINEERING
```

Actions:

-   [ ] View blockers.
-   [ ] Resolve blocker.
-   [ ] Approve readiness.
-   [ ] Send to Opportunity Engineering.

------------------------------------------------------------------------

# 54. Asset Pool UI

-   [ ] Pool dashboard.
-   [ ] Pool composition.
-   [ ] Eligibility.
-   [ ] Concentration.
-   [ ] Value.
-   [ ] Maturity.
-   [ ] LTV.
-   [ ] Jurisdiction.
-   [ ] Asset list.

Actions:

-   [ ] Create pool.
-   [ ] Add asset.
-   [ ] Remove asset.
-   [ ] Rebalance.
-   [ ] Split.
-   [ ] Merge.
-   [ ] Validate eligibility.

------------------------------------------------------------------------

# 55. Source UI

Pages:

-   [ ] Source directory.
-   [ ] Source profile.
-   [ ] Agreements.
-   [ ] Submissions.
-   [ ] Asset pipeline.
-   [ ] Performance.
-   [ ] Contacts.
-   [ ] Communication history.

------------------------------------------------------------------------

# 56. Data Request UI

-   [ ] Request inbox.
-   [ ] Outstanding.
-   [ ] Overdue.
-   [ ] Received.
-   [ ] Rejected.
-   [ ] Request history.

Modal:

-   [ ] Recipient.
-   [ ] Request.
-   [ ] Required documents.
-   [ ] Deadline.
-   [ ] Priority.
-   [ ] Message.

------------------------------------------------------------------------

# 57. External Submission UI

Create external submission wizard:

-   [ ] Organization.
-   [ ] Asset class.
-   [ ] Asset profile.
-   [ ] Ownership.
-   [ ] Counterparties.
-   [ ] Value.
-   [ ] Documents.
-   [ ] Declaration.
-   [ ] Submit.

------------------------------------------------------------------------

# 58. Bulk Import UI

-   [ ] Select template.
-   [ ] Upload CSV/Excel.
-   [ ] Mapping.
-   [ ] Validation.
-   [ ] Preview.
-   [ ] Duplicate detection.
-   [ ] Import.
-   [ ] Error report.
-   [ ] Import history.

------------------------------------------------------------------------

# 59. Search

Global search must support:

-   [ ] Asset ID.
-   [ ] Asset name.
-   [ ] External ID.
-   [ ] Owner.
-   [ ] Source.
-   [ ] Counterparty.
-   [ ] Case number.
-   [ ] Contract address.
-   [ ] Registry number.
-   [ ] Pool.
-   [ ] Opportunity ID.

------------------------------------------------------------------------

# 60. Audit

Capture:

-   [ ] Login.
-   [ ] Create.
-   [ ] Update.
-   [ ] Delete/void.
-   [ ] State transition.
-   [ ] Approval.
-   [ ] Rejection.
-   [ ] Evidence change.
-   [ ] Document access.
-   [ ] Data export.
-   [ ] Permission change.
-   [ ] Policy change.
-   [ ] API action.
-   [ ] Integration action.

Audit record:

-   [ ] Actor.
-   [ ] Tenant.
-   [ ] Timestamp.
-   [ ] Action.
-   [ ] Entity.
-   [ ] Entity ID.
-   [ ] Before.
-   [ ] After.
-   [ ] Reason.
-   [ ] Source.
-   [ ] Correlation ID.

------------------------------------------------------------------------

# 61. RBAC / ABAC

Roles:

-   [ ] Admin.
-   [ ] Originator.
-   [ ] Analyst.
-   [ ] DD Analyst.
-   [ ] Legal.
-   [ ] Compliance.
-   [ ] Valuation.
-   [ ] Risk.
-   [ ] Approver.
-   [ ] Operations.
-   [ ] External Originator.

Implement:

-   [ ] Tenant-level permissions.
-   [ ] Asset-level permissions.
-   [ ] Case-level permissions.
-   [ ] Document permissions.
-   [ ] Field-level permissions.
-   [ ] Segregation of duties.
-   [ ] Approval authority.
-   [ ] External access isolation.

------------------------------------------------------------------------

# 62. Multi-Tenancy

-   [ ] Tenant ID on all tenant-owned entities.
-   [ ] Row-level isolation.
-   [ ] Tenant-specific policies.
-   [ ] Tenant-specific asset schemas.
-   [ ] Tenant-specific workflows.
-   [ ] Tenant-specific approval rules.
-   [ ] Tenant-specific DD templates.
-   [ ] Tenant-specific screening rules.
-   [ ] Tenant-specific branding.
-   [ ] Tenant-specific retention.
-   [ ] Tenant-specific permissions.

------------------------------------------------------------------------

# 63. Event Model

Publish domain events.

-   [ ] `OriginationCaseCreated`
-   [ ] `SubmissionReceived`
-   [ ] `AssetCreated`
-   [ ] `AssetUpdated`
-   [ ] `DuplicateDetected`
-   [ ] `OwnershipVerified`
-   [ ] `EvidenceAdded`
-   [ ] `ClaimVerified`
-   [ ] `TransferabilityAssessed`
-   [ ] `ScreeningCompleted`
-   [ ] `QualificationCompleted`
-   [ ] `DDStarted`
-   [ ] `DDFindingCreated`
-   [ ] `DDCompleted`
-   [ ] `ValuationCreated`
-   [ ] `RiskAssessmentCompleted`
-   [ ] `ApprovalRequested`
-   [ ] `AssetApproved`
-   [ ] `AssetRejected`
-   [ ] `EngineeringReadinessCompleted`
-   [ ] `AssetEngineeringReady`
-   [ ] `AssetPoolCreated`
-   [ ] `AssetAddedToPool`

Requirements:

-   [ ] Event versioning.
-   [ ] Idempotency.
-   [ ] Correlation IDs.
-   [ ] Causation IDs.
-   [ ] Schema registry.
-   [ ] Retry.
-   [ ] Dead-letter handling.
-   [ ] Event replay.

------------------------------------------------------------------------

# 64. API Inventory

## Origination Case

-   [ ] `POST /origination-cases`
-   [ ] `GET /origination-cases`
-   [ ] `GET /origination-cases/:id`
-   [ ] `PATCH /origination-cases/:id`
-   [ ] `POST /origination-cases/:id/submit`
-   [ ] `POST /origination-cases/:id/assign`
-   [ ] `POST /origination-cases/:id/hold`
-   [ ] `POST /origination-cases/:id/reopen`

## Assets

-   [ ] `POST /assets`
-   [ ] `GET /assets`
-   [ ] `GET /assets/:id`
-   [ ] `PATCH /assets/:id`
-   [ ] `GET /assets/:id/versions`
-   [ ] `GET /assets/:id/relationships`
-   [ ] `GET /assets/:id/timeline`

## Ownership

-   [ ] `GET /assets/:id/ownership`
-   [ ] `POST /assets/:id/ownership`
-   [ ] `PATCH /ownership/:id`
-   [ ] `POST /ownership/:id/verify`

## Rights

-   [ ] `GET /assets/:id/rights`
-   [ ] `POST /assets/:id/rights`
-   [ ] `PATCH /rights/:id`
-   [ ] `POST /rights/:id/verify`

## Encumbrances

-   [ ] `GET /assets/:id/encumbrances`
-   [ ] `POST /assets/:id/encumbrances`
-   [ ] `PATCH /encumbrances/:id`
-   [ ] `POST /encumbrances/:id/release`

## Evidence

-   [ ] `GET /assets/:id/evidence`
-   [ ] `POST /assets/:id/evidence`
-   [ ] `POST /evidence/:id/verify`
-   [ ] `POST /evidence/:id/reject`

## Screening

-   [ ] `POST /origination-cases/:id/screen`
-   [ ] `GET /origination-cases/:id/screening`
-   [ ] `POST /screening/:id/override`

## Qualification

-   [ ] `POST /origination-cases/:id/qualify`
-   [ ] `GET /origination-cases/:id/qualification`

## DD

-   [ ] `POST /origination-cases/:id/due-diligence`
-   [ ] `GET /due-diligence/:id`
-   [ ] `POST /due-diligence/:id/findings`
-   [ ] `PATCH /dd-findings/:id`
-   [ ] `POST /due-diligence/:id/complete`

## Valuation

-   [ ] `POST /assets/:id/valuation-requests`
-   [ ] `POST /assets/:id/valuations`
-   [ ] `GET /assets/:id/valuations`
-   [ ] `POST /valuations/:id/approve`

## Risk

-   [ ] `POST /assets/:id/risk-assessments`
-   [ ] `GET /assets/:id/risk`
-   [ ] `POST /risk/:id/complete`

## Approval

-   [ ] `POST /origination-cases/:id/approval`
-   [ ] `GET /approvals`
-   [ ] `POST /approvals/:id/approve`
-   [ ] `POST /approvals/:id/reject`
-   [ ] `POST /approvals/:id/request-changes`

## Readiness

-   [ ] `POST /origination-cases/:id/engineering-readiness`
-   [ ] `GET /origination-cases/:id/engineering-readiness`
-   [ ] `POST /origination-cases/:id/mark-engineering-ready`

------------------------------------------------------------------------

# 65. Database Model

Core tables:

-   [ ] `origination_cases`
-   [ ] `submissions`
-   [ ] `assets`
-   [ ] `asset_versions`
-   [ ] `asset_profiles`
-   [ ] `asset_identifiers`
-   [ ] `asset_relationships`
-   [ ] `asset_ownership`
-   [ ] `asset_rights`
-   [ ] `asset_encumbrances`
-   [ ] `asset_counterparties`
-   [ ] `asset_provenance`
-   [ ] `asset_claims`
-   [ ] `evidence`
-   [ ] `data_requests`
-   [ ] `screening_policies`
-   [ ] `screening_results`
-   [ ] `qualification_results`
-   [ ] `dd_cases`
-   [ ] `dd_findings`
-   [ ] `valuations`
-   [ ] `risk_assessments`
-   [ ] `risk_items`
-   [ ] `approval_cases`
-   [ ] `approval_decisions`
-   [ ] `engineering_readiness`
-   [ ] `asset_pools`
-   [ ] `asset_pool_members`
-   [ ] `sources`
-   [ ] `source_contacts`
-   [ ] `source_agreements`
-   [ ] `interactions`
-   [ ] `tasks`
-   [ ] `audit_events`
-   [ ] `workflow_instances`

------------------------------------------------------------------------

# 66. Database Constraints

-   [ ] Unique tenant + asset ID.
-   [ ] Unique external identifiers where required.
-   [ ] Valid ownership percentages.
-   [ ] Valid effective date ranges.
-   [ ] No overlapping active ownership where prohibited.
-   [ ] Valid encumbrance priority.
-   [ ] Foreign keys.
-   [ ] Tenant isolation.
-   [ ] Optimistic locking.
-   [ ] Soft deletion only where legally appropriate.
-   [ ] Immutable audit records.
-   [ ] Immutable historical versions.

------------------------------------------------------------------------

# 67. Workflow Engine

Implement configurable workflow.

-   [ ] State machine.
-   [ ] State transitions.
-   [ ] Transition guards.
-   [ ] Required evidence.
-   [ ] Required approvals.
-   [ ] Required fields.
-   [ ] Role restrictions.
-   [ ] SLA timers.
-   [ ] Escalations.
-   [ ] Rework loops.
-   [ ] Conditional paths.
-   [ ] Parallel tasks.
-   [ ] Workflow versioning.

------------------------------------------------------------------------

# 68. Notification Engine

Notify for:

-   [ ] New submission.
-   [ ] Assignment.
-   [ ] Data request.
-   [ ] Document received.
-   [ ] DD finding.
-   [ ] SLA breach.
-   [ ] Approval request.
-   [ ] Approval decision.
-   [ ] Risk escalation.
-   [ ] Engineering readiness.
-   [ ] Rejection.
-   [ ] Rework.

Channels:

-   [ ] In-app.
-   [ ] Email.
-   [ ] Webhook.
-   [ ] External portal notification.

------------------------------------------------------------------------

# 69. Search / Indexing

Index:

-   [ ] Asset ID.
-   [ ] Asset name.
-   [ ] Asset class.
-   [ ] Jurisdiction.
-   [ ] Owner.
-   [ ] Source.
-   [ ] Counterparty.
-   [ ] Case number.
-   [ ] Registry number.
-   [ ] Contract address.
-   [ ] Pool.
-   [ ] Status.

Support:

-   [ ] Full-text.
-   [ ] Faceted search.
-   [ ] Fuzzy search.
-   [ ] Saved searches.
-   [ ] Advanced filters.
-   [ ] Search permissions.

------------------------------------------------------------------------

# 70. Analytics

Metrics:

-   [ ] Submission volume.
-   [ ] Origination conversion.
-   [ ] Screening pass rate.
-   [ ] Qualification rate.
-   [ ] DD pass rate.
-   [ ] Approval rate.
-   [ ] Rejection rate.
-   [ ] Average time to qualification.
-   [ ] Average time to approval.
-   [ ] Average DD duration.
-   [ ] SLA breach rate.
-   [ ] Asset value by class.
-   [ ] Asset value by geography.
-   [ ] Source performance.
-   [ ] Blocker frequency.
-   [ ] DD finding frequency.
-   [ ] Risk distribution.

------------------------------------------------------------------------

# 71. AI / Intelligence Layer

## 71.1 Document intelligence

-   [ ] OCR.
-   [ ] Classification.
-   [ ] Field extraction.
-   [ ] Entity extraction.
-   [ ] Contract extraction.
-   [ ] Ownership extraction.
-   [ ] Obligation extraction.
-   [ ] Date extraction.
-   [ ] Financial extraction.

## 71.2 AI verification assistance

-   [ ] Claim generation.
-   [ ] Evidence matching.
-   [ ] Contradiction detection.
-   [ ] Missing evidence detection.
-   [ ] Data anomaly detection.
-   [ ] Confidence score.
-   [ ] Human review.

## 71.3 AI DD assistance

-   [ ] DD checklist suggestions.
-   [ ] Document gap detection.
-   [ ] Risk finding suggestions.
-   [ ] Contract risk extraction.
-   [ ] Red-flag detection.
-   [ ] Comparable evidence search.

## 71.4 AI guardrails

-   [ ] Human-in-the-loop.
-   [ ] Explainability.
-   [ ] Source citations.
-   [ ] Confidence.
-   [ ] Model/version tracking.
-   [ ] Prompt/version tracking.
-   [ ] No autonomous approval.
-   [ ] Audit AI outputs.

------------------------------------------------------------------------

# 72. Security

-   [ ] OIDC/OAuth2.
-   [ ] MFA.
-   [ ] RBAC.
-   [ ] ABAC.
-   [ ] Tenant isolation.
-   [ ] Encryption at rest.
-   [ ] Encryption in transit.
-   [ ] Secrets management.
-   [ ] Key rotation.
-   [ ] API authentication.
-   [ ] Rate limiting.
-   [ ] WAF.
-   [ ] Audit.
-   [ ] Secure document access.
-   [ ] Data masking.
-   [ ] PII controls.
-   [ ] Export controls.
-   [ ] Session controls.

------------------------------------------------------------------------

# 73. Observability

-   [ ] Structured logging.
-   [ ] Metrics.
-   [ ] Distributed tracing.
-   [ ] Correlation ID.
-   [ ] Causation ID.
-   [ ] Health checks.
-   [ ] Readiness checks.
-   [ ] Error tracking.
-   [ ] Queue monitoring.
-   [ ] Workflow monitoring.
-   [ ] Integration monitoring.
-   [ ] SLA monitoring.

------------------------------------------------------------------------

# 74. Reliability

-   [ ] Idempotent commands.
-   [ ] Transaction boundaries.
-   [ ] Outbox pattern.
-   [ ] Inbox pattern.
-   [ ] Retry policy.
-   [ ] Dead-letter queues.
-   [ ] Circuit breakers.
-   [ ] Timeouts.
-   [ ] Bulkheads.
-   [ ] Backpressure.
-   [ ] Replay.
-   [ ] Disaster recovery.
-   [ ] Backup.
-   [ ] Restore testing.

------------------------------------------------------------------------

# 75. Testing

## Unit

-   [ ] Domain entities.
-   [ ] Value objects.
-   [ ] State transitions.
-   [ ] Screening rules.
-   [ ] Qualification rules.
-   [ ] Readiness rules.
-   [ ] Validation.
-   [ ] Risk calculations.

## Integration

-   [ ] Database.
-   [ ] Document Service.
-   [ ] Entity Studio.
-   [ ] Compliance OS.
-   [ ] Asset Registry.
-   [ ] Opportunity Engineering.
-   [ ] Notification.
-   [ ] Search.

## End-to-end

-   [ ] Manual origination.
-   [ ] External submission.
-   [ ] Bulk import.
-   [ ] Screening.
-   [ ] Qualification.
-   [ ] DD.
-   [ ] Approval.
-   [ ] Engineering handoff.

## Security

-   [ ] Tenant isolation.
-   [ ] RBAC.
-   [ ] ABAC.
-   [ ] Document authorization.
-   [ ] API authorization.
-   [ ] Audit integrity.

## Performance

-   [ ] Large asset list.
-   [ ] Large data room.
-   [ ] Bulk ingestion.
-   [ ] Search.
-   [ ] Relationship graph.
-   [ ] Concurrent approvals.
-   [ ] Event processing.

------------------------------------------------------------------------

# 76. Opportunity Engineering Boundary

Explicitly hand off only:

``` text
EngineeringReadyAsset
```

Containing references to:

-   [ ] Canonical asset.
-   [ ] Verified ownership.
-   [ ] Legal rights.
-   [ ] Transferability.
-   [ ] Evidence.
-   [ ] Compliance assessment.
-   [ ] DD result.
-   [ ] Valuation facts.
-   [ ] Asset risk.
-   [ ] Historical cash-flow facts.
-   [ ] Asset pool membership.
-   [ ] Open exceptions.
-   [ ] Readiness result.

Opportunity Engineering then owns:

-   [ ] Investment thesis.
-   [ ] Opportunity thesis.
-   [ ] Return engineering.
-   [ ] Cash-flow modelling.
-   [ ] IRR.
-   [ ] XIRR.
-   [ ] NPV.
-   [ ] MOIC.
-   [ ] Yield.
-   [ ] Scenario modelling.
-   [ ] Sensitivity.
-   [ ] Downside analysis.
-   [ ] Investor economics.
-   [ ] Capital requirements.
-   [ ] Exit modelling.

------------------------------------------------------------------------

# 77. Do Not Duplicate These Domains

-   [ ] Do not duplicate Entity Studio.
-   [ ] Do not duplicate KYC/KYB.
-   [ ] Do not duplicate AML.
-   [ ] Do not duplicate Document Service.
-   [ ] Do not duplicate canonical Asset Registry.
-   [ ] Do not duplicate token issuance.
-   [ ] Do not duplicate investor onboarding.
-   [ ] Do not duplicate investment portfolio management.
-   [ ] Do not duplicate full opportunity financial modelling.

------------------------------------------------------------------------

# 78. Refactor Existing Implementation

## Domain

-   [ ] Introduce `OriginationCase`.
-   [ ] Separate `Asset` from workflow.
-   [ ] Reduce Asset aggregate size.
-   [ ] Introduce ownership aggregate.
-   [ ] Introduce rights.
-   [ ] Introduce encumbrances.
-   [ ] Introduce evidence.
-   [ ] Introduce claims.
-   [ ] Introduce transferability.
-   [ ] Introduce counterparty model.
-   [ ] Introduce asset profiles.
-   [ ] Introduce engineering readiness.

## Persistence

-   [ ] Remove overuse of JSONB.
-   [ ] Normalize operational entities.
-   [ ] Preserve JSONB only for genuinely flexible attributes.
-   [ ] Add effective dates.
-   [ ] Add versioning.
-   [ ] Add audit columns.
-   [ ] Add tenant constraints.

## Services

-   [ ] Split oversized service classes.
-   [ ] Separate command/query responsibilities.
-   [ ] Introduce policy services.
-   [ ] Introduce workflow service.
-   [ ] Introduce evidence service.
-   [ ] Introduce readiness service.

## API

-   [ ] Fix lifecycle transition semantics.
-   [ ] Separate submit from ready-for-approval.
-   [ ] Add approval-in-progress state.
-   [ ] Add explicit rejection/hold/rework.
-   [ ] Add idempotency.
-   [ ] Add correlation IDs.

------------------------------------------------------------------------

# 79. P0 --- Must Have Before Production

-   [ ] Origination Case.
-   [ ] Asset Registry boundary.
-   [ ] Asset identity.
-   [ ] Asset classification.
-   [ ] Ownership.
-   [ ] Beneficial ownership reference.
-   [ ] Rights.
-   [ ] Encumbrances.
-   [ ] Counterparties.
-   [ ] Provenance.
-   [ ] Evidence.
-   [ ] Claims.
-   [ ] Verification.
-   [ ] Transferability.
-   [ ] Data requests.
-   [ ] Duplicate detection.
-   [ ] Screening engine.
-   [ ] Qualification engine.
-   [ ] DD.
-   [ ] Preliminary valuation.
-   [ ] Asset risk.
-   [ ] Approval.
-   [ ] Engineering readiness.
-   [ ] Audit.
-   [ ] RBAC.
-   [ ] Multi-tenancy.
-   [ ] Document integration.
-   [ ] Compliance integration.

------------------------------------------------------------------------

# 80. P1 --- Institutional Operating Capability

-   [ ] Asset-specific profiles.
-   [ ] Asset pools.
-   [ ] External originator portal.
-   [ ] Bulk import.
-   [ ] Partner APIs.
-   [ ] Workflow engine.
-   [ ] SLA engine.
-   [ ] Task engine.
-   [ ] Notifications.
-   [ ] Search.
-   [ ] Analytics.
-   [ ] Asset relationship graph.
-   [ ] Versioning.
-   [ ] Effective-dated data.
-   [ ] Advanced DD.
-   [ ] Advanced approval.
-   [ ] Valuation workflow.
-   [ ] Source performance.

------------------------------------------------------------------------

# 81. P2 --- Intelligence Layer

-   [ ] AI document extraction.
-   [ ] AI asset classification.
-   [ ] AI duplicate detection.
-   [ ] AI entity resolution.
-   [ ] AI evidence matching.
-   [ ] AI DD assistant.
-   [ ] AI risk assistant.
-   [ ] Automated completeness scoring.
-   [ ] Automated blocker detection.
-   [ ] Automated engineering-readiness recommendation.
-   [ ] Asset comparables.
-   [ ] Provenance intelligence.

------------------------------------------------------------------------

# 82. P3 --- Network / Platform Capability

-   [ ] External asset-originator network.
-   [ ] Institutional submission APIs.
-   [ ] Partner network.
-   [ ] Asset discovery marketplace.
-   [ ] Cross-tenant asset sharing controls.
-   [ ] Permissioned data rooms.
-   [ ] Asset provenance network.
-   [ ] Registry interoperability.
-   [ ] Blockchain data adapters.
-   [ ] Oracle integrations.

------------------------------------------------------------------------

# 83. Definition of Done

Asset Origination is considered production-ready only when:

-   [ ] A source can submit an asset.
-   [ ] A case is created.
-   [ ] Duplicate detection runs.
-   [ ] A canonical asset is created/linked.
-   [ ] Asset identity is complete.
-   [ ] Ownership can be represented and verified.
-   [ ] Rights can be represented.
-   [ ] Encumbrances can be represented.
-   [ ] Counterparties are linked.
-   [ ] Provenance can be reconstructed.
-   [ ] Evidence can be linked to claims.
-   [ ] Legal/transferability status is known.
-   [ ] Compliance status can be consumed.
-   [ ] Screening is policy-driven.
-   [ ] Qualification is evidence-based.
-   [ ] DD can be executed.
-   [ ] Valuation facts can be recorded.
-   [ ] Asset risk can be assessed.
-   [ ] Approval can be executed.
-   [ ] All blockers are visible.
-   [ ] Audit history is immutable.
-   [ ] Asset history is reconstructable.
-   [ ] Engineering readiness is calculated.
-   [ ] A qualified asset can be handed to Opportunity Engineering.
-   [ ] No investment return modelling is incorrectly owned by
    Origination.
-   [ ] All critical events are published.
-   [ ] All tenant boundaries are enforced.
-   [ ] External originators can be safely isolated from internal users.

------------------------------------------------------------------------

# 84. Final Target State

The final Asset Origination module should answer six questions:

## 1. WHAT IS IT?

``` text
Asset Identity
Classification
Asset Profile
External IDs
```

## 2. WHO OWNS / CONTROLS IT?

``` text
Legal Owner
Beneficial Owner
Economic Owner
Control
Rights
```

## 3. DOES IT REALLY EXIST?

``` text
Provenance
Registry
Evidence
Claims
Verification
```

## 4. CAN WE LEGALLY / COMPLIANCE-WISE HANDLE IT?

``` text
Jurisdiction
Legal Rights
Encumbrances
Transferability
Compliance
```

## 5. IS IT GOOD ENOUGH TO ENTER ENGINEERING?

``` text
Screening
Qualification
DD
Valuation
Asset Risk
Completeness
Blockers
Approval
```

## 6. IS IT READY FOR OPPORTUNITY ENGINEERING?

``` text
Engineering Readiness
        ↓
EngineeringReadyAsset
        ↓
Opportunity Engineering
```

------------------------------------------------------------------------

# 85. Architectural North Star

``` text
                    DIGITAL ASSET OPERATING SYSTEM
                              │
                              ▼
                       ┌───────────────┐
                       │ ASSET REGISTRY│
                       └───────┬───────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
     ORIGINATION         OPPORTUNITY           LIFECYCLE
          │               ENGINEERING              │
          │                    │                    │
          ▼                    ▼                    ▼
       VERIFIED           ENGINEERED            SERVICED
        ASSET             OPPORTUNITY             ASSET
          │                    │
          ▼                    ▼
       DEAL STUDIO          ISSUANCE
                              │
                              ▼
                         DISTRIBUTION
                              │
                              ▼
                       SECONDARY MARKET
```

**Core principle:**

> **Asset Origination establishes asset truth. Opportunity Engineering
> establishes investment attractiveness. Deal Studio establishes
> transaction structure. Issuance establishes the digital financial
> instrument.**

This boundary should remain stable as the Digital Assets Operating
System expands.
