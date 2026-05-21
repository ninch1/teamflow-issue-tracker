import express, { Request, Response } from 'express';
import { register, login, me } from '../controllers/authController';
import authMiddleware from '../middleware/authMiddleware';

const authRouter = express.Router();

// POST request for registering user.
// PARAMS: name, email, password
authRouter.post('/register', register);

// POST request to log in user.
// PARAMS: email, password
authRouter.post('/login', login);

// PROTECTED GET request to get user information
// AUTH: Bearer Token
authRouter.route('/me').get(authMiddleware, me);

export default authRouter;
