# TeamFlow Issue Tracker

TeamFlow is a full-stack team issue tracker and project management app. It supports workspaces, projects, issues, workspace invitations, member roles, and role-based permissions.

## Tech Stack

### Backend

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication
- bcrypt

### Frontend

- React
- Vite
- Tailwind CSS

> Frontend is planned. Backend API is currently functional and tested manually with Postman.

## Features

### Authentication

- Register user
- Login user
- Get current authenticated user
- JWT-protected routes
- Email normalization to lowercase

### Workspaces

- Create workspace
- Get current user's workspaces
- Get single workspace
- Update workspace name
- Delete workspace
- Automatically assigns workspace creator as `OWNER`

### Workspace Members

- List workspace members
- Update member role
- Remove workspace member

### Roles

Workspace roles:

- `OWNER`
- `ADMIN`
- `MEMBER`

Permission rules:

- `OWNER` can manage workspace, invitations, members, roles, projects, and issues
- `ADMIN` can manage projects, issues, and invitations
- `MEMBER` can view workspace content

### Invitations

- OWNER/ADMIN can invite registered users by email
- Users can view their pending invitations
- Users can accept or decline invitations
- Declined users can be invited again
- Accepting an invitation creates workspace membership

### Projects

- Create project inside workspace
- Get all projects in workspace
- Get single project
- Update project
- Delete project
- Project deletion removes related issues

### Issues

- Create issue inside project
- Get all project issues
- Get single issue
- Update issue
- Delete issue

Issue fields include:

- title
- description
- status
- priority
- type

## Database Models

Main models:

- `User`
- `Workspace`
- `WorkspaceMember`
- `WorkspaceInvitation`
- `Project`
- `Issue`

Enums:

- `WorkspaceRole`
- `InvitationStatus`
- `IssueStatus`
- `IssuePriority`
- `IssueType`

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ninch1/teamflow-issue-tracker
cd teamflow-issue-tracker
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Create `.env`

Inside the `backend` folder, create a `.env` file.

Example:

```env
DATABASE_URL="your-postgres-connection-string"
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"
PORT=5000
```

### 4. Run Prisma migrations

```bash
npx prisma migrate dev
```

### 5. Generate Prisma client

```bash
npx prisma generate
```

### 6. Start development server

```bash
npm run dev
```

## API Routes

Base URL:

```txt
/api
```

## Auth Routes

### Register User

```txt
POST /api/auth/register
```

Body:

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

### Login User

```txt
POST /api/auth/login
```

Body:

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

### Get Current User

```txt
GET /api/auth/me
```

Requires Bearer token.

## Workspace Routes

### Create Workspace

```txt
POST /api/workspace
```

Requires authentication.

Body:

```json
{
  "name": "My Workspace"
}
```

### Get My Workspaces

```txt
GET /api/workspace
```

Requires authentication.

### Get Single Workspace

```txt
GET /api/workspace/:workspaceId
```

Requires workspace membership.

### Update Workspace

```txt
PATCH /api/workspace/:workspaceId
```

Requires `OWNER` or `ADMIN`.

Body:

```json
{
  "name": "Updated Workspace Name"
}
```

### Delete Workspace

```txt
DELETE /api/workspace/:workspaceId
```

Requires `OWNER`.

Deletes related invitations, issues, projects, workspace members, and workspace.

## Workspace Invitation Routes

### Send Invitation

```txt
POST /api/workspace/:workspaceId/invitations
```

Requires `OWNER` or `ADMIN`.

Body:

```json
{
  "email": "member@example.com"
}
```

### Get Workspace Invitations

```txt
GET /api/workspace/:workspaceId/invitations
```

Requires `OWNER` or `ADMIN`.

### Get My Invitations

```txt
GET /api/invitations/me
```

Requires authentication.

### Accept Invitation

```txt
PATCH /api/invitations/:invitationId/accept
```

Requires authentication. Only the invited user can accept the invitation.

### Decline Invitation

```txt
PATCH /api/invitations/:invitationId/decline
```

Requires authentication. Only the invited user can decline the invitation.

## Workspace Member Routes

### Get Workspace Members

```txt
GET /api/workspace/:workspaceId/members
```

Requires workspace membership.

### Update Member Role

```txt
PATCH /api/workspace/:workspaceId/members/:memberId/role
```

Requires `OWNER`.

Body:

```json
{
  "role": "ADMIN"
}
```

Allowed role values:

```txt
ADMIN
MEMBER
```

`OWNER` role cannot be changed through this route.

### Remove Workspace Member

```txt
DELETE /api/workspace/:workspaceId/members/:memberId
```

Requires `OWNER`.

Owners cannot be removed through this route.

## Project Routes

### Create Project

```txt
POST /api/workspace/:workspaceId/projects
```

Requires `OWNER` or `ADMIN`.

Body:

```json
{
  "name": "Backend API",
  "description": "Backend tasks and issues"
}
```

### Get Projects

```txt
GET /api/workspace/:workspaceId/projects
```

Requires workspace membership.

### Get Single Project

```txt
GET /api/workspace/:workspaceId/projects/:projectId
```

Requires workspace membership.

### Update Project

```txt
PATCH /api/workspace/:workspaceId/projects/:projectId
```

Requires `OWNER` or `ADMIN`.

Body can include one or both fields:

```json
{
  "name": "Updated Project",
  "description": "Updated description"
}
```

Description can be cleared with:

```json
{
  "description": null
}
```

### Delete Project

```txt
DELETE /api/workspace/:workspaceId/projects/:projectId
```

Requires `OWNER` or `ADMIN`.

Deletes related issues before deleting the project.

## Issue Routes

### Create Issue

```txt
POST /api/workspace/:workspaceId/projects/:projectId/issues
```

Requires `OWNER` or `ADMIN`.

Body:

```json
{
  "title": "Fix login bug",
  "description": "Login fails with invalid token message",
  "priority": "HIGH",
  "type": "BUG"
}
```

### Get Issues

```txt
GET /api/workspace/:workspaceId/projects/:projectId/issues
```

Requires workspace membership.

### Get Single Issue

```txt
GET /api/workspace/:workspaceId/projects/:projectId/issues/:issueId
```

Requires workspace membership.

### Update Issue

```txt
PATCH /api/workspace/:workspaceId/projects/:projectId/issues/:issueId
```

Requires `OWNER` or `ADMIN`.

Body can include any of:

```json
{
  "title": "Updated issue title",
  "description": "Updated issue description",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "type": "BUG"
}
```

Description can be cleared with:

```json
{
  "description": null
}
```

### Delete Issue

```txt
DELETE /api/workspace/:workspaceId/projects/:projectId/issues/:issueId
```

Requires `OWNER` or `ADMIN`.

## Enum Values

### WorkspaceRole

```txt
OWNER
ADMIN
MEMBER
```

### InvitationStatus

```txt
PENDING
ACCEPTED
DECLINED
```

### IssueStatus

```txt
TODO
IN_PROGRESS
DONE
```

### IssuePriority

```txt
LOW
MEDIUM
HIGH
```

### IssueType

```txt
BUG
TASK
FEATURE
```

## Development Checks

Run TypeScript check:

```bash
npx tsc --noEmit
```

If no output appears, TypeScript passed successfully.

## Manual Test Flow

The backend was tested manually with this full Postman flow:

1. Register/login User A
2. Register/login User B
3. User A creates workspace
4. User A creates project
5. User A creates issue
6. User A invites User B
7. User B sees pending invitation
8. User B accepts invitation
9. User B can view workspace, projects, and issues
10. User A updates User B's role
11. User A removes User B
12. User A deletes project
13. User A deletes workspace

## Current Status

Backend MVP is functional and tested manually with Postman.

Completed backend areas:

- Authentication
- Workspace CRUD
- Project CRUD
- Issue CRUD
- Invitations
- Workspace members
- Role-based access control

Next planned step:

- Build frontend with React, Vite, and Tailwind CSS
