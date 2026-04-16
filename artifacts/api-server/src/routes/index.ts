import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import tokensRouter from "./tokens.js";
import statsRouter from "./stats.js";
import portfolioRouter from "./portfolio.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/tokens", tokensRouter);
router.use("/stats", statsRouter);
router.use("/portfolio", portfolioRouter);

export default router;
