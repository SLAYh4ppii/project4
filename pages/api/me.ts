import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

const jwtSecret = process.env.JWT_SECRET;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { token } = req.cookies;

  if (!token) {
    res.status(401).json({ message: 'Unable to auth' });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    res.json(decoded);
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Unable to auth' });
  }
}