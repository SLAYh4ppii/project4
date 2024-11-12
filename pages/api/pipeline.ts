import { NextApiRequest, NextApiResponse } from 'next';
import database from '@/middleware/database';

interface ExtendedRequest extends NextApiRequest {
  db: any;
}

export default async function handler(req: ExtendedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  await database(req, res, async () => {
    try {
      const doc = await req.db.collection('pipeline').findOne();
      res.json(doc.pipeline);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch pipeline' });
    }
  });
}