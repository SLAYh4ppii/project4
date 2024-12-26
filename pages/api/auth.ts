import { NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRequest, AuthResponse } from '@/types/api';
import { DatabaseConnection } from '@/types/database';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

const jwtSecret = process.env.JWT_SECRET;

export default async function handler(
  req: AuthRequest & DatabaseConnection,
  res: NextApiResponse<AuthResponse>
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: true, message: 'Method not allowed' });
    return;
  }

  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: true, message: 'Missing credentials' });
    return;
  }

  try {
    const user = await req.db
      .collection('user')
      .findOne({ username });

    if (!user) {
      res.status(404).json({ error: true, message: 'User not found' });
      return;
    }

    const match = await bcrypt.compare(password, user.password);

    if (match) {
      const token = jwt.sign(
        { userId: user.userId, username: user.username },
        jwtSecret
      );
      res.status(200).json({ token });
    } else {
      res.status(401).json({ error: true, message: 'Auth Failed' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: true, message: 'Internal Server Error' });
  }
}