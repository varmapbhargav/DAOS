import { proxyActivities } from '@temporalio/workflow';

import { ORIGINATION_CASE_ACTIVITY_QUEUE } from '../temporal.constants';

export interface OriginationCaseStateUpdateInput {
  tenantId: string;
  caseId: string;
  actor: string;
  targetStatus: string;
}

export interface DuplicateCheckResult {
  caseId: string;
  status: string;
  duplicateOf: string | null;
  reason: string | null;
}

export interface InitialScreeningResult {
  caseId: string;
  status: string;
  passed: boolean;
  reasons: string[];
}

export interface CaseActivities {
  submitCase(input: OriginationCaseStateUpdateInput): Promise<void>;
  completeIntake(input: OriginationCaseStateUpdateInput): Promise<void>;
  runDuplicateCheck(tenantId: string, caseId: string): Promise<DuplicateCheckResult>;
  runInitialScreening(input: OriginationCaseStateUpdateInput): Promise<InitialScreeningResult>;
  transitionStage(input: OriginationCaseStateUpdateInput): Promise<void>;
  startApproval(input: OriginationCaseStateUpdateInput): Promise<void>;
  approveCase(input: OriginationCaseStateUpdateInput): Promise<void>;
  escalateOnApprovalTimeout(tenantId: string, caseId: string): Promise<void>;
  markEngineeringReady(input: OriginationCaseStateUpdateInput): Promise<void>;
  rejectCase(input: OriginationCaseStateUpdateInput): Promise<void>;
}

export function getOriginationCaseActivities(): CaseActivities {
  return proxyActivities<CaseActivities>({
    startToCloseTimeout: '10 seconds',
    taskQueue: ORIGINATION_CASE_ACTIVITY_QUEUE,
    retry: {
      initialInterval: '1 second',
      maximumAttempts: 3,
    },
  });
}
