import { IssuanceStatus } from '@daos/shared-kernel';

export type IssuanceWorkflowAction = 'signLegalDocs' | 'mint' | 'whitelist' | 'capTableSync';

export type IssuanceWorkflowStep = {
  action: IssuanceWorkflowAction;
  from: IssuanceStatus[];
  to: IssuanceStatus;
};

const STEPS: IssuanceWorkflowStep[] = [
  { action: 'signLegalDocs', from: ['draft'], to: 'legalDocsSigned' },
  { action: 'mint', from: ['legalDocsSigned', 'entityFormed'], to: 'minted' },
  { action: 'whitelist', from: ['minted'], to: 'whitelistOpen' },
  { action: 'capTableSync', from: ['whitelistOpen', 'minted'], to: 'complete' },
];

/**
 * Issuance workflow orchestrator.
 * Enforces the issuance state machine transitions as a pure domain service.
 */
export class IssuanceWorkflowOrchestrator {
  canTransition(from: IssuanceStatus, action: IssuanceWorkflowAction): boolean {
    return STEPS.some((step) => step.action === action && step.from.includes(from));
  }

  transition(from: IssuanceStatus, action: IssuanceWorkflowAction): IssuanceStatus {
    const step = STEPS.find((s) => s.action === action && s.from.includes(from));
    if (!step) throw new Error(`Invalid issuance workflow transition: ${from} → ${action}`);
    return step.to;
  }

  nextStep(from: IssuanceStatus): IssuanceWorkflowAction | null {
    const step = STEPS.find((s) => s.from.includes(from));
    return step ? step.action : null;
  }
}