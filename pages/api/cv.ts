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
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  await database(req, res, async () => {
    try {
      const form = formidable();
      const [fields, files] = await form.parse(req);
      
      if (!files.file?.[0]) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const file = files.file[0];
      const fileData = new Binary(Buffer.from(await readFile(file.filepath)));

      const result = await req.db.collection('cvs').insertOne({
        file: fileData,
      });

      res.json({ message: result.insertedId.toString() });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to upload CV' });
    }
  });
}

async function readFile(filepath: string): Promise<Buffer> {
  const fs = require('fs').promises;
  return await fs.readFile(filepath);
}