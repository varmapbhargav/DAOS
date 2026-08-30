import { Money } from '@daos/shared-kernel';

export function toMoney(dto: { amount: string; currency: string }): Money {
  return Money.of(BigInt(dto.amount), dto.currency);
}

export function toMoneyDto(money: Money): { amount: string; currency: string } {
  return { amount: money.amount.toString(), currency: money.currency };
}
