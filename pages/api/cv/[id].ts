import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import database from '@/middleware/database';

interface ExtendedRequest extends NextApiRequest {
  db: any;
}

export default async function handler(req: ExtendedRequest, res: NextApiResponse) {
  console.log('[CV API] Request received:', {
    method: req.method,
    id: req.query.id
  });

  if (req.method !== 'GET') {
    console.log('[CV API] Invalid method:', req.method);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    console.log('[CV API] Invalid ID:', id);
    res.status(400).json({ error: 'Invalid ID' });
    return;
  }

  await database(req, res, async () => {
    try {
      console.log('[CV API] Searching for CV with ID:', id);
      
      if (!ObjectId.isValid(id)) {
        console.log('[CV API] Invalid ObjectId format:', id);
        res.status(400).json({ error: 'Invalid ID format' });
        return;
      }

      const doc = await req.db.collection('cvs').findOne({ 
        _id: new ObjectId(id) 
      });
      
      if (!doc) {
        console.log('[CV API] CV not found for ID:', id);
        res.status(404).json({ error: 'CV not found' });
        return;
      }

      console.log('[CV API] CV found:', {
        id: doc._id.toString(),
        hasFile: !!doc.file,
        fileSize: doc.file?.buffer?.length,
        originalName: doc.originalName
      });

      if (!doc.file?.buffer) {
        console.log('[CV API] CV file data missing');
        res.status(404).json({ error: 'CV file data not found' });
        return;
      }

      // Send the binary data and content type
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${doc.originalName || 'cv.pdf'}"`);
      console.log('[CV API] Sending file response');
      res.send(doc.file.buffer);
    } catch (error) {
      console.error('[CV API] Error:', error);
      res.status(500).json({ error: 'Failed to fetch CV' });
    }
  });
}