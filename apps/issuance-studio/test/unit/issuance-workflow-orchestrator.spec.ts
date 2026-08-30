import { IssuanceWorkflowOrchestrator } from '../../src/domain/services/issuance-workflow-orchestrator';

describe('IssuanceWorkflowOrchestrator', () => {
  const orchestrator = new IssuanceWorkflowOrchestrator();

  it('allows legal docs signing only from draft', () => {
    expect(orchestrator.canTransition('draft', 'signLegalDocs')).toBe(true);
    expect(orchestrator.canTransition('legalDocsSigned', 'signLegalDocs')).toBe(false);
  });

  it('allows minting only after legal docs are signed or entity formed', () => {
    expect(orchestrator.canTransition('legalDocsSigned', 'mint')).toBe(true);
    expect(orchestrator.canTransition('entityFormed', 'mint')).toBe(true);
    expect(orchestrator.canTransition('draft', 'mint')).toBe(false);
  });

  it('transitions per the state machine', () => {
    expect(orchestrator.transition('draft', 'signLegalDocs')).toBe('legalDocsSigned');
    expect(orchestrator.transition('legalDocsSigned', 'mint')).toBe('minted');
    expect(orchestrator.transition('minted', 'whitelist')).toBe('whitelistOpen');
    expect(orchestrator.transition('whitelistOpen', 'capTableSync')).toBe('complete');
  });

  it('rejects invalid transitions', () => {
    expect(() => orchestrator.transition('draft', 'capTableSync')).toThrow('Invalid issuance workflow transition');
    expect(() => orchestrator.transition('minted', 'signLegalDocs')).toThrow('Invalid issuance workflow transition');
  });

  it('reports the next step', () => {
    expect(orchestrator.nextStep('draft')).toBe('signLegalDocs');
    expect(orchestrator.nextStep('minted')).toBe('whitelist');
    expect(orchestrator.nextStep('complete')).toBeNull();
  });
});