import { OriginationCaseId, OutboxPublisher, TenantId } from '@daos/shared-kernel';
import { Inject, Injectable, Logger } from '@nestjs/common';

import { ORIGINATION_CASE_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { OriginationCase } from '../../origination-case/domain/aggregates/origination-case.aggregate';
import { OriginationCaseRepository } from '../../origination-case/domain/repositories/origination-case.repository';
import {
  CaseActivities,
  DuplicateCheckResult,
  InitialScreeningResult,
  OriginationCaseStateUpdateInput,
} from '../activities/origination-case.activities';

@Injectable()
export class CaseWorkflowActivitiesService implements CaseActivities {
  private readonly logger = new Logger(CaseWorkflowActivitiesService.name);

  constructor(
    @Inject(ORIGINATION_CASE_REPOSITORY) private readonly cases: OriginationCaseRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async submitCase(input: OriginationCaseStateUpdateInput): Promise<void> {
    await this.update(input, (c, actor) => c.submit(actor));
  }

  async completeIntake(input: OriginationCaseStateUpdateInput): Promise<void> {
    await this.update(input, (c, actor) => c.intake(actor));
  }

  async runDuplicateCheck(tenantId: string, caseId: string): Promise<DuplicateCheckResult> {
    const c = await this.cases.findById(TenantId.create(tenantId), OriginationCaseId.create(caseId));
    if (!c) {
      return { caseId, status: 'NOT_RUN', duplicateOf: null, reason: 'Case not found' };
    }
    c.setDuplicateCheckStatus('NO_DUPLICATE');
    await this.cases.save(c);
    return { caseId, status: 'NO_DUPLICATE', duplicateOf: null, reason: null };
  }

  async runInitialScreening(input: OriginationCaseStateUpdateInput): Promise<InitialScreeningResult> {
    const c = await this.cases.findById(TenantId.create(input.tenantId), OriginationCaseId.create(input.caseId));
    if (!c) {
      return { caseId: input.caseId, status: 'NOT_RUN', passed: false, reasons: ['Case not found'] };
    }
    c.setInitialScreeningStatus('PASS');
    await this.cases.save(c);
    return { caseId: input.caseId, status: 'PASS', passed: true, reasons: [] };
  }

  async transitionStage(input: OriginationCaseStateUpdateInput): Promise<void> {
    switch (input.targetStatus) {
      case 'SCREENING':
        return this.update(input, (c, actor) => c.startScreening(actor));
      case 'QUALIFICATION':
        return this.update(input, (c, actor) => c.startQualification(actor));
      case 'DUE_DILIGENCE':
        return this.update(input, (c, actor) => c.startDueDiligence(actor));
      case 'VALUATION':
        return this.update(input, (c, actor) => c.startValuation(actor));
      case 'ASSET_RISK_REVIEW':
        return this.update(input, (c, actor) => c.startRiskReview(actor));
      case 'READY_FOR_APPROVAL':
        return this.update(input, (c, actor) => c.readyForApproval(actor));
      case 'APPROVAL_IN_PROGRESS':
        return this.update(input, (c, actor) => c.startApproval(actor));
      default:
        throw new Error(`Unsupported stage transition to ${input.targetStatus}`);
    }
  }

  async startApproval(input: OriginationCaseStateUpdateInput): Promise<void> {
    await this.update(input, (c, actor) => c.startApproval(actor));
  }

  async approveCase(input: OriginationCaseStateUpdateInput): Promise<void> {
    await this.update(input, (c, actor) => c.approve(actor));
  }

  async escalateOnApprovalTimeout(tenantId: string, caseId: string): Promise<void> {
    this.logger.warn(`[temporal] Approval SLA exceeded for case ${caseId} (tenant ${tenantId}) — escalation pending`);
  }

  async markEngineeringReady(input: OriginationCaseStateUpdateInput): Promise<void> {
    await this.update(input, (c, actor) => c.markEngineeringReady(actor));
  }

  async rejectCase(input: OriginationCaseStateUpdateInput): Promise<void> {
    await this.update(input, (c, actor) => c.reject(input.targetStatus === 'REJECTED' ? 'Rejected by workflow' : input.targetStatus, actor));
  }

  private async update(
    input: OriginationCaseStateUpdateInput,
    mutate: (c: OriginationCase, actor: string) => void,
  ): Promise<void> {
    const found = await this.cases.findById(TenantId.create(input.tenantId), OriginationCaseId.create(input.caseId));
    if (!found) {
      throw new Error('Case not found');
    }
    mutate(found, input.actor);
    await this.cases.save(found);
    await this.outbox.publish(found.pullEvents());
  }
}
