"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const projectController_1 = require("../controllers/projectController");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const workspaceRoleMiddleware_1 = __importDefault(require("../middleware/workspaceRoleMiddleware"));
const client_1 = require("../generated/prisma/client");
// mergeParams lets this router access :workspaceId from app.ts mount path.
const projectsRouter = express_1.default.Router({ mergeParams: true });
projectsRouter
    .route('/')
    .get(authMiddleware_1.default, (0, workspaceRoleMiddleware_1.default)([
    client_1.WorkspaceRole.OWNER,
    client_1.WorkspaceRole.ADMIN,
    client_1.WorkspaceRole.MEMBER,
]), projectController_1.getProjects)
    .post(authMiddleware_1.default, (0, workspaceRoleMiddleware_1.default)([client_1.WorkspaceRole.OWNER, client_1.WorkspaceRole.ADMIN]), projectController_1.createProject);
projectsRouter
    .route('/:projectId')
    .get(authMiddleware_1.default, (0, workspaceRoleMiddleware_1.default)([
    client_1.WorkspaceRole.OWNER,
    client_1.WorkspaceRole.ADMIN,
    client_1.WorkspaceRole.MEMBER,
]), projectController_1.getProject)
    .delete(authMiddleware_1.default, (0, workspaceRoleMiddleware_1.default)([client_1.WorkspaceRole.OWNER, client_1.WorkspaceRole.ADMIN]), projectController_1.deleteProject)
    .patch(authMiddleware_1.default, (0, workspaceRoleMiddleware_1.default)([client_1.WorkspaceRole.OWNER, client_1.WorkspaceRole.ADMIN]), projectController_1.updateProject);
exports.default = projectsRouter;
