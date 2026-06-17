"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const workspaceRoutes_1 = __importDefault(require("./routes/workspaceRoutes"));
const projectsRoutes_1 = __importDefault(require("./routes/projectsRoutes"));
const issueRoutes_1 = __importDefault(require("./routes/issueRoutes"));
const invitationRoutes_1 = __importDefault(require("./routes/invitationRoutes"));
const errorMiddleware_1 = __importDefault(require("./middleware/errorMiddleware"));
const labelRoutes_1 = __importDefault(require("./routes/labelRoutes"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim());
const app = (0, express_1.default)();
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Too many requests. Please try again later.",
    },
});
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    limit: process.env.NODE_ENV === "production" ? 20 : 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Too many authentication attempts. Please try again later.",
    },
});
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express_1.default.json({ limit: "10kb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10kb" }));
// GET request to check api health
app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});
app.use("/api", apiLimiter);
// AUTH route mount
app.use("/api/auth", authLimiter, authRoutes_1.default);
// Workspace route mount
app.use("/api/workspace", workspaceRoutes_1.default);
// Projects route mount
app.use("/api/workspace/:workspaceId/projects", projectsRoutes_1.default);
// Issues route mount
app.use("/api/workspace/:workspaceId/projects/:projectId/issues", issueRoutes_1.default);
// Invitation route mount
app.use("/api/invitations", invitationRoutes_1.default);
// Labels route mount
app.use("/api/workspace/:workspaceId/labels", labelRoutes_1.default);
// Catches bad requests 404
app.use((req, res) => {
    res.status(404).json({ error: "Invalid api request" });
});
// Catches errors passed to next()
app.use(errorMiddleware_1.default);
exports.default = app;
