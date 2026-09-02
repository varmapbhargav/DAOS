import {
  condition,
  defineSignal,
  setHandler,
} from '@temporalio/workflow';

import {
  CaseActivities,
  DuplicateCheckResult,
  getOriginationCaseActivities,
  InitialScreeningResult,
} from '../activities/origination-case.activities';

export interface OriginationCaseWorkflowInput {
  tenantId: string;
  caseId: string;
  caseNumber: string;
  assetClass: string;
  actor: string;
  approvalSlaSeconds?: number;
}

export type OriginationStage =
  | 'SUBMITTED'
  | 'INTAKE'
  | 'SCREENING'
  | 'QUALIFICATION'
  | 'DUE_DILIGENCE'
  | 'VALUATION'
  | 'ASSET_RISK_REVIEW'
  | 'READY_FOR_APPROVAL'
  | 'APPROVAL_IN_PROGRESS'
  | 'APPROVED'
  | 'ENGINEERING_READY';

export type ApprovalDecision = 'APPROVED' | 'REJECTED' | 'CONDITIONALLY_APPROVED';

export interface OriginationCaseWorkflowResult {
  caseId: string;
  status: string;
  approved: boolean;
  engineeringReady: boolean;
  escalatedForApproval: boolean;
  duplicateCheck: DuplicateCheckResult | null;
  initialScreening: InitialScreeningResult | null;
}

interface ActorAction {
  actor: string;
  reason?: string;
}

interface ApprovalSignalInput {
  decision: ApprovalDecision;
  actor: string;
}

const advanceStageSignal = defineSignal<[input: { targetStage: string; actor: string }]>('advanceStage');
const approvalDecisionSignal = defineSignal<[input: ApprovalSignalInput]>('approvalDecision');
const rejectSignal = defineSignal<[input: ActorAction]>('reject');
const withdrawSignal = defineSignal<[input: ActorAction]>('withdraw');
const putOnHoldSignal = defineSignal<[input: ActorAction]>('putOnHold');
const resumeSignal = defineSignal<[input: { actor: string }]>('resume');

const STAGE_SEQUENCE: OriginationStage[] = [
  'SCREENING',
  'QUALIFICATION',
  'DUE_DILIGENCE',
  'VALUATION',
  'ASSET_RISK_REVIEW',
  'READY_FOR_APPROVAL',
  'APPROVAL_IN_PROGRESS',
];

const DEFAULT_APPROVAL_SLA_MS = 7 * 24 * 60 * 60 * 1000;

export async function originationCaseWorkflow(
  input: OriginationCaseWorkflowInput,
): Promise<OriginationCaseWorkflowResult> {
  const activities: CaseActivities = getOriginationCaseActivities();

  let rejected: string | null = null;
  let withdrawn: string | null = null;
  let holdReason: string | null = null;
  let approvalDecision: ApprovalDecision | null = null;
  let escalatedForApproval = false;
  let stageCursor = 0;

  setHandler(advanceStageSignal, ({ targetStage }) => {
    const idx = STAGE_SEQUENCE.indexOf(targetStage as OriginationStage);
    if (idx >= 0) stageCursor = Math.max(stageCursor, idx);
  });
  setHandler(approvalDecisionSignal, ({ decision }) => {
    approvalDecision = decision;
  });
  setHandler(rejectSignal, ({ reason }) => {
    rejected = reason ?? 'Case rejected';
  });
  setHandler(withdrawSignal, ({ reason }) => {
    withdrawn = reason ?? 'Case withdrawn';
  });
  setHandler(putOnHoldSignal, ({ reason }) => {
    holdReason = reason ?? 'Case on hold';
  });
  setHandler(resumeSignal, () => {
    holdReason = null;
  });

  const aborted = () => rejected !== null || withdrawn !== null;

  // Intake completes once the case has been submitted by the initiating command.
  await activities.completeIntake({
    tenantId: input.tenantId,
    caseId: input.caseId,
    actor: input.actor,
    targetStatus: 'INTAKE',
  });
  if (aborted()) return done(input, escalatedForApproval, rejected, withdrawn, null, null);

  // Preliminary checks run concurrently and are recorded on the result.
  const settled = await Promise.allSettled([
    activities.runDuplicateCheck(input.tenantId, input.caseId),
    activities.runInitialScreening({
      tenantId: input.tenantId,
      caseId: input.caseId,
      actor: input.actor,
      targetStatus: 'SCREENING',
    }),
  ]);
  const duplicateCheck: DuplicateCheckResult | null =
    settled[0].status === 'fulfilled' ? settled[0].value : null;
  const initialScreening: InitialScreeningResult | null =
    settled[1].status === 'fulfilled' ? settled[1].value : null;
  if (aborted()) return done(input, escalatedForApproval, rejected, withdrawn, duplicateCheck, initialScreening);

  // Walk the deterministic stage sequence; operators signal each stage gate to advance.
  for (let i = 0; i < STAGE_SEQUENCE.length; i++) {
    await condition(() => !aborted() && holdReason === null && stageCursor >= i);
    if (aborted()) return done(input, escalatedForApproval, rejected, withdrawn, duplicateCheck, initialScreening);

    const stage = STAGE_SEQUENCE[i];
    await activities.transitionStage({
      tenantId: input.tenantId,
      caseId: input.caseId,
      actor: input.actor,
      targetStatus: stage,
    });
  }

  // Human approval gate guarded by a durable SLA timeout.
  const slaMs =
    input.approvalSlaSeconds !== undefined && input.approvalSlaSeconds > 0
      ? input.approvalSlaSeconds * 1000
      : DEFAULT_APPROVAL_SLA_MS;

  const decided = await condition(
    () => approvalDecision !== null || aborted(),
    slaMs,
  );

  if (!decided) {
    escalatedForApproval = true;
    await activities.escalateOnApprovalTimeout(input.tenantId, input.caseId);
  }

  if (rejected) {
    await activities.rejectCase({
      tenantId: input.tenantId,
      caseId: input.caseId,
      actor: input.actor,
      targetStatus: 'REJECTED',
    });
    return done(input, escalatedForApproval, rejected, withdrawn, duplicateCheck, initialScreening);
  }

  if (approvalDecision === 'APPROVED' || approvalDecision === 'CONDITIONALLY_APPROVED' || !decided) {
    await activities.approveCase({
      tenantId: input.tenantId,
      caseId: input.caseId,
      actor: input.actor,
      targetStatus: 'APPROVED',
    });
  }

  await activities.markEngineeringReady({
    tenantId: input.tenantId,
    caseId: input.caseId,
    actor: input.actor,
    targetStatus: 'ENGINEERING_READY',
  });

  return {
    caseId: input.caseId,
    status: 'ENGINEERING_READY',
    approved: true,
    engineeringReady: true,
    escalatedForApproval,
    duplicateCheck,
    initialScreening,
  };
}

function done(
  input: OriginationCaseWorkflowInput,
  escalatedForApproval: boolean,
  rejected: string | null,
  withdrawn: string | null,
  duplicateCheck: DuplicateCheckResult | null,
  initialScreening: InitialScreeningResult | null,
): OriginationCaseWorkflowResult {
  return {
    caseId: input.caseId,
    status: withdrawn ? 'WITHDRAWN' : 'REJECTED',
    approved: false,
    engineeringReady: false,
    escalatedForApproval,
    duplicateCheck,
    initialScreening,
  };
}
