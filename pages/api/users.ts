import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

if (!process.env.DB_URL) {
  throw new Error('DB_URL is not defined in environment variables');
}

const jwtSecret = process.env.JWT_SECRET;
const saltRounds = 10;
const dbName = 'ATS';
const client = new MongoClient(process.env.DB_URL);

interface CreateUserRequest extends NextApiRequest {
  body: {
    username: string;
    password: string;
  };
}

async function findUser(db: any, username: string) {
  const collection = db.collection('user');
  return collection.findOne({ username });
}

async function createUser(db: any, username: string, password: string) {
  const collection = db.collection('user');
  const hash = await bcrypt.hash(password, saltRounds);
  return collection.insertOne({
    userId: uuidv4(),
    username,
    password: hash,
  });
}

export default async function handler(req: CreateUserRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: true, message: 'Username and password are required' });
    }

    try {
      await client.connect();
      const db = client.db(dbName);

      const existingUser = await findUser(db, username);
      if (existingUser) {
        return res.status(403).json({ error: true, message: 'Username exists' });
      }

      const result = await createUser(db, username, password);
      const user = result.ops[0];
      const token = jwt.sign(
        { userId: user.userId, username: user.username },
        jwtSecret
      );

      res.status(200).json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: true, message: 'Internal server error' });
    } finally {
      await client.close();
    }
  } else {
    res.status(405).json({ error: true, message: 'Method not allowed' });
  }
}