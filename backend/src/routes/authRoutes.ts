import express, { Request, Response } from 'express';
import { register, login, me } from '../controllers/authController';

const authRouter = express.Router();

// POST request for registering user.
// PARAMS: name, email, password
authRouter.post('/register', register);

// POST request to log in user.
// PARAMS: email, password
authRouter.post('/login', login);

// PROTECTED GET request to get user information
// AUTH: Bearer Token
authRouter.get('/me', me);

export default authRouter;
