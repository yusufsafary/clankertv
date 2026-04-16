import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const portfolioTable = pgTable("portfolio", {
  id: serial("id").primaryKey(),
  contract_address: varchar("contract_address", { length: 42 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  notes: text("notes"),
  added_at: timestamp("added_at").defaultNow().notNull(),
});

export const insertPortfolioSchema = createInsertSchema(portfolioTable)
  .omit({ id: true, added_at: true })
  .extend({
    contract_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
    name: z.string().min(1).max(100),
    symbol: z.string().min(1).max(20),
    notes: z.string().max(500).nullable().optional(),
  });

export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type Portfolio = typeof portfolioTable.$inferSelect;
