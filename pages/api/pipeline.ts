import { NextApiResponse } from 'next';
import database from '@/middleware/database';
import { ApiRequest } from '@/types/api';
import { DatabaseConnection } from '@/types/mongodb';

export default async function handler(
  req: ApiRequest & DatabaseConnection,
  res: NextApiResponse<string[] | { error: string }>
) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  await database(req, res, async () => {
    try {
      const doc = await req.db.collection('pipeline').findOne();
      res.json(doc?.pipeline || []);
    } catch (error) {
      console.error('Failed to fetch pipeline:', error);
      res.status(500).json({ error: 'Failed to fetch pipeline' });
    }
  });
}