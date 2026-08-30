import { Injectable } from '@nestjs/common';

@Injectable()
export class BeneficialOwnershipMonitor {
  track(entityId: string, owners: { ownershipPct: number }[]): {
    breached: boolean;
    thresholds: Record<string, number>;
  } {
    const thresholds: Record<string, number> = { '5%': 0, '10%': 0, '25%': 0 };

    let total = 0;
    for (const owner of owners) {
      total += owner.ownershipPct;
    }

    thresholds['5%'] = total;
    thresholds['10%'] = total;
    thresholds['25%'] = total;

    return {
      breached: total > 25,
      thresholds,
    };
  }
}
