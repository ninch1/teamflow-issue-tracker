import express, { Request, Response } from 'express';
import cors from 'cors';
import authRoute from './routes/authRoutes';

const app = express();

app.use(cors());
app.use(express.json());

// GET request to check api health
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// AUTH route mount
app.use('/api/auth', authRoute);

app.use('/', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Invalid api request' });
});

export default app;
