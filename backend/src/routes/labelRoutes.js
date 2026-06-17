"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const labelController_1 = require("../controllers/labelController");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const workspaceRoleMiddleware_1 = __importDefault(require("../middleware/workspaceRoleMiddleware"));
const client_1 = require("../generated/prisma/client");
const labelRouter = express_1.default.Router({ mergeParams: true });
labelRouter
    .route("/")
    .get(authMiddleware_1.default, (0, workspaceRoleMiddleware_1.default)([
    client_1.WorkspaceRole.OWNER,
    client_1.WorkspaceRole.ADMIN,
    client_1.WorkspaceRole.MEMBER,
]), labelController_1.getWorkspaceLabels)
    .post(authMiddleware_1.default, (0, workspaceRoleMiddleware_1.default)([client_1.WorkspaceRole.OWNER, client_1.WorkspaceRole.ADMIN]), labelController_1.createWorkspaceLabel);
labelRouter
    .route("/:labelId")
    .patch(authMiddleware_1.default, (0, workspaceRoleMiddleware_1.default)([client_1.WorkspaceRole.OWNER, client_1.WorkspaceRole.ADMIN]), labelController_1.updateWorkspaceLabel)
    .delete(authMiddleware_1.default, (0, workspaceRoleMiddleware_1.default)([client_1.WorkspaceRole.OWNER, client_1.WorkspaceRole.ADMIN]), labelController_1.deleteWorkspaceLabel);
exports.default = labelRouter;
