"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWorkspaceLabel = exports.updateWorkspaceLabel = exports.removeLabelFromIssue = exports.addLabelToIssue = exports.createWorkspaceLabel = exports.getWorkspaceLabels = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const ErrorResponse_1 = __importDefault(require("../errors/ErrorResponse"));
const asyncHandler_1 = __importDefault(require("../middleware/asyncHandler"));
const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
function getLabelColorValidationError(color) {
    if (color === undefined) {
        return undefined;
    }
    if (color === null) {
        return null;
    }
    if (typeof color !== "string") {
        return "Label color must be a string";
    }
    const trimmedColor = color.trim();
    if (!trimmedColor) {
        return null;
    }
    if (!HEX_COLOR_REGEX.test(trimmedColor)) {
        return "Label color must be a valid hex color";
    }
    return null;
}
exports.getWorkspaceLabels = (0, asyncHandler_1.default)(async (req, res, next) => {
    const authReq = req;
    const user = authReq.user;
    if (!user) {
        return next(new ErrorResponse_1.default("Unauthorized access", 401));
    }
    const { workspaceId } = req.params;
    if (typeof workspaceId !== "string") {
        return next(new ErrorResponse_1.default("Workspace id is required", 400));
    }
    const labels = await prisma_1.default.label.findMany({
        where: {
            workspaceId,
        },
        orderBy: {
            name: "asc",
        },
    });
    return res.status(200).json({
        message: "Labels retrieved successfully",
        labels,
    });
});
exports.createWorkspaceLabel = (0, asyncHandler_1.default)(async (req, res, next) => {
    const authReq = req;
    const user = authReq.user;
    if (!user) {
        return next(new ErrorResponse_1.default("Unauthorized access", 401));
    }
    const { workspaceId } = req.params;
    if (typeof workspaceId !== "string") {
        return next(new ErrorResponse_1.default("Workspace id is required", 400));
    }
    const { name, color } = req.body;
    if (typeof name !== "string" || !name.trim()) {
        return next(new ErrorResponse_1.default("Label name is required", 400));
    }
    const trimmedName = name.trim();
    if (trimmedName.length > 30) {
        return next(new ErrorResponse_1.default("Label name must be 30 characters or less", 400));
    }
    if (color !== undefined && color !== null && typeof color !== "string") {
        return next(new ErrorResponse_1.default("Label color must be a string", 400));
    }
    const colorValidationError = getLabelColorValidationError(color);
    if (colorValidationError) {
        return next(new ErrorResponse_1.default(colorValidationError, 400));
    }
    const trimmedColor = typeof color === "string" && color.trim() ? color.trim() : null;
    const existingLabel = await prisma_1.default.label.findUnique({
        where: {
            workspaceId_name: {
                workspaceId,
                name: trimmedName,
            },
        },
    });
    if (existingLabel) {
        return next(new ErrorResponse_1.default("Label already exists", 400));
    }
    const label = await prisma_1.default.label.create({
        data: {
            name: trimmedName,
            color: trimmedColor,
            workspaceId,
        },
    });
    return res.status(201).json({
        message: "Label created successfully",
        label,
    });
});
exports.addLabelToIssue = (0, asyncHandler_1.default)(async (req, res, next) => {
    const authReq = req;
    const user = authReq.user;
    if (!user) {
        return next(new ErrorResponse_1.default("Unauthorized access", 401));
    }
    const { workspaceId, projectId, issueId, labelId } = req.params;
    if (typeof workspaceId !== "string") {
        return next(new ErrorResponse_1.default("Workspace id is required", 400));
    }
    if (typeof projectId !== "string") {
        return next(new ErrorResponse_1.default("Project id is required", 400));
    }
    if (typeof issueId !== "string") {
        return next(new ErrorResponse_1.default("Issue id is required", 400));
    }
    if (typeof labelId !== "string") {
        return next(new ErrorResponse_1.default("Label id is required", 400));
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
    const label = await prisma_1.default.label.findFirst({
        where: {
            id: labelId,
            workspaceId,
        },
    });
    if (!label) {
        return next(new ErrorResponse_1.default("Label not found", 404));
    }
    const issueLabel = await prisma_1.default.issueLabel.upsert({
        where: {
            issueId_labelId: {
                issueId,
                labelId,
            },
        },
        update: {},
        create: {
            issueId,
            labelId,
        },
        include: {
            label: true,
        },
    });
    return res.status(201).json({
        message: "Label added to issue successfully",
        issueLabel,
    });
});
exports.removeLabelFromIssue = (0, asyncHandler_1.default)(async (req, res, next) => {
    const authReq = req;
    const user = authReq.user;
    if (!user) {
        return next(new ErrorResponse_1.default("Unauthorized access", 401));
    }
    const { workspaceId, projectId, issueId, labelId } = req.params;
    if (typeof workspaceId !== "string") {
        return next(new ErrorResponse_1.default("Workspace id is required", 400));
    }
    if (typeof projectId !== "string") {
        return next(new ErrorResponse_1.default("Project id is required", 400));
    }
    if (typeof issueId !== "string") {
        return next(new ErrorResponse_1.default("Issue id is required", 400));
    }
    if (typeof labelId !== "string") {
        return next(new ErrorResponse_1.default("Label id is required", 400));
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
    const issueLabel = await prisma_1.default.issueLabel.findUnique({
        where: {
            issueId_labelId: {
                issueId,
                labelId,
            },
        },
    });
    if (!issueLabel) {
        return next(new ErrorResponse_1.default("Issue label not found", 404));
    }
    await prisma_1.default.issueLabel.delete({
        where: {
            issueId_labelId: {
                issueId,
                labelId,
            },
        },
    });
    return res.status(200).json({
        message: "Label removed from issue successfully",
        issueLabel: {
            issueId,
            labelId,
        },
    });
});
exports.updateWorkspaceLabel = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { workspaceId, labelId } = req.params;
    if (typeof workspaceId !== "string") {
        return next(new ErrorResponse_1.default("Workspace id is required", 400));
    }
    if (typeof labelId !== "string") {
        return next(new ErrorResponse_1.default("Label id is required", 400));
    }
    const { name, color } = req.body;
    if (name !== undefined && typeof name !== "string") {
        return next(new ErrorResponse_1.default("Label name must be a string", 400));
    }
    if (color !== undefined && color !== null && typeof color !== "string") {
        return next(new ErrorResponse_1.default("Label color must be a string", 400));
    }
    const colorValidationError = getLabelColorValidationError(color);
    if (colorValidationError) {
        return next(new ErrorResponse_1.default(colorValidationError, 400));
    }
    const trimmedName = typeof name === "string" ? name.trim() : undefined;
    if (trimmedName !== undefined && trimmedName.length < 1) {
        return next(new ErrorResponse_1.default("Label name is required", 400));
    }
    if (trimmedName !== undefined && trimmedName.length > 30) {
        return next(new ErrorResponse_1.default("Label name must be 30 characters or less", 400));
    }
    const label = await prisma_1.default.label.findFirst({
        where: {
            id: labelId,
            workspaceId,
        },
    });
    if (!label) {
        return next(new ErrorResponse_1.default("Label not found", 404));
    }
    if (trimmedName === undefined && color === undefined) {
        return next(new ErrorResponse_1.default("No label changes provided", 400));
    }
    const updatedLabel = await prisma_1.default.label.update({
        where: {
            id: label.id,
        },
        data: {
            ...(trimmedName !== undefined ? { name: trimmedName } : {}),
            ...(color !== undefined
                ? {
                    color: typeof color === "string" && color.trim() ? color.trim() : null,
                }
                : {}),
        },
    });
    return res.status(200).json({
        message: "Label updated successfully",
        label: updatedLabel,
    });
});
exports.deleteWorkspaceLabel = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { workspaceId, labelId } = req.params;
    if (typeof workspaceId !== "string") {
        return next(new ErrorResponse_1.default("Workspace id is required", 400));
    }
    if (typeof labelId !== "string") {
        return next(new ErrorResponse_1.default("Label id is required", 400));
    }
    const label = await prisma_1.default.label.findFirst({
        where: {
            id: labelId,
            workspaceId,
        },
    });
    if (!label) {
        return next(new ErrorResponse_1.default("Label not found", 404));
    }
    const deletedLabel = await prisma_1.default.label.delete({
        where: {
            id: label.id,
        },
    });
    return res.status(200).json({
        message: "Label deleted successfully",
        label: {
            id: deletedLabel.id,
            name: deletedLabel.name,
        },
    });
});
