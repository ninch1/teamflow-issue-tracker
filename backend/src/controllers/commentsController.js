"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteIssueComment = exports.updateIssueComment = exports.createIssueComment = exports.getIssueComments = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const ErrorResponse_1 = __importDefault(require("../errors/ErrorResponse"));
const asyncHandler_1 = __importDefault(require("../middleware/asyncHandler"));
const createActivity_1 = require("../utils/createActivity");
const client_1 = require("../generated/prisma/client");
// Get comments for one issue.
exports.getIssueComments = (0, asyncHandler_1.default)(async (req, res, next) => {
    const authReq = req;
    const user = authReq.user;
    if (!user) {
        return next(new ErrorResponse_1.default("Unauthorized access", 401));
    }
    const { workspaceId, projectId, issueId } = req.params;
    if (typeof workspaceId !== "string") {
        return next(new ErrorResponse_1.default("Workspace id is required", 400));
    }
    if (typeof projectId !== "string") {
        return next(new ErrorResponse_1.default("Project id is required", 400));
    }
    if (typeof issueId !== "string") {
        return next(new ErrorResponse_1.default("Issue id is required", 400));
    }
    const limitQuery = req.query.limit;
    const pageQuery = req.query.page;
    const limit = typeof limitQuery === "string" ? Number.parseInt(limitQuery, 10) : 5;
    const page = typeof pageQuery === "string" ? Number.parseInt(pageQuery, 10) : 1;
    if (Number.isNaN(limit) || limit < 1 || limit > 50) {
        return next(new ErrorResponse_1.default("Limit must be between 1 and 50", 400));
    }
    if (Number.isNaN(page) || page < 1) {
        return next(new ErrorResponse_1.default("Page must be 1 or greater", 400));
    }
    const issue = await prisma_1.default.issue.findFirst({
        where: {
            id: issueId,
            projectId,
            project: {
                workspaceId,
            },
        },
    });
    if (!issue) {
        return next(new ErrorResponse_1.default("Issue not found", 404));
    }
    const skip = (page - 1) * limit;
    const [comments, totalComments] = await Promise.all([
        prisma_1.default.comment.findMany({
            where: {
                issueId,
            },
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        }),
        prisma_1.default.comment.count({
            where: {
                issueId,
            },
        }),
    ]);
    const totalPages = Math.ceil(totalComments / limit);
    const hasMore = page < totalPages;
    return res.status(200).json({
        message: "Comments retrieved successfully",
        page,
        limit,
        totalComments,
        totalPages,
        hasMore,
        comments,
    });
});
// Create comment for one issue.
exports.createIssueComment = (0, asyncHandler_1.default)(async (req, res, next) => {
    const authReq = req;
    const user = authReq.user;
    if (!user) {
        return next(new ErrorResponse_1.default("Unauthorized access", 401));
    }
    const workspaceId = req.params.workspaceId;
    const projectId = req.params.projectId;
    const issueId = req.params.issueId;
    if (typeof workspaceId !== "string") {
        return next(new ErrorResponse_1.default("Workspace id is required", 400));
    }
    if (typeof projectId !== "string") {
        return next(new ErrorResponse_1.default("Project id is required", 400));
    }
    if (typeof issueId !== "string") {
        return next(new ErrorResponse_1.default("Issue id is required", 400));
    }
    if (!req.body) {
        return next(new ErrorResponse_1.default("Comment data is required", 400));
    }
    const { body } = req.body;
    if (typeof body !== "string") {
        return next(new ErrorResponse_1.default("Comment body is required", 400));
    }
    const trimmedBody = body.trim();
    if (trimmedBody.length < 1) {
        return next(new ErrorResponse_1.default("Comment body is required", 400));
    }
    if (trimmedBody.length > 1000) {
        return next(new ErrorResponse_1.default("Comment body must be 1000 characters or less", 400));
    }
    const issue = await prisma_1.default.issue.findFirst({
        where: {
            id: issueId,
            projectId,
            project: {
                workspaceId,
            },
        },
    });
    if (!issue) {
        return next(new ErrorResponse_1.default("Issue not found", 404));
    }
    const comment = await prisma_1.default.comment.create({
        data: {
            body: trimmedBody,
            issueId: issue.id,
            userId: user.id,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
    await (0, createActivity_1.createActivity)({
        workspaceId,
        projectId,
        issueId: issue.id,
        userId: user.id,
        type: client_1.ActivityType.COMMENT_ADDED,
        message: `${user.name} commented on issue "${issue.title}"`,
    });
    return res.status(201).json({
        message: "Comment created successfully",
        comment,
    });
});
exports.updateIssueComment = (0, asyncHandler_1.default)(async (req, res, next) => {
    const authReq = req;
    const user = authReq.user;
    if (!user) {
        return next(new ErrorResponse_1.default("Unauthorized access", 401));
    }
    const { workspaceId, projectId, issueId, commentId } = req.params;
    if (typeof workspaceId !== "string") {
        return next(new ErrorResponse_1.default("Workspace id is required", 400));
    }
    if (typeof projectId !== "string") {
        return next(new ErrorResponse_1.default("Project id is required", 400));
    }
    if (typeof issueId !== "string") {
        return next(new ErrorResponse_1.default("Issue id is required", 400));
    }
    if (typeof commentId !== "string") {
        return next(new ErrorResponse_1.default("Comment id is required", 400));
    }
    if (!req.body || typeof req.body !== "object") {
        return next(new ErrorResponse_1.default("Comment body is required", 400));
    }
    const { body } = req.body;
    if (typeof body !== "string") {
        return next(new ErrorResponse_1.default("Comment body is required", 400));
    }
    const trimmedBody = body.trim();
    if (trimmedBody.length < 1) {
        return next(new ErrorResponse_1.default("Comment body is required", 400));
    }
    if (trimmedBody.length > 1000) {
        return next(new ErrorResponse_1.default("Comment body must be 1000 characters or less", 400));
    }
    const comment = await prisma_1.default.comment.findFirst({
        where: {
            id: commentId,
            issueId,
            issue: {
                projectId,
                project: {
                    workspaceId,
                },
            },
        },
        include: {
            issue: {
                select: {
                    id: true,
                    title: true,
                },
            },
        },
    });
    if (!comment) {
        return next(new ErrorResponse_1.default("Comment not found", 404));
    }
    const currentMember = await prisma_1.default.workspaceMember.findUnique({
        where: {
            userId_workspaceId: {
                userId: user.id,
                workspaceId,
            },
        },
    });
    if (!currentMember) {
        return next(new ErrorResponse_1.default("Workspace membership not found", 403));
    }
    const canManageComment = currentMember.role === client_1.WorkspaceRole.OWNER ||
        currentMember.role === client_1.WorkspaceRole.ADMIN;
    const isCommentAuthor = comment.userId === user.id;
    if (!canManageComment && !isCommentAuthor) {
        return next(new ErrorResponse_1.default("You are not allowed to update this comment", 403));
    }
    const updatedComment = await prisma_1.default.comment.update({
        where: {
            id: comment.id,
        },
        data: {
            body: trimmedBody,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
    return res.status(200).json({
        message: "Comment updated successfully",
        comment: updatedComment,
    });
});
exports.deleteIssueComment = (0, asyncHandler_1.default)(async (req, res, next) => {
    const authReq = req;
    const user = authReq.user;
    if (!user) {
        return next(new ErrorResponse_1.default("Unauthorized access", 401));
    }
    const { workspaceId, projectId, issueId, commentId } = req.params;
    if (typeof workspaceId !== "string") {
        return next(new ErrorResponse_1.default("Workspace id is required", 400));
    }
    if (typeof projectId !== "string") {
        return next(new ErrorResponse_1.default("Project id is required", 400));
    }
    if (typeof issueId !== "string") {
        return next(new ErrorResponse_1.default("Issue id is required", 400));
    }
    if (typeof commentId !== "string") {
        return next(new ErrorResponse_1.default("Comment id is required", 400));
    }
    const comment = await prisma_1.default.comment.findFirst({
        where: {
            id: commentId,
            issueId,
            issue: {
                projectId,
                project: {
                    workspaceId,
                },
            },
        },
    });
    if (!comment) {
        return next(new ErrorResponse_1.default("Comment not found", 404));
    }
    const currentMember = await prisma_1.default.workspaceMember.findUnique({
        where: {
            userId_workspaceId: {
                userId: user.id,
                workspaceId,
            },
        },
    });
    if (!currentMember) {
        return next(new ErrorResponse_1.default("Workspace membership not found", 403));
    }
    const canManageComment = currentMember.role === "OWNER" || currentMember.role === "ADMIN";
    const isCommentAuthor = comment.userId === user.id;
    if (!canManageComment && !isCommentAuthor) {
        return next(new ErrorResponse_1.default("You are not allowed to delete this comment", 403));
    }
    const deletedComment = await prisma_1.default.comment.delete({
        where: {
            id: comment.id,
        },
    });
    return res.status(200).json({
        message: "Comment deleted successfully",
        comment: {
            id: deletedComment.id,
        },
    });
});
