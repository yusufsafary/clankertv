import { Router, Request, Response } from "express";
import { fetchTokens, fetchToken, fetchTrending } from "../lib/clanker.js";
import { ListTokensQueryParams, GetTokenParams, GetTrendingTokensQueryParams } from "@workspace/api-zod";
import { sanitizeAddress } from "../middlewares/security.js";

const router = Router();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const parsed = ListTokensQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }

  const { page = 1, limit = 20, sort = "newest" } = parsed.data;

  try {
    const data = await fetchTokens(Number(page), Number(limit), sort);
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch tokens from Clanker");
    res.status(502).json({ error: "Failed to fetch token data" });
  }
});

router.get("/trending", async (req: Request, res: Response): Promise<void> => {
  const parsed = GetTrendingTokensQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }

  const { timeframe = "24h" } = parsed.data;

  try {
    const data = await fetchTrending(timeframe);
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch trending tokens from Clanker");
    res.status(502).json({ error: "Failed to fetch trending data" });
  }
});

router.get("/:address", async (req: Request, res: Response): Promise<void> => {
  const address = sanitizeAddress(req.params.address ?? "");
  if (!address) {
    res.status(400).json({ error: "Invalid contract address" });
    return;
  }

  try {
    const token = await fetchToken(address);
    res.json(token);
  } catch (err) {
    req.log.error({ err, address }, "Failed to fetch token detail");
    res.status(404).json({ error: "Token not found" });
  }
});

export default router;
