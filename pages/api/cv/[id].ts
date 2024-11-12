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
      if (!ObjectId.isValid(id)) {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
      }

      const doc = await req.db.collection('cvs').findOne({ 
        _id: new ObjectId(id) 
      });
      
      if (!doc) {
        res.status(404).json({ error: 'CV not found' });
        return;
      }

      if (!doc.file) {
        res.status(404).json({ error: 'CV file data not found - missing file object' });
        return;
      }

      if (!doc.file.buffer) {
        res.status(404).json({ error: 'CV file data not found - missing buffer' });
        return;
      }

      // Get the base64 data
      const base64Data = doc.file.buffer.buffer || doc.file.buffer;
      
      if (!base64Data) {
        res.status(404).json({ error: 'CV file data not found - invalid buffer data' });
        return;
      }

      // Convert base64 to buffer
      const buffer = Buffer.from(base64Data, 'base64');

      if (buffer.length === 0) {
        res.status(404).json({ error: 'CV file data is empty' });
        return;
      }

      // Send the binary data and content type
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${doc.originalName || 'cv.pdf'}"`);
      res.send(buffer);
    } catch (error) {
      console.error('CV API Error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch CV',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}