import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import database from '@/middleware/database';
import { DatabaseConnection } from '@/types/database';
import { Job } from '@/types';

interface ExtendedRequest extends NextApiRequest, DatabaseConnection {}

export default async function handler(req: ExtendedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'Invalid ID' });
    return;
  }

  await database(req, res, async () => {
    try {
      const job = await req.db.collection<Job>('jobs').findOne({ _id: new ObjectId(id) });
      if (!job) {
        res.status(404).json({ error: 'Job not found' });
        return;
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch job' });
    }
  });
}