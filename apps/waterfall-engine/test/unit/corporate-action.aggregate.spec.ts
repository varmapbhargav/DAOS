import { CorporateActionId, CorporateActionType, TenantId } from '@daos/shared-kernel';

import { CorporateAction } from '../../src/domain/aggregates/corporate-action.aggregate';

describe('CorporateAction aggregate', () => {
  const tenantId = TenantId.create('tenant-1');

  function announce(overrides: Partial<Parameters<typeof CorporateAction.announce>[0]> = {}) {
    return CorporateAction.announce({
      tenantId,
      issuanceId: 'issuance-1',
      type: 'buyback' as CorporateActionType,
      exDate: '2026-03-01',
      recordDate: '2026-03-02',
      paymentDate: '2026-03-15',
      options: ['cash', 'stock'],
      ...overrides,
    });
  }

  it('announces a corporate action and raises CorporateActionAnnounced', () => {
    const action = announce();
    expect(action.id).toBeInstanceOf(CorporateActionId);
    expect(action.status).toBe('announced');
    expect(action.pullEvents().map((e) => e.eventType)).toContain('corporate-action.announced.v1');
  });

  it('rejects invalid announce parameters', () => {
    expect(() => announce({ issuanceId: '' })).toThrow('Issuance id is required');
    expect(() => announce({ options: [] })).toThrow('At least one election option is required');
  });

  it('opens and closes an election raising ElectionClosed', () => {
    const action = announce();
    action.pullEvents();
    action.openElection();
    action.closeElection([{ investorId: 'investor-1', electionType: 'cash', electionDate: '2026-02-01' }]);

    expect(action.status).toBe('electionClosed');
    expect(action.elections).toHaveLength(1);
    expect(action.pullEvents().map((e) => e.eventType)).toContain('election.closed.v1');
  });

  it('refuses to close an election before it is opened', () => {
    const action = announce();
    expect(() => action.closeElection([{ investorId: 'investor-1', electionType: 'cash', electionDate: '2026-02-01' }])).toThrow(
      'Only corporate actions with an open election can be closed',
    );
  });

  it('executes a closed election and raises CorporateActionExecuted', () => {
    const action = announce();
    action.pullEvents();
    action.openElection();
    action.closeElection([{ investorId: 'investor-1', electionType: 'cash', electionDate: '2026-02-01' }]);
    action.pullEvents();
    action.execute();

    expect(action.status).toBe('completed');
    expect(action.pullEvents().map((e) => e.eventType)).toContain('corporate-action.executed.v1');
  });

  it('refuses to execute before the election is closed', () => {
    const action = announce();
    expect(() => action.execute()).toThrow('Only corporate actions with closed elections can be executed');
  });
});
