import { NextApiRequest, NextApiResponse } from 'next';
import { Binary } from 'mongodb';
import formidable from 'formidable';
import database from '@/middleware/database';

interface ExtendedRequest extends NextApiRequest {
  db: any;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: ExtendedRequest, res: NextApiResponse) {
  console.log('[CV API] Request received:', { method: req.method });

  if (req.method !== 'POST') {
    console.log('[CV API] Invalid method:', req.method);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  await database(req, res, async () => {
    try {
      console.log('[CV API] Parsing form data');
      const form = formidable();
      const [fields, files] = await form.parse(req);
      
      console.log('[CV API] Form data parsed:', { 
        fields: JSON.stringify(fields),
        fileCount: files.file?.length 
      });

      if (!files.file?.[0]) {
        console.log('[CV API] No file uploaded');
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const file = files.file[0];
      console.log('[CV API] File details:', {
        filename: file.originalFilename,
        size: file.size,
        type: file.mimetype
      });

      const fileData = new Binary(await readFile(file.filepath));
      console.log('[CV API] File converted to Binary');

      const result = await req.db.collection('cvs').insertOne({
        file: fileData,
        uploadedAt: new Date(),
        originalName: file.originalFilename
      });
      console.log('[CV API] File saved to database:', { id: result.insertedId.toString() });

      res.json({ message: result.insertedId.toString() });
    } catch (error) {
      console.error('[CV API] Error:', error);
      res.status(500).json({ error: 'Failed to upload CV' });
    }
  });
}

async function readFile(filepath: string): Promise<Buffer> {
  console.log('[CV API] Reading file from:', filepath);
  const fs = require('fs').promises;
  const buffer = await fs.readFile(filepath);
  console.log('[CV API] File read complete, size:', buffer.length);
  return buffer;
}