import express, { Request, Response } from 'express';
import { register } from '../controllers/authController';

const authRouter = express.Router();

// POST request for registering user.
// PARAMS: name, email, password
authRouter.post('/register', register);

export default authRouter;
