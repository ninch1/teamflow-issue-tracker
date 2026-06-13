import prisma from "../lib/prisma";
import ErrorResponse from "../errors/ErrorResponse";
import asyncHandler from "../middleware/asyncHandler";
import { AuthRequest } from "../types/auth";

// Gets the latest workspace activities with pagination.
export const getActivities = asyncHandler(async (req, res, next) => {
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    return next(new ErrorResponse("Unauthorized access", 401));
  }

  const workspaceId = req.params.workspaceId;

  if (typeof workspaceId !== "string") {
    return next(new ErrorResponse("Workspace id is required", 400));
  }

  const limitQuery = req.query.limit;
  const pageQuery = req.query.page;

  const limit =
    typeof limitQuery === "string" ? Number.parseInt(limitQuery, 10) : 3;

  const page =
    typeof pageQuery === "string" ? Number.parseInt(pageQuery, 10) : 1;

  if (Number.isNaN(limit) || limit < 1 || limit > 50) {
    return next(new ErrorResponse("Limit must be between 1 and 50", 400));
  }

  if (Number.isNaN(page) || page < 1) {
    return next(new ErrorResponse("Page must be 1 or greater", 400));
  }

  const skip = (page - 1) * limit;

  const activities = await prisma.activity.findMany({
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
