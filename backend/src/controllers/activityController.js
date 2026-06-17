"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivities = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const ErrorResponse_1 = __importDefault(require("../errors/ErrorResponse"));
const asyncHandler_1 = __importDefault(require("../middleware/asyncHandler"));
// Gets the latest workspace activities with pagination.
exports.getActivities = (0, asyncHandler_1.default)(async (req, res, next) => {
    const authReq = req;
    const user = authReq.user;
    if (!user) {
        return next(new ErrorResponse_1.default("Unauthorized access", 401));
    }
    const workspaceId = req.params.workspaceId;
    if (typeof workspaceId !== "string") {
        return next(new ErrorResponse_1.default("Workspace id is required", 400));
    }
    const limitQuery = req.query.limit;
    const pageQuery = req.query.page;
    const limit = typeof limitQuery === "string" ? Number.parseInt(limitQuery, 10) : 3;
    const page = typeof pageQuery === "string" ? Number.parseInt(pageQuery, 10) : 1;
    if (Number.isNaN(limit) || limit < 1 || limit > 50) {
        return next(new ErrorResponse_1.default("Limit must be between 1 and 50", 400));
    }
    if (Number.isNaN(page) || page < 1) {
        return next(new ErrorResponse_1.default("Page must be 1 or greater", 400));
    }
    const skip = (page - 1) * limit;
    const activities = await prisma_1.default.activity.findMany({
        where: {
            workspaceId,
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
    });
    return res.status(200).json({
        message: "Activities retrieved successfully",
        page,
        limit,
        activities,
    });
});
