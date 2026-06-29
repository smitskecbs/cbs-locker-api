import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "CBS Locker API",
    version: "1.0.0",
    network: "mainnet",
    programId: "DA1sh6XTa13QQ23sLNdcPfCZF5SGMKXXYLxcfAJYcCmU",
  });
});
