import express from "express";
import cors from "cors";
import helmet from "helmet";
import limiter from "./middleware/rateLimiter.js";

import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(limiter);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

export default app;
