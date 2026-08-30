import { BlockchainNetwork, IssuanceStatus, TokenStandard, TokenStandardProvider, TokenTransferRestriction } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StubTokenStandardEngine implements TokenStandardProvider {
  encodeTransferRestrictions(restrictions: TokenTransferRestriction[]): string {
    return JSON.stringify(restrictions);
  }

  decodeTransferRestrictions(encoded: string): TokenTransferRestriction[] {
    return JSON.parse(encoded) as TokenTransferRestriction[];
  }

  verifyTransfer(wallet: string, amount: bigint, restrictions: TokenTransferRestriction[]): boolean {
    void amount;
    const usBlocked = restrictions.some((r) => r.jurisdictionBlock.startsWith('US'));
    const walletBlocked = /blocked/i.test(wallet);
    return !usBlocked && !walletBlocked;
  }

  supportedStandard(network: BlockchainNetwork): TokenStandard {
    return network === 'hyperledger' ? 'hyperledger' : network === 'stellar' ? 'nativeChain' : 'ERC1400';
  }

  issuanceStatusFor(network: BlockchainNetwork): IssuanceStatus {
    return network === 'hyperledger' ? 'minted' : 'whitelistOpen';
  }
}