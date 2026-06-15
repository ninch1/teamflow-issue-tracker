import express, { Request, Response } from 'express';
import cors from 'cors';
import authRouter from './routes/authRoutes';
import workspaceRouter from './routes/workspaceRoutes';
import projectsRouter from './routes/projectsRoutes';
import issueRouter from './routes/issueRoutes';
import invitationRouter from './routes/invitationRoutes';
import errorMiddleware from './middleware/errorMiddleware';
import labelRouter from './routes/labelRoutes';

const app = express();

app.use(cors());
app.use(express.json());

// GET request to check api health
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// AUTH route mount
app.use('/api/auth', authRouter);

// Workspace route mount
app.use('/api/workspace', workspaceRouter);

// Projects route mount
app.use('/api/workspace/:workspaceId/projects', projectsRouter);

// Issues route mount
app.use('/api/workspace/:workspaceId/projects/:projectId/issues', issueRouter);

// Invitation route mount
app.use('/api/invitations', invitationRouter);

// Labels route mount
app.use('/api/workspace/:workspaceId/labels', labelRouter);

// Catches bad requests 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Invalid api request' });
});

// Catches errors passed to next()
app.use(errorMiddleware);

export default app;
