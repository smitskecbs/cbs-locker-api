import { getAddressDecoder } from "@solana/addresses";
import { DecodedLock, TokenType } from "../types/lock";

export const TOKEN_LOCK_ACCOUNT_SIZE = 220;

const addressDecoder = getAddressDecoder();

function readPubkey(data: Buffer, offset: number): string {
  return addressDecoder.decode(data.subarray(offset, offset + 32));
}

function readU64(data: Buffer, offset: number): bigint {
  return data.readBigUInt64LE(offset);
}

function readI64(data: Buffer, offset: number): number {
  return Number(data.readBigInt64LE(offset));
}

function mapTokenType(value: number): TokenType {
  switch (value) {
    case 0:
      return "spl";
    case 1:
      return "lp";
    case 2:
      return "clmm";
    default:
      return "unknown";
  }
}

/** Trim trailing null bytes — matches cbs-token-locker layout.ts */
function projectNameEnd(bytes: Buffer): number {
  let end = bytes.length;
  while (end > 0 && bytes[end - 1] === 0) {
    end -= 1;
  }
  return end;
}

export type DecodeLockResult =
  | { ok: true; lock: DecodedLock }
  | { ok: false; message: string };

/**
 * Decode a TokenLock account using the same field order as
 * cbs-token-locker/src/solana/layout.ts → parseTokenLockAccount.
 */
export function decodeLockAccount(data: Buffer): DecodeLockResult {
  if (data.length < TOKEN_LOCK_ACCOUNT_SIZE) {
    return {
      ok: false,
      message: `Account data is ${data.length} bytes; expected ${TOKEN_LOCK_ACCOUNT_SIZE} bytes for a TokenLock account.`,
    };
  }

  let offset = 8; // skip 8-byte Anchor discriminator

  const owner = readPubkey(data, offset);
  offset += 32;
  const mint = readPubkey(data, offset);
  offset += 32;
  const vault = readPubkey(data, offset);
  offset += 32;

  const amount = readU64(data, offset);
  offset += 8;
  const unlockTimestamp = readI64(data, offset);
  offset += 8;
  const createdAt = readI64(data, offset);
  offset += 8;
  const lockSeed = readU64(data, offset);
  offset += 8;

  const tokenTypeByte = data.readUInt8(offset);
  offset += 1;
  const isUnlocked = data.readUInt8(offset) === 1;
  offset += 1;
  const bump = data.readUInt8(offset);
  offset += 1;
  const vaultBump = data.readUInt8(offset);
  offset += 1;

  const tokenProgram = readPubkey(data, offset);
  offset += 32;

  const projectNameBytes = data.subarray(offset, offset + 48);
  const projectName = projectNameBytes
    .subarray(0, projectNameEnd(projectNameBytes))
    .toString("utf8");

  const lock: DecodedLock = {
    owner,
    mint,
    vault,
    amount: amount.toString(),
    unlockTimestamp,
    createdAt,
    lockSeed: lockSeed.toString(),
    isUnlocked,
    bump,
    vaultBump,
    projectName,
    tokenProgram,
    tokenType: mapTokenType(tokenTypeByte),
  };

  return { ok: true, lock };
}
