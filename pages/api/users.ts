import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, Db } from 'mongodb';
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

async function findUser(db: Db, username: string): Promise<UserDocument | null> {
  const collection = db.collection<UserDocument>('user');
  return collection.findOne({ username });
}

// Rest of the file implementation...