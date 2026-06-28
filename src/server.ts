import express from "express";
import { verifyLockRouter } from "./routes/verifyLock";

const app = express();
const PORT = 3000;

// Mount the verify-lock routes at /api/v1/verify/lock
app.use("/api/v1/verify/lock", verifyLockRouter);

app.listen(PORT, () => {
  console.log(`CBS Locker API running at http://localhost:${PORT}`);
});
