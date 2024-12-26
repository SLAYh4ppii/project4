import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { User } from '@/types';

interface CreateUserResponse {
  token?: string;
  error?: boolean;
  message?: string;
}

interface UserDocument extends User {
  password: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<CreateUserResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: true, message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: true, message: 'Missing required fields' });
  }

  try {
    const client = new MongoClient(process.env.DB_URL || '');
    await client.connect();
    const db = client.db('ATS');

    const existingUser = await db.collection<UserDocument>('user').findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: true, message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    await db.collection<UserDocument>('user').insertOne({
      userId,
      username,
      password: hashedPassword
    });

    const token = jwt.sign({ userId, username }, process.env.JWT_SECRET || '');
    
    await client.close();
    return res.status(201).json({ token });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ error: true, message: 'Internal server error' });
  }
}