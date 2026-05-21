import express, { Request, Response } from 'express';
import cors from 'cors';
import authRoute from './routes/authRoutes';
import errorMiddleware from './middleware/errorMiddleware';

const app = express();

app.use(cors());
app.use(express.json());

// GET request to check api health
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// AUTH route mount
app.use('/api/auth', authRoute);

// Catches bad requests 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Invalid api request' });
});

// Catches errors passed to next()
app.use(errorMiddleware);

export default app;
