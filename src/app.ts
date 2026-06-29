import express from "express";
import { verifyLockRouter } from "./routes/verifyLock";

const app = express();

app.use("/api/v1/verify/lock", verifyLockRouter);

export { app };
