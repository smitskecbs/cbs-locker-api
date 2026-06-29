import { Router } from "express";
import { address, type Address } from "@solana/kit";
import {
  fetchLocksByMint,
  isActiveLock,
} from "../services/lockSearch";
import { CBS_LOCKER_PROGRAM_ID } from "../services/solana";

export const verifyMintRouter = Router();

function isValidAddress(value: string): value is Address {
  try {
    address(value);
    return true;
  } catch {
    return false;
  }
}

verifyMintRouter.get("/:mint", async (req, res) => {
  const { mint } = req.params;

  if (!isValidAddress(mint)) {
    return res.json({
      verified: false,
      mint,
      programId: CBS_LOCKER_PROGRAM_ID,
      totalLocks: 0,
      activeLocks: 0,
      locks: [],
      message:
        "Invalid Solana address. mint must be a valid base58 public key.",
    });
  }

  const mintAddress = address(mint);

  try {
    const locks = await fetchLocksByMint(mintAddress);
    const activeLocks = locks.filter((entry) =>
      isActiveLock(entry.lock)
    ).length;

    if (locks.length === 0) {
      return res.json({
        verified: false,
        mint: mintAddress,
        programId: CBS_LOCKER_PROGRAM_ID,
        totalLocks: 0,
        activeLocks: 0,
        locks: [],
        message: "No CBS Locker locks found for mint.",
      });
    }

    return res.json({
      verified: true,
      mint: mintAddress,
      programId: CBS_LOCKER_PROGRAM_ID,
      totalLocks: locks.length,
      activeLocks,
      locks,
      message: "CBS Locker locks found for mint.",
    });
  } catch {
    return res.status(503).json({
      verified: false,
      mint: mintAddress,
      programId: CBS_LOCKER_PROGRAM_ID,
      totalLocks: 0,
      activeLocks: 0,
      locks: [],
      message: "Failed to reach Solana RPC. Check your internet connection.",
    });
  }
});
