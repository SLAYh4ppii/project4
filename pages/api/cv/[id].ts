import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import database from '@/middleware/database';

interface ExtendedRequest extends NextApiRequest {
  db: any;
}

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
      const doc = await req.db.collection('cvs').findOne({ _id: new ObjectId(id) });
      if (!doc) {
        res.status(404).json({ error: 'CV not found' });
        return;
      }
      doc.file = doc.file.buffer;
      res.json(doc);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch CV' });
    }
  });
}