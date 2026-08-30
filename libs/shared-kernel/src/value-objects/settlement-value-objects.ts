import { Money } from '../index';

export type SettlementType = 'cash' | 'securities' | 'deliveryVsPayment' | 'freeDelivery';

export type SettlementCycle = 'T0' | 'T1' | 'T2' | 'T3' | 'T5';

export type SettlementParty = 'brokerBuyer' | 'brokerSeller' | 'custodianBuyer' | 'custodianSeller' | 'centralCounterparty';

export type SettlementStatus = 'initiated' | 'matched' | 'settled' | 'failed';

export type CustodyType = 'broker' | 'bank' | 'thirdParty' | 'internal';

export type Holding = {
  securityId: string;
  quantity: bigint;
  available: bigint;
  locked: bigint;
  averagePrice: Money;
};

export type SettlementLeg = {
  party: SettlementParty;
  securityId: string;
  quantity: bigint;
  amount: Money;
  settlementDate: string;
};
