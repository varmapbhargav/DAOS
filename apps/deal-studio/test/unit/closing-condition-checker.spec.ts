import { ClosingConditionChecker } from '../../src/domain/services/closing-condition-checker';

const checker = new ClosingConditionChecker();

describe('ClosingConditionChecker', () => {
  it('reports all met for an empty list', () => {
    const result = checker.check([]);
    expect(result.allMet).toBe(true);
    expect(result.pending).toEqual([]);
  });

  it('reports pending when some conditions are unmet', () => {
    const result = checker.check([
      { conditionType: 'legal', description: 'Executed loan documents', metAt: null },
      { conditionType: 'finance', description: 'Funds wired', metAt: '2026-01-15T10:00:00.000Z' },
    ]);
    expect(result.allMet).toBe(false);
    expect(result.pending).toEqual(['Executed loan documents']);
  });

  it('reports all met when every condition has a metAt', () => {
    const result = checker.check([
      { conditionType: 'legal', description: 'Executed loan documents', metAt: '2026-01-15T10:00:00.000Z' },
      { conditionType: 'finance', description: 'Funds wired', metAt: '2026-01-15T11:00:00.000Z' },
    ]);
    expect(result.allMet).toBe(true);
    expect(result.pending).toEqual([]);
  });
});
