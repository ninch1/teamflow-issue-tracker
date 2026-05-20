import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import { create } from 'node:domain';

export async function register(req: Request, res: Response) {
  const userInfo = req.body;

  const saltRounds = 10;

  try {
    userInfo.passwordHash = await bcrypt.hash(req.body.password, saltRounds);

    const user = await prisma.user.create({
      data: {
        email: userInfo.email,
        name: userInfo.name,
        passwordHash: userInfo.passwordHash,
      },
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.createdAt,
      },
    });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Something went wrong' });
    }
  }
}
