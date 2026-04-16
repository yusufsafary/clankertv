import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { securityHeaders, rateLimit } from "./middlewares/security.js";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(securityHeaders);
app.use(rateLimit(100, 60_000));

app.use(
  cors({
    origin: process.env.NODE_ENV === "production"
      ? (process.env.REPLIT_DOMAINS ?? "").split(",").map((d) => `https://${d.trim()}`)
      : true,
    credentials: true,
  })
);

app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));

app.use("/api", router);

export default app;
