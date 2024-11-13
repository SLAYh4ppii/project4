import { NextApiRequest, NextApiResponse } from 'next';
import { GridFSBucket, ObjectId } from 'mongodb';
import formidable from 'formidable';
import database from '@/middleware/database';
import { Readable } from 'stream';

interface ExtendedRequest extends NextApiRequest {
  db: any;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: ExtendedRequest, res: NextApiResponse) {
  console.log('\n[CV Upload API] ====== Start Request ======');
  console.log('[CV Upload API] Method:', req.method);
  console.log('[CV Upload API] Headers:', JSON.stringify(req.headers, null, 2));

  if (req.method !== 'POST') {
    console.log('[CV Upload API] Error: Invalid method');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  await database(req, res, async () => {
    try {
      console.log('[CV Upload API] Database connection established');
      console.log('[CV Upload API] Parsing form data...');
      
      const form = formidable();
      const [fields, files] = await form.parse(req);
      
      console.log('[CV Upload API] Form data parsed:', { 
        fields: JSON.stringify(fields),
        filesReceived: files.file ? 'yes' : 'no',
        fileCount: files.file?.length || 0
      });

      if (!files.file?.[0]) {
        console.log('[CV Upload API] Error: No file in request');
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const file = files.file[0];
      console.log('[CV Upload API] File details:', {
        filename: file.originalFilename,
        size: file.size,
        type: file.mimetype,
        filepath: file.filepath
      });

      // Create GridFS bucket
      console.log('[CV Upload API] Creating GridFS bucket');
      const bucket = new GridFSBucket(req.db, {
        bucketName: 'cvs'
      });

      // Create upload stream
      console.log('[CV Upload API] Creating upload stream');
      const uploadStream = bucket.openUploadStream(file.originalFilename || 'cv.pdf', {
        contentType: 'application/pdf',
        metadata: {
          uploadDate: new Date(),
          originalName: file.originalFilename
        }
      });

      console.log('[CV Upload API] Reading file from disk');
      const fileData = await readFile(file.filepath);
      console.log('[CV Upload API] File read complete, size:', fileData.length);

      console.log('[CV Upload API] Creating readable stream');
      const readableStream = new Readable();
      readableStream.push(fileData);
      readableStream.push(null);

      // Upload file using streams
      console.log('[CV Upload API] Starting file upload to GridFS');
      await new Promise((resolve, reject) => {
        readableStream
          .pipe(uploadStream)
          .on('error', (error) => {
            console.error('[CV Upload API] Upload stream error:', error);
            reject(error);
          })
          .on('finish', () => {
            console.log('[CV Upload API] Upload stream finished successfully');
            resolve(null);
          });
      });

      const fileId = uploadStream.id.toString();
      console.log('[CV Upload API] File saved to GridFS:', { id: fileId });
      
      console.log('[CV Upload API] Verifying file exists in GridFS');
      const savedFile = await req.db.collection('cvs.files').findOne({ _id: new ObjectId(fileId) });
      console.log('[CV Upload API] File verification:', savedFile ? 'successful' : 'failed');

      console.log('[CV Upload API] ====== End Request Success ======\n');
      res.json({ message: fileId });
    } catch (error) {
      console.error('[CV Upload API] ====== Error ======');
      console.error('[CV Upload API] Error details:', error);
      console.error('[CV Upload API] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('[CV Upload API] ====== End Request Error ======\n');
      res.status(500).json({ error: 'Failed to upload CV' });
    }
  });
}

async function readFile(filepath: string): Promise<Buffer> {
  console.log('[CV Upload API] Reading file:', filepath);
  const fs = require('fs').promises;
  try {
    const buffer = await fs.readFile(filepath);
    console.log('[CV Upload API] File read success:', {
      size: buffer.length,
      isBuffer: Buffer.isBuffer(buffer)
    });
    return buffer;
  } catch (error) {
    console.error('[CV Upload API] File read error:', error);
    throw error;
  }
}