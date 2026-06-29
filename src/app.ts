import express from "express";
import { healthRouter } from "./routes/health";
import { verifyLockRouter } from "./routes/verifyLock";
import { verifyMintRouter } from "./routes/verifyMint";
import { verifyTokenRouter } from "./routes/verifyToken";

const app = express();

app.use("/health", healthRouter);
app.use("/api/v1/verify/lock", verifyLockRouter);
app.use("/api/v1/verify/mint", verifyMintRouter);
app.use("/api/v1/verify/token", verifyTokenRouter);

export { app };
