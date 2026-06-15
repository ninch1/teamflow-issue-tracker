import express from "express";
import {
  getWorkspaceLabels,
  createWorkspaceLabel,
  updateWorkspaceLabel,
  deleteWorkspaceLabel,
} from "../controllers/labelController";
import authMiddleware from "../middleware/authMiddleware";
import workspaceRoleMiddleware from "../middleware/workspaceRoleMiddleware";
import { WorkspaceRole } from "../generated/prisma/client";

const labelRouter = express.Router({ mergeParams: true });

labelRouter
  .route("/")
  .get(
    authMiddleware,
    workspaceRoleMiddleware([
      WorkspaceRole.OWNER,
      WorkspaceRole.ADMIN,
      WorkspaceRole.MEMBER,
    ]),
    getWorkspaceLabels,
  )
  .post(
    authMiddleware,
    workspaceRoleMiddleware([WorkspaceRole.OWNER, WorkspaceRole.ADMIN]),
    createWorkspaceLabel,
  );

labelRouter
  .route("/:labelId")
  .patch(
    authMiddleware,
    workspaceRoleMiddleware([WorkspaceRole.OWNER, WorkspaceRole.ADMIN]),
    updateWorkspaceLabel,
  )
  .delete(
    authMiddleware,
    workspaceRoleMiddleware([WorkspaceRole.OWNER, WorkspaceRole.ADMIN]),
    deleteWorkspaceLabel,
  );

export default labelRouter;
