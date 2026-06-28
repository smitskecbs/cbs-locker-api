import { Connection, PublicKey } from "@solana/web3.js";

/**
 * The CBS Locker program on Solana mainnet.
 * Every lock account we verify must be owned by this program.
 */
export const CBS_LOCKER_PROGRAM_ID = new PublicKey(
  "DA1sh6XTa13QQ23sLNdcPfCZF5SGMKXXYLxcfAJYcCmU"
);

/**
 * One shared connection to Solana mainnet RPC.
 * Created once when the server starts and reused for every request.
 */
export const connection = new Connection(
  "https://api.mainnet-beta.solana.com",
  "confirmed"
);
