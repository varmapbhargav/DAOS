import { ClosingCondition } from '@daos/shared-kernel';

export type ClosingConditionCheck = {
  allMet: boolean;
  pending: string[];
};

export class ClosingConditionChecker {
  check(conditions: ClosingCondition[]): ClosingConditionCheck {
    const pending = conditions
      .filter((c) => c.metAt === null)
      .map((c) => c.description);
    return { allMet: pending.length === 0, pending };
  }
}
