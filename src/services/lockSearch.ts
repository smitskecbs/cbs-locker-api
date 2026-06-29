import {
  address,
  type Address,
  type Base58EncodedBytes,
} from "@solana/kit";
import type { DecodedLock } from "../types/lock";
import { decodeLockAccount } from "./decodeLock";
import { CBS_LOCKER_PROGRAM_ID, rpc } from "./solana";

/** TokenLock mint field starts after 8-byte discriminator + 32-byte owner. */
export const TOKEN_LOCK_MINT_OFFSET = 40n;

type ProgramAccountEntry = {
  pubkey: Address;
  account: {
    data: [string, "base64"];
  };
};

function normalizeProgramAccountsResponse(
  response: ProgramAccountEntry[] | { value: ProgramAccountEntry[] }
): ProgramAccountEntry[] {
  return Array.isArray(response) ? response : response.value;
}

export type MintLockResult = {
  lockPda: Address;
  lock: DecodedLock;
};

export async function fetchLocksByMint(
  mint: Address
): Promise<MintLockResult[]> {
  const response = await rpc
    .getProgramAccounts(CBS_LOCKER_PROGRAM_ID, {
      encoding: "base64",
      filters: [
        {
          memcmp: {
            offset: TOKEN_LOCK_MINT_OFFSET,
            bytes: mint as unknown as Base58EncodedBytes,
            encoding: "base58",
          },
        },
      ],
    })
    .send();

  const locks: MintLockResult[] = [];

  for (const account of normalizeProgramAccountsResponse(response)) {
    const decoded = decodeLockAccount(
      Buffer.from(account.account.data[0], "base64")
    );

    if (!decoded.ok) {
      continue;
    }

    locks.push({
      lockPda: address(account.pubkey),
      lock: decoded.lock,
    });
  }

  return locks;
}

export function isActiveLock(
  lock: DecodedLock,
  nowSeconds = Math.floor(Date.now() / 1000)
): boolean {
  return !lock.isUnlocked && nowSeconds < lock.unlockTimestamp;
}
