import { address, createSolanaRpc, type Address } from "@solana/kit";

/**
 * The CBS Locker program on Solana mainnet.
 * Every lock account we verify must be owned by this program.
 */
export const CBS_LOCKER_PROGRAM_ID: Address = address(
  "DA1sh6XTa13QQ23sLNdcPfCZF5SGMKXXYLxcfAJYcCmU"
);

/**
 * One shared RPC client for Solana mainnet.
 * Created once when the server starts and reused for every request.
 */
export const rpc = createSolanaRpc("https://api.mainnet-beta.solana.com");
