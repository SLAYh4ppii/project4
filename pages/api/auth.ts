import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

if (!process.env.DB_URL) {
  throw new Error('DB_URL is not defined in environment variables');
}

const jwtSecret = process.env.JWT_SECRET;
const dbName = 'ATS';
const client = new MongoClient(process.env.DB_URL);

interface AuthRequest extends NextApiRequest {
  body: {
    username: string;
    password: string;
  };
}

function findUser(db: any, username: string): Promise<any> {
  const collection = db.collection('user');
  return collection.findOne({ username });
}

function authUser(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export default async function handler(req: AuthRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: true, message: 'Method not allowed' });
    return;
  }

  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: true, message: 'Missing required fields' });
    return;
  }

  try {
    await client.connect();
    const db = client.db(dbName);

    const user = await findUser(db, username);

    if (!user) {
      res.status(404).json({ error: true, message: 'User not found' });
      return;
    }

    const match = await authUser(password, user.password);

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
    console.error(error);
    res.status(500).json({ error: true, message: 'Internal Server Error' });
  } finally {
    await client.close();
  }
}