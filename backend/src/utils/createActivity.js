"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatIssueStatus = formatIssueStatus;
exports.formatIssuePriority = formatIssuePriority;
exports.createActivity = createActivity;
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("../generated/prisma/client");
function formatIssueStatus(status) {
    switch (status) {
        case client_1.IssueStatus.TODO:
            return 'Todo';
        case client_1.IssueStatus.IN_PROGRESS:
            return 'In Progress';
        case client_1.IssueStatus.DONE:
            return 'Done';
        default:
            return status;
    }
}
function formatIssuePriority(priority) {
    switch (priority) {
        case client_1.IssuePriority.LOW:
            return 'Low';
        case client_1.IssuePriority.MEDIUM:
            return 'Medium';
        case client_1.IssuePriority.HIGH:
            return 'High';
        default:
            return priority;
    }
}
async function createActivity(data) {
    return prisma_1.default.activity.create({
        data: {
            workspaceId: data.workspaceId,
            userId: data.userId,
            type: data.type,
            message: data.message,
            issueId: data.issueId ?? null,
            projectId: data.projectId ?? null,
            oldValue: data.oldValue ?? null,
            newValue: data.newValue ?? null,
        },
    });
}
