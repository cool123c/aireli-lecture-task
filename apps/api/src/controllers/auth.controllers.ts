import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PlatformUser } from "@enterprise-commerce/core/platform/types"
import { createUser } from "../models/User"

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const createdUser = await createUser({ email, password });

    const token = jwt.sign(
      { id: createdUser.id },
      process.env.JWT_SECRET || "no_key_set",
      { expiresIn: "1d" }
    );

    res.status(201).json({
      user: {
        id: createdUser.id,
        email: createdUser.email
      },
      token
    });
  } catch (error: any) {
    if (error?.code === 'SQLITE_CONSTRAINT') {
      res.status(409).json({ message: 'Email already exists' });
      return;
    }

    res.status(500).json({ message: 'Registration failed' });
  }
};