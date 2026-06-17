import express, { Request, Response } from "express";
import cors from "cors";
import authRouter from "./routes/authRoutes";
import workspaceRouter from "./routes/workspaceRoutes";
import projectsRouter from "./routes/projectsRoutes";
import issueRouter from "./routes/issueRoutes";
import invitationRouter from "./routes/invitationRoutes";
import errorMiddleware from "./middleware/errorMiddleware";
import labelRouter from "./routes/labelRoutes";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

const app = express();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === "production" ? 20 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many authentication attempts. Please try again later.",
  },
});

app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// GET request to check api health
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/api", apiLimiter);

// AUTH route mount
app.use("/api/auth", authLimiter, authRouter);

// Workspace route mount
app.use("/api/workspace", workspaceRouter);

// Projects route mount
app.use("/api/workspace/:workspaceId/projects", projectsRouter);

// Issues route mount
app.use("/api/workspace/:workspaceId/projects/:projectId/issues", issueRouter);

// Invitation route mount
app.use("/api/invitations", invitationRouter);

// Labels route mount
app.use("/api/workspace/:workspaceId/labels", labelRouter);

// Catches bad requests 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Invalid api request" });
});

// Catches errors passed to next()
app.use(errorMiddleware);

export default app;
