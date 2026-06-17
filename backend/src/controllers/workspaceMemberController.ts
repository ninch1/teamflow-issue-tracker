import prisma from "../lib/prisma";
import ErrorResponse from "../errors/ErrorResponse";
import asyncHandler from "../middleware/asyncHandler";
import { AuthRequest } from "../types/auth";
import { WorkspaceRole, ActivityType } from "@prisma/client";
import { createActivity } from "../utils/createActivity";

// gets all users of workspace
export const getWorkspaceMembers = asyncHandler(async (req, res, next) => {
  const workspaceId = req.params.workspaceId;

  if (typeof workspaceId !== "string") {
    return next(new ErrorResponse("Workspace id is required", 400));
  }

  const members = await prisma.workspaceMember.findMany({
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
export const updateWorkspaceMemberRole = asyncHandler(
  async (req, res, next) => {
    const authReq = req as AuthRequest;
    const user = authReq.user;

    if (!user) {
      return next(new ErrorResponse("Unauthorized access", 401));
    }

    const workspaceId = req.params.workspaceId;
    const memberId = req.params.memberId;

    if (typeof workspaceId !== "string") {
      return next(new ErrorResponse("Please choose workspace", 400));
    }
    if (typeof memberId !== "string") {
      return next(new ErrorResponse("Please choose member", 400));
    }

    if (!req.body) {
      return next(new ErrorResponse("Please choose role to update", 400));
    }

    const newRole = req.body.role;
    if (typeof newRole !== "string") {
      return next(
        new ErrorResponse("Please choose correct role to update", 400),
      );
    }

    const newRoleTrim = newRole.toUpperCase().trim();

    if (
      newRoleTrim !== "OWNER" &&
      newRoleTrim !== "ADMIN" &&
      newRoleTrim !== "MEMBER"
    ) {
      return next(
        new ErrorResponse("Role must be OWNER, ADMIN, or MEMBER", 400),
      );
    }

    let updatedRole: WorkspaceRole;

    if (newRoleTrim === WorkspaceRole.OWNER) {
      updatedRole = WorkspaceRole.OWNER;
    } else if (newRoleTrim === WorkspaceRole.ADMIN) {
      updatedRole = WorkspaceRole.ADMIN;
    } else {
      updatedRole = WorkspaceRole.MEMBER;
    }

    const membership = await prisma.workspaceMember.findFirst({
      where: {
        id: memberId,
        workspaceId,
      },
    });

    // Check if target member belongs to this workspace.
    if (!membership) {
      return next(new ErrorResponse("User is not in this workspace", 400));
    }

    // check if user already has updated role
    if (membership.role === updatedRole) {
      return next(new ErrorResponse("User already has this role", 400));
    }

    if (
      membership.role === WorkspaceRole.OWNER &&
      updatedRole !== WorkspaceRole.OWNER
    ) {
      const ownerCount = await prisma.workspaceMember.count({
        where: {
          workspaceId,
          role: WorkspaceRole.OWNER,
        },
      });

      if (ownerCount === 1) {
        return next(
          new ErrorResponse(
            "You cannot remove the last owner from this workspace",
            400,
          ),
        );
      }
    }

    const updatedMembership = await prisma.workspaceMember.update({
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
  },
);

export const removeWorkspaceMember = asyncHandler(async (req, res, next) => {
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    return next(new ErrorResponse("Unauthorized access", 401));
  }

  const memberId = req.params.memberId;
  const workspaceId = req.params.workspaceId;

  if (typeof workspaceId !== "string") {
    return next(new ErrorResponse("Please choose workspace", 400));
  }

  if (typeof memberId !== "string") {
    return next(new ErrorResponse("Please choose member", 400));
  }

  const currentMembership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId,
      },
    },
  });

  if (!currentMembership) {
    return next(
      new ErrorResponse("You do not have access to this workspace", 403),
    );
  }

  const membership = await prisma.workspaceMember.findFirst({
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
    return next(new ErrorResponse("Membership not found", 404));
  }

  if (membership.userId === user.id) {
    return next(new ErrorResponse("You cannot remove yourself", 400));
  }

  if (membership.role === WorkspaceRole.OWNER) {
    return next(new ErrorResponse("Owner cannot be removed", 400));
  }

  if (
    currentMembership.role === WorkspaceRole.ADMIN &&
    membership.role !== WorkspaceRole.MEMBER
  ) {
    return next(
      new ErrorResponse("Admins can only remove regular members", 403),
    );
  }

  const removedMemberName = membership.user.name || membership.user.email;

  await prisma.$transaction([
    prisma.issue.updateMany({
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
    prisma.workspaceMember.delete({
      where: {
        id: memberId,
      },
    }),
  ]);

  await createActivity({
    workspaceId,
    userId: user.id,
    type: ActivityType.WORKSPACE_MEMBER_REMOVED,
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
export const leaveWorkspace = asyncHandler(async (req, res, next) => {
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    return next(new ErrorResponse("Unauthorized access", 401));
  }

  const workspaceId = req.params.workspaceId;

  if (typeof workspaceId !== "string") {
    return next(new ErrorResponse("Workspace id is required", 400));
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId: user.id,
    },
  });

  if (!membership) {
    return next(new ErrorResponse("Workspace membership not found", 404));
  }

  if (membership.role === WorkspaceRole.OWNER) {
    const ownerCount = await prisma.workspaceMember.count({
      where: {
        workspaceId,
        role: WorkspaceRole.OWNER,
      },
    });

    if (ownerCount === 1) {
      return next(
        new ErrorResponse(
          "You cannot leave this workspace because you are the only owner",
          400,
        ),
      );
    }
  }

  await prisma.workspaceMember.delete({
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
