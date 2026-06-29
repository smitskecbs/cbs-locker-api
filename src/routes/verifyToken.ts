import { Router } from "express";
import { address, type Address } from "@solana/kit";
import type { TokenType } from "../types/lock";
import {
  fetchLocksByMint,
  isActiveLock,
  type MintLockResult,
} from "../services/lockSearch";
import { CBS_LOCKER_PROGRAM_ID } from "../services/solana";

export const verifyTokenRouter = Router();

const LOCKER_NAME = "CBS Token Locker";

function isValidAddress(value: string): value is Address {
  try {
    address(value);
    return true;
  } catch {
    return false;
  }
}

function resolveTokenType(
  locks: MintLockResult[],
  activeLocks: MintLockResult[]
): TokenType {
  if (activeLocks.length > 0) {
    return activeLocks[0].lock.tokenType;
  }

  if (locks.length > 0) {
    return locks[0].lock.tokenType;
  }

  return "unknown";
}

function sumActiveAmount(activeLocks: MintLockResult[]): string {
  return activeLocks
    .reduce((total, entry) => total + BigInt(entry.lock.amount), 0n)
    .toString();
}

function findLargestActiveLock(activeLocks: MintLockResult[]) {
  return activeLocks.reduce<MintLockResult | null>((largest, entry) => {
    if (!largest) {
      return entry;
    }

    return BigInt(entry.lock.amount) > BigInt(largest.lock.amount)
      ? entry
      : largest;
  }, null);
}

verifyTokenRouter.get("/:mint", async (req, res) => {
  const { mint } = req.params;

  if (!isValidAddress(mint)) {
    return res.json({
      verified: false,
      mint,
      programId: CBS_LOCKER_PROGRAM_ID,
      locker: LOCKER_NAME,
      tokenType: "unknown",
      totalLocks: 0,
      activeLocks: 0,
      message:
        "Invalid Solana address. mint must be a valid base58 public key.",
    });
  }

  const mintAddress = address(mint);

  try {
    const locks = await fetchLocksByMint(mintAddress);
    const activeLockEntries = locks.filter((entry) =>
      isActiveLock(entry.lock)
    );
    const totalLocks = locks.length;
    const activeLocks = activeLockEntries.length;
    const tokenType = resolveTokenType(locks, activeLockEntries);

    if (totalLocks === 0) {
      return res.json({
        verified: false,
        mint: mintAddress,
        programId: CBS_LOCKER_PROGRAM_ID,
        locker: LOCKER_NAME,
        tokenType: "unknown",
        totalLocks: 0,
        activeLocks: 0,
        message: "No CBS Locker locks found for mint.",
      });
    }

    if (activeLocks === 0) {
      return res.json({
        verified: false,
        mint: mintAddress,
        programId: CBS_LOCKER_PROGRAM_ID,
        locker: LOCKER_NAME,
        tokenType,
        totalLocks,
        activeLocks: 0,
        message: "No active CBS Locker locks found for mint.",
      });
    }

    const largestActive = findLargestActiveLock(activeLockEntries)!;
    const nextUnlockTimestamp = activeLockEntries.reduce(
      (earliest, entry) =>
        Math.min(earliest, entry.lock.unlockTimestamp),
      activeLockEntries[0].lock.unlockTimestamp
    );

    return res.json({
      verified: true,
      mint: mintAddress,
      programId: CBS_LOCKER_PROGRAM_ID,
      locker: LOCKER_NAME,
      tokenType,
      totalLocks,
      activeLocks,
      activeLockedAmount: sumActiveAmount(activeLockEntries),
      nextUnlockTimestamp,
      largestActiveLock: {
        lockPda: largestActive.lockPda,
        amount: largestActive.lock.amount,
        unlockTimestamp: largestActive.lock.unlockTimestamp,
      },
      message: "Active CBS Locker lock found for mint.",
    });
  } catch {
    return res.status(503).json({
      verified: false,
      mint: mintAddress,
      programId: CBS_LOCKER_PROGRAM_ID,
      locker: LOCKER_NAME,
      tokenType: "unknown",
      totalLocks: 0,
      activeLocks: 0,
      message: "Failed to reach Solana RPC. Check your internet connection.",
    });
  }
});
