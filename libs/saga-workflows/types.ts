// Types for Saga Workflows

export type Deal = {
  id: string;
  status: 'draft' | 'approved' | 'closing' | 'closed';
  productId: string | null;
  entityIds: string[];
};

export type Entity = {
  id: string;
  type: 'LLC' | 'LP' | 'CORP';
  status: 'formed' | 'activated' | 'dissolved';
};

export type Product = {
  id: string;
  type: 'fund' | 'note' | 'equity';
  status: 'designed' | 'approved' | 'closed';
};

export type Token = {
  address: string;
  totalSupply: bigint;
  decimals: number;
};

export type CapTable = {
  productId: string;
  totalShares: number;
  shareholders: Shareholder[];
};

export type Shareholder = {
  investorId: string;
  shares: number;
  classes: string[];
};

export type Subscription = {
  id: string;
  investorId: string;
  amount: number;
  status: 'pending' | 'executed' | 'funded';
};

export type Wallet = {
  id: string;
  address: string;
  network: string;
  status: 'active' | 'frozen';
};

export type Distribution = {
  id: string;
  productId: string;
  status: 'approved' | 'calculated' | 'paid';
  amount: number;
  currency: string;
};

export type CorporateAction = {
  id: string;
  productId: string;
  type: 'dividend' | 'split' | 'merger';
  status: 'announced' | 'electing' | 'executed';
};
