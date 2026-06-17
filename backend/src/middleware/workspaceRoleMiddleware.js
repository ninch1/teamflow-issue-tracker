"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const asyncHandler_1 = __importDefault(require("./asyncHandler"));
const ErrorResponse_1 = __importDefault(require("../errors/ErrorResponse"));
const prisma_1 = __importDefault(require("../lib/prisma"));
// Middleware to protect routes from unauthorized role users
// put this middleware after authMiddleware to access user object
exports.default = (roles) => {
    return (0, asyncHandler_1.default)(async (req, res, next) => {
        const authReq = req;
        const user = authReq.user;
        const workspaceId = req.params.workspaceId;
        if (!user) {
            return next(new ErrorResponse_1.default('Unauthorized access', 401));
        }
        if (typeof workspaceId !== 'string') {
            return next(new ErrorResponse_1.default('Workspace id is required', 400));
        }
        const membership = await prisma_1.default.workspaceMember.findUnique({
            where: {
                userId_workspaceId: {
                    userId: user.id,
                    workspaceId,
                },
            },
        });
        if (!membership) {
            return next(new ErrorResponse_1.default('You do not have access to this workspace', 403));
        }
        if (!roles.includes(membership.role)) {
            return next(new ErrorResponse_1.default('You do not have permission to perform this action', 403));
        }
        next();
    });
};
