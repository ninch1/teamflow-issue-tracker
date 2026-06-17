"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProject = exports.deleteProject = exports.getProject = exports.getProjects = exports.createProject = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const ErrorResponse_1 = __importDefault(require("../errors/ErrorResponse"));
const asyncHandler_1 = __importDefault(require("../middleware/asyncHandler"));
exports.createProject = (0, asyncHandler_1.default)(async (req, res, next) => {
    // Get authenticated user added by authMiddleware.
    const authReq = req;
    const user = authReq.user;
    if (!user) {
        return next(new ErrorResponse_1.default('Unauthorized access', 401));
    }
    // Get workspace id from parent route: /api/workspace/:workspaceId/projects.
    const workspaceId = req.params.workspaceId;
    if (typeof workspaceId !== 'string') {
        return next(new ErrorResponse_1.default('Please choose workspace to create project', 400));
    }
    // Validate project name from request body.
    if (!req.body) {
        return next(new ErrorResponse_1.default('Name is required to create project', 400));
    }
    const projectName = req.body.name;
    const description = req.body.description;
    if (typeof projectName !== 'string') {
        return next(new ErrorResponse_1.default('Name is required to create project', 400));
    }
    let trimmedDescription;
    if (description !== undefined) {
        if (typeof description !== 'string') {
            return next(new ErrorResponse_1.default('Project description must be a string', 400));
        }
        trimmedDescription = description.trim();
        if (trimmedDescription.length > 500) {
            return next(new ErrorResponse_1.default('Project description must be 500 characters or less', 400));
        }
    }
    const trimmedName = projectName.trim();
    const projectNameRegex = /^[A-Za-z0-9 _'-]{2,50}$/;
    if (!projectNameRegex.test(trimmedName)) {
        return next(new ErrorResponse_1.default('Project name must be 2-50 characters and can include letters, numbers, spaces, hyphens, underscores, and apostrophes', 400));
    }
    // Create project inside the selected workspace.
    const project = await prisma_1.default.project.create({
        data: {
            name: trimmedName,
            description: trimmedDescription,
            workspaceId,
        },
    });
    return res.status(201).json({
        message: 'Created new project successfully',
        project: {
            id: project.id,
            name: project.name,
            description: project.description,
            workspaceId: project.workspaceId,
            createdAt: project.createdAt,
        },
    });
});
// Gets all projects with workspace id.
exports.getProjects = (0, asyncHandler_1.default)(async (req, res, next) => {
    // Get authenticated user added by authMiddleware.
    const authReq = req;
    const user = authReq.user;
    if (!user) {
        return next(new ErrorResponse_1.default('Unauthorized access', 401));
    }
    const workspaceId = req.params.workspaceId;
    if (typeof workspaceId !== 'string') {
        return next(new ErrorResponse_1.default('Workspace id is required', 400));
    }
    const projects = await prisma_1.default.project.findMany({
        where: {
            workspaceId,
        },
    });
    // shape response
    const projectsResponse = projects.map((project) => ({
        id: project.id,
        name: project.name,
        description: project.description,
        workspaceId: project.workspaceId,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
    }));
    res.status(200).json({
        message: 'Successfully got all projects',
        projects: projectsResponse,
    });
});
// Gets single project based on id
exports.getProject = (0, asyncHandler_1.default)(async (req, res, next) => {
    // Get authenticated user added by authMiddleware.
    const authReq = req;
    const user = authReq.user;
    if (!user) {
        return next(new ErrorResponse_1.default('Unauthorized access', 401));
    }
    const projectId = req.params.projectId;
    const workspaceId = req.params.workspaceId;
    if (typeof projectId !== 'string') {
        return next(new ErrorResponse_1.default('Project id is required to get project', 400));
    }
    if (typeof workspaceId !== 'string') {
        return next(new ErrorResponse_1.default('Workspace id is required to get project', 400));
    }
    const project = await prisma_1.default.project.findFirst({
        where: {
            id: projectId,
            workspaceId,
        },
    });
    if (!project) {
        return next(new ErrorResponse_1.default('Project not found', 404));
    }
    return res.status(200).json({
        message: 'Returned project successfully',
        project,
    });
});
// Deletes project based on id
exports.deleteProject = (0, asyncHandler_1.default)(async (req, res, next) => {
    const authReq = req;
    const user = authReq.user;
    if (!user) {
        return next(new ErrorResponse_1.default('Unauthorized access', 401));
    }
    const workspaceId = req.params.workspaceId;
    const projectId = req.params.projectId;
    if (typeof workspaceId !== 'string') {
        return next(new ErrorResponse_1.default('Workspace id is required to delete project', 400));
    }
    if (typeof projectId !== 'string') {
        return next(new ErrorResponse_1.default('Project id is required to delete project', 400));
    }
    const project = await prisma_1.default.project.findFirst({
        where: {
            id: projectId,
            workspaceId,
        },
    });
    if (!project) {
        return next(new ErrorResponse_1.default('Project not found', 404));
    }
    const [, , deletedProject] = await prisma_1.default.$transaction([
        prisma_1.default.comment.deleteMany({
            where: {
                issue: {
                    projectId: project.id,
                },
            },
        }),
        prisma_1.default.issue.deleteMany({
            where: {
                projectId: project.id,
            },
        }),
        prisma_1.default.project.delete({
            where: {
                id: project.id,
            },
        }),
    ]);
    return res.status(200).json({
        message: 'Project was deleted successfully',
        project: {
            id: deletedProject.id,
            name: deletedProject.name,
        },
    });
});
// Update project. OWNER and ADMIN only.
exports.updateProject = (0, asyncHandler_1.default)(async (req, res, next) => {
    // Get authenticated user added by authMiddleware.
    const authReq = req;
    const user = authReq.user;
    if (!user) {
        return next(new ErrorResponse_1.default('Unauthorized access', 401));
    }
    // Get workspace and project ids from route params.
    const workspaceId = req.params.workspaceId;
    const projectId = req.params.projectId;
    if (typeof workspaceId !== 'string') {
        return next(new ErrorResponse_1.default('Workspace id is required to update project', 400));
    }
    if (typeof projectId !== 'string') {
        return next(new ErrorResponse_1.default('Project id is required to update project', 400));
    }
    if (!req.body) {
        return next(new ErrorResponse_1.default('Updated data is required in order to update', 400));
    }
    const name = req.body.name;
    const description = req.body.description;
    // Build update data only from fields provided in the request body.
    const dataToUpdate = {};
    // Validate name only if user provided it.
    if (name !== undefined) {
        if (typeof name !== 'string') {
            return next(new ErrorResponse_1.default('Project name must be a string', 400));
        }
        const trimmedName = name.trim();
        const projectNameRegex = /^[A-Za-z0-9 _'-]{2,50}$/;
        if (!projectNameRegex.test(trimmedName)) {
            return next(new ErrorResponse_1.default('Project name must be 2-50 characters and can include letters, numbers, spaces, hyphens, underscores, and apostrophes', 400));
        }
        dataToUpdate.name = trimmedName;
    }
    // Validate description only if user provided it.
    // null is allowed so the frontend can clear the description.
    if (description !== undefined) {
        if (description === null) {
            dataToUpdate.description = null;
        }
        else if (typeof description !== 'string') {
            return next(new ErrorResponse_1.default('Project description must be a string', 400));
        }
        else {
            const trimmedDescription = description.trim();
            if (trimmedDescription.length > 500) {
                return next(new ErrorResponse_1.default('Project description must be 500 characters or less', 400));
            }
            dataToUpdate.description = trimmedDescription;
        }
    }
    // Prevent empty PATCH requests.
    if (Object.keys(dataToUpdate).length === 0) {
        return next(new ErrorResponse_1.default('Please provide name or description to update', 400));
    }
    // Make sure the project exists inside this workspace.
    const project = await prisma_1.default.project.findFirst({
        where: {
            id: projectId,
            workspaceId,
        },
    });
    if (!project) {
        return next(new ErrorResponse_1.default('Project not found', 404));
    }
    // Update only the provided fields.
    const updatedProject = await prisma_1.default.project.update({
        where: {
            id: project.id,
        },
        data: dataToUpdate,
    });
    return res.status(200).json({
        message: 'Project updated successfully',
        project: {
            id: updatedProject.id,
            name: updatedProject.name,
            description: updatedProject.description,
            workspaceId: updatedProject.workspaceId,
            createdAt: updatedProject.createdAt,
            updatedAt: updatedProject.updatedAt,
        },
    });
});
