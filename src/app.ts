import express from "express";
import { verifyLockRouter } from "./routes/verifyLock";
import { verifyMintRouter } from "./routes/verifyMint";

const app = express();

app.use("/api/v1/verify/lock", verifyLockRouter);
app.use("/api/v1/verify/mint", verifyMintRouter);

export { app };
