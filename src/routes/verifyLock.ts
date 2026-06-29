import { Router } from "express";
import { address, fetchEncodedAccount, type Address } from "@solana/kit";
import { decodeLockAccount } from "../services/decodeLock";
import { CBS_LOCKER_PROGRAM_ID, rpc } from "../services/solana";

export const verifyLockRouter = Router();

function isValidAddress(value: string): value is Address {
  try {
    address(value);
    return true;
  } catch {
    return false;
  }
}

verifyLockRouter.get("/:lockPda", async (req, res) => {
  const { lockPda } = req.params;

  // Step 1: Validate that lockPda is a valid Solana address
  if (!isValidAddress(lockPda)) {
    return res.json({
      verified: false,
      accountExists: false,
      programMatches: false,
      lockPda,
      programId: CBS_LOCKER_PROGRAM_ID,
      message:
        "Invalid Solana address. lockPda must be a valid base58 public key.",
    });
  }

  const lockAddress = address(lockPda);

  // Step 2: Fetch the account from Solana
  try {
    const encodedAccount = await fetchEncodedAccount(rpc, lockAddress);

    // Step 3: Check the account exists
    if (!encodedAccount.exists) {
      return res.json({
        verified: false,
        accountExists: false,
        programMatches: false,
        lockPda: lockAddress,
        programId: CBS_LOCKER_PROGRAM_ID,
        message:
          "Account not found on Solana. This address may not exist or may have been closed.",
      });
    }

    // Step 4: Check owner program equals CBS Locker
    const programMatches =
      encodedAccount.programAddress === CBS_LOCKER_PROGRAM_ID;

    if (!programMatches) {
      return res.json({
        verified: false,
        accountExists: true,
        programMatches: false,
        lockPda: lockAddress,
        programId: CBS_LOCKER_PROGRAM_ID,
        message: `Account exists but is owned by a different program (${encodedAccount.programAddress}), not CBS Locker.`,
      });
    }

    const decoded = decodeLockAccount(Buffer.from(encodedAccount.data));

    if (!decoded.ok) {
      return res.json({
        verified: false,
        accountExists: true,
        programMatches: true,
        lockPda: lockAddress,
        programId: CBS_LOCKER_PROGRAM_ID,
        message: decoded.message,
      });
    }

    return res.json({
      verified: true,
      accountExists: true,
      programMatches: true,
      lockPda: lockAddress,
      programId: CBS_LOCKER_PROGRAM_ID,
      lock: decoded.lock,
      message: "Valid CBS Locker account.",
    });
  } catch {
    return res.status(503).json({
      verified: false,
      accountExists: false,
      programMatches: false,
      lockPda: lockAddress,
      programId: CBS_LOCKER_PROGRAM_ID,
      message: "Failed to reach Solana RPC. Check your internet connection.",
    });
  }
});
