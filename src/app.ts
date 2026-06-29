import express from "express";
import { apiRouter } from "./routes/api";
import { mountDocsRoutes } from "./routes/docs";
import { healthRouter } from "./routes/health";
import { verifyLockRouter } from "./routes/verifyLock";
import { verifyMintRouter } from "./routes/verifyMint";
import { verifyTokenRouter } from "./routes/verifyToken";

const app = express();

// Docs routes registered first on the app itself (not a sub-router).
mountDocsRoutes(app);

app.use("/health", healthRouter);
app.use("/api", apiRouter);
app.use("/api/v1/verify/lock", verifyLockRouter);
app.use("/api/v1/verify/mint", verifyMintRouter);
app.use("/api/v1/verify/token", verifyTokenRouter);

export { app };
