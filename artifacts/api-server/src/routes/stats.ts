import { Router, Request, Response } from "express";
import { fetchTokens } from "../lib/clanker.js";

const router = Router();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const newest = await fetchTokens(1, 20, "newest");

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const tokens24h = newest.data.filter(
      (t) => new Date(t.created_at).getTime() > oneDayAgo
    ).length;

    const totalVol = newest.data.reduce(
      (acc, t) => acc + (t.volume_24h ?? 0),
      0
    );

    const avgMktCap =
      newest.data.length > 0
        ? newest.data.reduce((acc, t) => acc + (t.current_market_cap ?? 0), 0) /
          newest.data.length
        : 0;

    const trendingUp = newest.data.filter(
      (t) => (t.price_change_24h ?? 0) > 0
    ).length;

    const trendingDown = newest.data.filter(
      (t) => (t.price_change_24h ?? 0) < 0
    ).length;

    res.json({
      total_tokens: newest.total,
      tokens_24h: tokens24h,
      total_volume_24h: totalVol,
      avg_market_cap: avgMktCap,
      trending_up: trendingUp,
      trending_down: trendingDown,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to compute stats");
    res.status(502).json({ error: "Failed to compute stats" });
  }
});

export default router;
