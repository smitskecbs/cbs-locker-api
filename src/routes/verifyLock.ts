import { Router } from "express";
import { PublicKey } from "@solana/web3.js";
import { decodeLockAccount } from "../services/decodeLock";
import { CBS_LOCKER_PROGRAM_ID, connection } from "../services/solana";

export const verifyLockRouter = Router();

verifyLockRouter.get("/:lockPda", async (req, res) => {
  const { lockPda } = req.params;

  // Step 1: Validate that lockPda is a valid Solana PublicKey
  let publicKey: PublicKey;
  try {
    publicKey = new PublicKey(lockPda);
  } catch {
    return res.json({
      verified: false,
      accountExists: false,
      programMatches: false,
      lockPda,
      programId: CBS_LOCKER_PROGRAM_ID.toBase58(),
      message:
        "Invalid Solana address. lockPda must be a valid base58 public key.",
    });
  }

  // Step 2: Fetch the account from Solana
  try {
    const accountInfo = await connection.getAccountInfo(publicKey);

    // Step 3: Check the account exists
    if (!accountInfo) {
      return res.json({
        verified: false,
        accountExists: false,
        programMatches: false,
        lockPda: publicKey.toBase58(),
        programId: CBS_LOCKER_PROGRAM_ID.toBase58(),
        message:
          "Account not found on Solana. This address may not exist or may have been closed.",
      });
    }

    // Step 4: Check owner program equals CBS Locker
    const programMatches = accountInfo.owner.equals(CBS_LOCKER_PROGRAM_ID);

    if (!programMatches) {
      return res.json({
        verified: false,
        accountExists: true,
        programMatches: false,
        lockPda: publicKey.toBase58(),
        programId: CBS_LOCKER_PROGRAM_ID.toBase58(),
        message: `Account exists but is owned by a different program (${accountInfo.owner.toBase58()}), not CBS Locker.`,
      });
    }

    const decoded = decodeLockAccount(accountInfo.data);

    if (!decoded.ok) {
      return res.json({
        verified: false,
        accountExists: true,
        programMatches: true,
        lockPda: publicKey.toBase58(),
        programId: CBS_LOCKER_PROGRAM_ID.toBase58(),
        message: decoded.message,
      });
    }

    return res.json({
      verified: true,
      accountExists: true,
      programMatches: true,
      lockPda: publicKey.toBase58(),
      programId: CBS_LOCKER_PROGRAM_ID.toBase58(),
      lock: decoded.lock,
      message: "Valid CBS Locker account.",
    });
  } catch {
    return res.status(503).json({
      verified: false,
      accountExists: false,
      programMatches: false,
      lockPda: publicKey.toBase58(),
      programId: CBS_LOCKER_PROGRAM_ID.toBase58(),
      message: "Failed to reach Solana RPC. Check your internet connection.",
    });
  }
});
