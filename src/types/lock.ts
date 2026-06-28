export type TokenType = "spl" | "lp" | "clmm" | "unknown";

export interface DecodedLock {
  owner: string;
  mint: string;
  vault: string;
  amount: string;
  unlockTimestamp: number;
  createdAt: number;
  lockSeed: string;
  isUnlocked: boolean;
  bump: number;
  vaultBump: number;
  projectName: string;
  tokenProgram: string;
  tokenType: TokenType;
}
