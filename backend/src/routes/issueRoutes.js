"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const issueController_1 = require("../controllers/issueController");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const workspaceRoleMiddleware_1 = __importDefault(require("../middleware/workspaceRoleMiddleware"));
const client_1 = require("../generated/prisma/client");
const commentsController_1 = require("../controllers/commentsController");
const labelController_1 = require("../controllers/labelController");
// mergeParams lets this router access :workspaceId and :projectId from app.ts mount path.
const issueRouter = express_1.default.Router({ mergeParams: true });
issueRouter
    .route('/')
    .get(authMiddleware_1.default, (0, workspaceRoleMiddleware_1.default)([
    client_1.WorkspaceRole.OWNER,
    client_1.WorkspaceRole.ADMIN,
    client_1.WorkspaceRole.MEMBER,
]), issueController_1.getIssues)
    .post(authMiddleware_1.default, (0, workspaceRoleMiddleware_1.default)([client_1.WorkspaceRole.OWNER, client_1.WorkspaceRole.ADMIN]), issueController_1.createIssue);
issueRouter
    .route('/:issueId')
    .get(authMiddleware_1.default, (0, workspaceRoleMiddleware_1.default)([
    client_1.WorkspaceRole.OWNER,
    client_1.WorkspaceRole.ADMIN,
    client_1.WorkspaceRole.MEMBER,
]), issueController_1.getIssue)
    .patch(authMiddleware_1.default, (0, workspaceRoleMiddleware_1.default)([client_1.WorkspaceRole.OWNER, client_1.WorkspaceRole.ADMIN]), issueController_1.updateIssue)
    .delete(authMiddleware_1.default, (0, workspaceRoleMiddleware_1.default)([client_1.WorkspaceRole.OWNER, client_1.WorkspaceRole.ADMIN]), issueController_1.deleteIssue);
issueRouter
    .route('/:issueId/comments')
    .get(authMiddleware_1.default, (0, workspaceRoleMiddleware_1.default)([
    client_1.WorkspaceRole.OWNER,
    client_1.WorkspaceRole.ADMIN,
    client_1.WorkspaceRole.MEMBER,
]), commentsController_1.getIssueComments)
    .post(authMiddleware_1.default, (0, workspaceRoleMiddleware_1.default)([
    client_1.WorkspaceRole.OWNER,
    client_1.WorkspaceRole.ADMIN,
    client_1.WorkspaceRole.MEMBER,
]), commentsController_1.createIssueComment);
issueRouter
    .route('/:issueId/comments/:commentId')
    .patch(authMiddleware_1.default, (0, workspaceRoleMiddleware_1.default)([
    client_1.WorkspaceRole.OWNER,
    client_1.WorkspaceRole.ADMIN,
    client_1.WorkspaceRole.MEMBER,
]), commentsController_1.updateIssueComment)
    .delete(authMiddleware_1.default, (0, workspaceRoleMiddleware_1.default)([
    client_1.WorkspaceRole.OWNER,
    client_1.WorkspaceRole.ADMIN,
    client_1.WorkspaceRole.MEMBER,
]), commentsController_1.deleteIssueComment);
issueRouter
    .route('/:issueId/labels/:labelId')
    .post(authMiddleware_1.default, (0, workspaceRoleMiddleware_1.default)([client_1.WorkspaceRole.OWNER, client_1.WorkspaceRole.ADMIN]), labelController_1.addLabelToIssue)
    .delete(authMiddleware_1.default, (0, workspaceRoleMiddleware_1.default)([client_1.WorkspaceRole.OWNER, client_1.WorkspaceRole.ADMIN]), labelController_1.removeLabelFromIssue);
exports.default = issueRouter;
