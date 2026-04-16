import { Router, Request, Response } from "express";
import { db } from "@workspace/db";
import { portfolioTable, insertPortfolioSchema } from "@workspace/db";
import { eq } from "drizzle-orm";
import { AddToPortfolioBody, RemoveFromPortfolioParams } from "@workspace/api-zod";
import { sanitizeAddress } from "../middlewares/security.js";

const router = Router();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const items = await db.select().from(portfolioTable).orderBy(portfolioTable.added_at);
    res.json({ data: items, total: items.length });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch portfolio");
    res.status(500).json({ error: "Failed to fetch watchlist" });
  }
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const bodyParsed = AddToPortfolioBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const validAddress = sanitizeAddress(bodyParsed.data.contract_address);
  if (!validAddress) {
    res.status(400).json({ error: "Invalid Ethereum contract address" });
    return;
  }

  const insertParsed = insertPortfolioSchema.safeParse({
    ...bodyParsed.data,
    contract_address: validAddress,
  });

  if (!insertParsed.success) {
    res.status(400).json({ error: "Validation failed" });
    return;
  }

  try {
    const [inserted] = await db
      .insert(portfolioTable)
      .values(insertParsed.data)
      .onConflictDoNothing()
      .returning();

    if (!inserted) {
      res.status(409).json({ error: "Token already in watchlist" });
      return;
    }

    res.status(201).json(inserted);
  } catch (err) {
    req.log.error({ err }, "Failed to add to portfolio");
    res.status(500).json({ error: "Failed to add to watchlist" });
  }
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const parsed = RemoveFromPortfolioParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  try {
    const [deleted] = await db
      .delete(portfolioTable)
      .where(eq(portfolioTable.id, parsed.data.id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Watchlist entry not found" });
      return;
    }

    res.json(deleted);
  } catch (err) {
    req.log.error({ err }, "Failed to remove from portfolio");
    res.status(500).json({ error: "Failed to remove from watchlist" });
  }
});

export default router;
