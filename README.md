# TeamFlow Issue Tracker

TeamFlow is a full-stack team issue tracker and lightweight project management application. It allows users to create workspaces, manage projects, track issues, assign work to team members, organize issues with labels, and view workspace activity.

The project was built as a portfolio-ready full-stack application focused on authentication, relational database modeling, protected routes, role-based permissions, and practical team collaboration workflows.

## Screenshots

### Dashboard

![Dashboard](docs/screenshots/dashboard.png)

### Workspace Overview

![Workspace Overview](docs/screenshots/workspace-overview.png)

### Workspace Labels and Members

![Workspace Labels](docs/screenshots/workspace-labels.png)

### Project Issues

![Project Issues](docs/screenshots/project.png)

### Issue Details

![Issue Details](docs/screenshots/issue-overview.png)

### Issue Comments and Activity

![Issue Comments](docs/screenshots/issue-comments.png)

### Account Page

![Account Page](docs/screenshots/account.png)

### Mobile Layout

![Mobile Layout](docs/screenshots/mobile.png)

## Features

### Authentication

- User registration and login
- JWT access-token authentication
- Refresh-token based session renewal
- Hashed refresh tokens stored in the database
- Logout with refresh-token revocation
- Protected backend routes
- Automatic frontend token refresh on expired access tokens
- Account profile editing
- Password update flow with current-password verification

### Workspaces

- Create and manage workspaces
- View all workspaces the user belongs to
- Workspace detail page with members, projects, labels, and recent activity
- Leave workspace flow
- Delete workspace flow for authorized users

### Roles and Permissions

TeamFlow supports workspace-level roles:

- `OWNER`
- `ADMIN`
- `MEMBER`

Permission rules include:

- Owners can manage workspace settings, members, roles, invitations, projects, issues, and labels.
- Admins can manage workspace work such as projects, issues, labels, and invitations.
- Members can view workspace content and participate in issue workflows based on assignment rules.
- Last-owner protection prevents a workspace from being left without an owner.

### Invitations

- Owners and admins can invite users by email
- Users can view pending invitations
- Users can accept or decline invitations
- Accepted invitations create workspace membership
- Declined users can be invited again
- Invitation errors are handled safely to avoid exposing unnecessary account information

### Projects

- Create projects inside workspaces
- View project details
- Update project name and description
- Delete projects
- Project deletion removes related issues

### Issues

- Create issues inside projects
- View issue details
- Search and filter issues
- Filter issues by status, priority, type, and label
- Update issue title, description, status, priority, and type
- Delete issues
- Assign issues to workspace members
- Allow members to update status for assigned or unassigned issues

### Labels

- Create workspace labels
- Assign labels to issues
- Remove labels from issues
- Edit label name and color
- Delete workspace labels
- Validate label colors using hex color format

### Comments

- Add comments to issues
- Edit comments
- Delete comments
- Show comment author and timestamp

### Activity Feed

- Track workspace activity
- Show recent activity on workspace, project, and issue pages
- Dedicated activity page with pagination
- Activity includes issue creation, updates, assignment changes, comments, and deletions

### Responsive UI

- Desktop sidebar navigation
- Mobile header and drawer navigation
- Responsive workspace, project, issue, and account pages
- Mobile-friendly forms and cards

## Tech Stack

### Backend

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT
- bcrypt
- Helmet
- CORS
- Express rate limiting

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router

## Project Structure

```txt
teamflow-issue-tracker/
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── controllers/
│   │   ├── errors/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── types/
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── errors/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── types/
│   │   └── utils/
└── docs/
    └── screenshots/
```

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

### 3. Create backend environment file

Create a `.env` file inside the `backend` folder.

Use `.env.example` as a guide:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="replace-with-a-secure-random-secret"
FRONTEND_URL="http://localhost:5173"
PORT=3000
NODE_ENV="development"
```

### 4. Run database migrations

```bash
npx prisma migrate dev
```

### 5. Generate Prisma client

```bash
npx prisma generate
```

### 6. Start the backend server

```bash
npm run dev
```

### 7. Install frontend dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

### 8. Start the frontend development server

```bash
npm run dev
```

The frontend will usually run on:

```txt
http://localhost:5173
```

The backend will run on the port defined in your backend `.env`.

## Environment Variables

### Backend

Create `backend/.env` using `backend/.env.example`:

| Variable       | Description                                                |
| -------------- | ---------------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string                               |
| `JWT_SECRET`   | Secret used to sign JWT access tokens                      |
| `FRONTEND_URL` | Allowed frontend origin for CORS                           |
| `PORT`         | Backend server port                                        |
| `NODE_ENV`     | Runtime environment, usually `development` or `production` |

### Frontend

Create `frontend/.env` using `frontend/.env.example`:

| Variable            | Description                               |
| ------------------- | ----------------------------------------- |
| `VITE_API_BASE_URL` | Backend API base URL used by the frontend |

````md
Local example:

````env
VITE_API_BASE_URL="http://localhost:3000/api"

### Frontend lint and build

```bash
cd frontend
npm run lint
npm run build
````

## Security Notes

TeamFlow includes several security-focused backend and frontend decisions:

- Passwords are hashed with bcrypt before storage.
- Refresh tokens are hashed before being stored in the database.
- Logout revokes the active refresh token.
- Password changes revoke active refresh tokens.
- Protected routes require valid JWT authentication.
- Workspace routes check membership before returning workspace data.
- Role-based authorization protects workspace, project, issue, invitation, member, and label actions.
- CORS is restricted using the configured frontend origin.
- Helmet is used for safer HTTP headers.
- Request body size limits are configured.
- Rate limiting is used for API/auth protection.
- The real `.env` file is ignored and not committed.

## Manual QA Checklist

Before deployment, test the following flow:

1. Register a new user
2. Confirm registration redirects to the dashboard
3. Create a workspace
4. Create a project
5. Create an issue
6. Create labels
7. Attach labels to an issue
8. Add a comment
9. Edit and delete a comment
10. Assign an issue to a member
11. Update issue status
12. Invite another user
13. Accept or decline an invitation
14. Update profile details
15. Update password
16. Logout
17. Login again with the new password
18. Test mobile navigation

## What I Learned

This project helped me practice:

- Building a full-stack TypeScript application
- Designing relational database models with Prisma and PostgreSQL
- Implementing JWT authentication with refresh tokens
- Hashing passwords and refresh tokens securely
- Protecting backend routes with authentication middleware
- Designing role-based authorization rules
- Managing frontend auth state and automatic token refresh
- Building reusable React components
- Handling loading, success, and error states
- Creating responsive layouts with Tailwind CSS
- Testing real user flows across frontend and backend

## Current Status

TeamFlow is a completed full-stack portfolio project. The core workspace, project, issue, label, comment, invitation, activity, authentication, and account-management features are implemented.

## Future Improvements

Possible future improvements:

- Email delivery for invitations
- Toast notification system
- Drag-and-drop issue board
- File attachments on issues
- Workspace analytics
- More advanced issue search
- Deployment with production database and hosted frontend/backend
````
