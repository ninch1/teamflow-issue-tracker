import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';

const saltRounds = 10;

// Register User controller. creates user. Required parameters: name, email, password.
export async function register(req: Request, res: Response) {
  const userInfo = req.body;

  // checks types of user info
  if (
    typeof userInfo.name !== 'string' ||
    typeof userInfo.email !== 'string' ||
    typeof userInfo.password !== 'string'
  ) {
    return res.status(400).json({
      error: 'Name, email, and password are required',
    });
  }

  try {
    // validates name
    const name = userInfo.name.trim();
    const nameRegex = /^[A-Za-z]{2,30}( [A-Za-z]{2,30}){1,2}$/;
    if (!nameRegex.test(name)) {
      return res.status(400).json({
        error: 'Name must include first and last name using letters only',
      });
    }

    // validates email
    const email = userInfo.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email',
      });
    }

    // validates and encrypts password
    const password = userInfo.password;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: 'Please create stonger password',
      });
    }
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Creates user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
      },
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}
