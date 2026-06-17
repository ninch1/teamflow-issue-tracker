"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveWorkspace = exports.removeWorkspaceMember = exports.updateWorkspaceMemberRole = exports.getWorkspaceMembers = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const ErrorResponse_1 = __importDefault(require("../errors/ErrorResponse"));
const asyncHandler_1 = __importDefault(require("../middleware/asyncHandler"));
const client_1 = require("../generated/prisma/client");
const createActivity_1 = require("../utils/createActivity");
// gets all users of workspace
exports.getWorkspaceMembers = (0, asyncHandler_1.default)(async (req, res, next) => {
    const workspaceId = req.params.workspaceId;
    if (typeof workspaceId !== "string") {
        return next(new ErrorResponse_1.default("Workspace id is required", 400));
    }
    const members = await prisma_1.default.workspaceMember.findMany({
        where: {
            workspaceId,
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
        orderBy: {
            createdAt: "asc",
        },
    });
    const membersResponse = members.map((member) => {
        return {
            id: member.id,
            role: member.role,
            joinedAt: member.createdAt,
            user: member.user,
        };
    });
    return res.status(200).json({
        message: "Got workspace members successfully",
        members: membersResponse,
    });
});
// change members role, based on membership id
exports.updateWorkspaceMemberRole = (0, asyncHandler_1.default)(async (req, res, next) => {
    const authReq = req;
    const user = authReq.user;
    if (!user) {
        return next(new ErrorResponse_1.default("Unauthorized access", 401));
    }
    const workspaceId = req.params.workspaceId;
    const memberId = req.params.memberId;
    if (typeof workspaceId !== "string") {
        return next(new ErrorResponse_1.default("Please choose workspace", 400));
    }
    if (typeof memberId !== "string") {
        return next(new ErrorResponse_1.default("Please choose member", 400));
    }
    if (!req.body) {
        return next(new ErrorResponse_1.default("Please choose role to update", 400));
    }
    const newRole = req.body.role;
    if (typeof newRole !== "string") {
        return next(new ErrorResponse_1.default("Please choose correct role to update", 400));
    }
    const newRoleTrim = newRole.toUpperCase().trim();
    if (newRoleTrim !== "OWNER" &&
        newRoleTrim !== "ADMIN" &&
        newRoleTrim !== "MEMBER") {
        return next(new ErrorResponse_1.default("Role must be OWNER, ADMIN, or MEMBER", 400));
    }
    let updatedRole;
    if (newRoleTrim === client_1.WorkspaceRole.OWNER) {
        updatedRole = client_1.WorkspaceRole.OWNER;
    }
    else if (newRoleTrim === client_1.WorkspaceRole.ADMIN) {
        updatedRole = client_1.WorkspaceRole.ADMIN;
    }
    else {
        updatedRole = client_1.WorkspaceRole.MEMBER;
    }
    const membership = await prisma_1.default.workspaceMember.findFirst({
        where: {
            id: memberId,
            workspaceId,
        },
    });
    // Check if target member belongs to this workspace.
    if (!membership) {
        return next(new ErrorResponse_1.default("User is not in this workspace", 400));
    }
    // check if user already has updated role
    if (membership.role === updatedRole) {
        return next(new ErrorResponse_1.default("User already has this role", 400));
    }
    if (membership.role === client_1.WorkspaceRole.OWNER &&
        updatedRole !== client_1.WorkspaceRole.OWNER) {
        const ownerCount = await prisma_1.default.workspaceMember.count({
            where: {
                workspaceId,
                role: client_1.WorkspaceRole.OWNER,
            },
        });
        if (ownerCount === 1) {
            return next(new ErrorResponse_1.default("You cannot remove the last owner from this workspace", 400));
        }
    }
    const updatedMembership = await prisma_1.default.workspaceMember.update({
        where: {
            id: membership.id,
        },
        data: {
            role: updatedRole,
        },
    });
    return res.status(200).json({
        message: "Successfully changed role",
        membership: {
            id: updatedMembership.id,
            userId: updatedMembership.userId,
            workspaceId: updatedMembership.workspaceId,
            role: updatedMembership.role,
            updatedAt: updatedMembership.updatedAt,
        },
    });
});
exports.removeWorkspaceMember = (0, asyncHandler_1.default)(async (req, res, next) => {
    const authReq = req;
    const user = authReq.user;
    if (!user) {
        return next(new ErrorResponse_1.default("Unauthorized access", 401));
    }
    const memberId = req.params.memberId;
    const workspaceId = req.params.workspaceId;
    if (typeof workspaceId !== "string") {
        return next(new ErrorResponse_1.default("Please choose workspace", 400));
    }
    if (typeof memberId !== "string") {
        return next(new ErrorResponse_1.default("Please choose member", 400));
    }
    const currentMembership = await prisma_1.default.workspaceMember.findUnique({
        where: {
            userId_workspaceId: {
                userId: user.id,
                workspaceId,
            },
        },
    });
    if (!currentMembership) {
        return next(new ErrorResponse_1.default("You do not have access to this workspace", 403));
    }
    const membership = await prisma_1.default.workspaceMember.findFirst({
        where: {
            id: memberId,
            workspaceId,
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
    if (!membership) {
        return next(new ErrorResponse_1.default("Membership not found", 404));
    }
    if (membership.userId === user.id) {
        return next(new ErrorResponse_1.default("You cannot remove yourself", 400));
    }
    if (membership.role === client_1.WorkspaceRole.OWNER) {
        return next(new ErrorResponse_1.default("Owner cannot be removed", 400));
    }
    if (currentMembership.role === client_1.WorkspaceRole.ADMIN &&
        membership.role !== client_1.WorkspaceRole.MEMBER) {
        return next(new ErrorResponse_1.default("Admins can only remove regular members", 403));
    }
    const removedMemberName = membership.user.name || membership.user.email;
    await prisma_1.default.$transaction([
        prisma_1.default.issue.updateMany({
            where: {
                assigneeId: memberId,
                project: {
                    workspaceId,
                },
            },
            data: {
                assigneeId: null,
            },
        }),
        prisma_1.default.workspaceMember.delete({
            where: {
                id: memberId,
            },
        }),
    ]);
    await (0, createActivity_1.createActivity)({
        workspaceId,
        userId: user.id,
        type: client_1.ActivityType.WORKSPACE_MEMBER_REMOVED,
        message: `${user.name} removed ${removedMemberName} from the workspace`,
    });
    return res.status(200).json({
        message: "Successfully removed member",
        membership: {
            id: membership.id,
            userId: membership.userId,
            workspaceId: membership.workspaceId,
            role: membership.role,
        },
    });
});
// Leave workspace as the current authenticated user.
// Any member can leave, except the only OWNER.
exports.leaveWorkspace = (0, asyncHandler_1.default)(async (req, res, next) => {
    const authReq = req;
    const user = authReq.user;
    if (!user) {
        return next(new ErrorResponse_1.default("Unauthorized access", 401));
    }
    const workspaceId = req.params.workspaceId;
    if (typeof workspaceId !== "string") {
        return next(new ErrorResponse_1.default("Workspace id is required", 400));
    }
    const membership = await prisma_1.default.workspaceMember.findFirst({
        where: {
            workspaceId,
            userId: user.id,
        },
    });
    if (!membership) {
        return next(new ErrorResponse_1.default("Workspace membership not found", 404));
    }
    if (membership.role === client_1.WorkspaceRole.OWNER) {
        const ownerCount = await prisma_1.default.workspaceMember.count({
            where: {
                workspaceId,
                role: client_1.WorkspaceRole.OWNER,
            },
        });
        if (ownerCount === 1) {
            return next(new ErrorResponse_1.default("You cannot leave this workspace because you are the only owner", 400));
        }
    }
    await prisma_1.default.workspaceMember.delete({
        where: {
            id: membership.id,
        },
    });
    return res.status(200).json({
        message: "You left the workspace successfully",
        membership: {
            id: membership.id,
            workspaceId: membership.workspaceId,
        },
    });
});
