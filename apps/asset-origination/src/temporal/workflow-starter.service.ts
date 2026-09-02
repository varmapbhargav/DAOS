import { Inject, Injectable, Logger } from '@nestjs/common';
import { Client } from '@temporalio/client';

import { ORIGINATION_CASE_TASK_QUEUE, ORIGINATION_CASE_WORKFLOW } from './temporal.constants';
import { TEMPORAL_CLIENT } from './temporal.tokens';
import type { OriginationCaseWorkflowInput } from './workflows/origination-case.workflow';

@Injectable()
export class OriginationCaseWorkflowStarter {
  private readonly logger = new Logger(OriginationCaseWorkflowStarter.name);
  private readonly workflowIdPrefix = 'origination-case';

  constructor(
    @Inject(TEMPORAL_CLIENT) private readonly client: Client | null,
  ) {}

  async start(input: OriginationCaseWorkflowInput): Promise<string> {
    this.ensureEnabled();
    const workflowId = `${this.workflowIdPrefix}-${input.caseId}`;
    const handle = await this.client!.workflow.start(ORIGINATION_CASE_WORKFLOW, {
      args: [input],
      taskQueue: ORIGINATION_CASE_TASK_QUEUE,
      workflowId,
      workflowExecutionTimeout: '30 days',
    });
    this.logger.log(`[temporal] Started origination-case workflow ${workflowId}`);
    return handle.workflowId;
  }

  async tryStart(input: OriginationCaseWorkflowInput): Promise<string | null> {
    if (!this.client) {
      this.logger.warn('[temporal] Temporal disabled; skipping workflow start');
      return null;
    }
    try {
      return await this.start(input);
    } catch (error) {
      this.logger.error(`[temporal] Failed to start workflow: ${(error as Error).message}`);
      return null;
    }
  }

  async signalAdvanceStage(caseId: string, targetStage: string, actor: string): Promise<void> {
    await this.signal(caseId, 'advanceStage', { targetStage, actor });
  }

  async signalApprovalDecision(caseId: string, decision: 'APPROVED' | 'REJECTED' | 'CONDITIONALLY_APPROVED', actor: string): Promise<void> {
    await this.signal(caseId, 'approvalDecision', { decision, actor });
  }

  async signalReject(caseId: string, reason: string, actor: string): Promise<void> {
    await this.signal(caseId, 'reject', { reason, actor });
  }

  async signalWithdraw(caseId: string, reason: string, actor: string): Promise<void> {
    await this.signal(caseId, 'withdraw', { reason, actor });
  }

  async signalPutOnHold(caseId: string, reason: string, actor: string): Promise<void> {
    await this.signal(caseId, 'putOnHold', { reason, actor });
  }

  async signalResume(caseId: string, actor: string): Promise<void> {
    await this.signal(caseId, 'resume', { actor });
  }

  private async signal(caseId: string, signalName: string, payload: unknown): Promise<void> {
    this.ensureEnabled();
    const workflowId = `${this.workflowIdPrefix}-${caseId}`;
    const handle = this.client!.workflow.getHandle(workflowId);
    await handle.signal(signalName, payload);
    this.logger.log(`[temporal] Signalled ${signalName} on ${workflowId}`);
  }

  private ensureEnabled(): void {
    if (!this.client) {
      throw new Error('Temporal integration is disabled. Set TEMPORAL_ENABLED=true and TEMPORAL_ADDRESS to use it.');
    }
  }
}
