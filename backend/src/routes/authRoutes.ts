import express, { Request, Response } from 'express';
import { register, login } from '../controllers/authController';

const authRouter = express.Router();

// POST request for registering user.
// PARAMS: name, email, password
authRouter.post('/register', register);

// POST request to log in user.
// PARAMS: email, password
authRouter.post('/login', login);

export default authRouter;
