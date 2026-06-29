import { Router } from "express";

export const apiRouter = Router();

apiRouter.get("/", (_req, res) => {
  res.json({
    name: "CBS Locker API",
    version: "1.0.0",
    network: "mainnet",
    programId: "DA1sh6XTa13QQ23sLNdcPfCZF5SGMKXXYLxcfAJYcCmU",
    documentation: "/docs",
    health: "/health",
    endpoints: [
      "/api/v1/verify/lock/:lockPda",
      "/api/v1/verify/mint/:mint",
      "/api/v1/verify/token/:mint",
    ],
  });
});
