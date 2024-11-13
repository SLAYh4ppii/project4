import { NextApiRequest, NextApiResponse } from 'next';
import { GridFSBucket, ObjectId } from 'mongodb';
import database from '@/middleware/database';

interface ExtendedRequest extends NextApiRequest {
  db: any;
}

export default async function handler(req: ExtendedRequest, res: NextApiResponse) {
  console.log('\n[CV Download API] ====== Start Request ======');
  console.log('[CV Download API] Method:', req.method);
  console.log('[CV Download API] Query:', req.query);
  console.log('[CV Download API] Headers:', JSON.stringify(req.headers, null, 2));

  if (req.method !== 'GET') {
    console.log('[CV Download API] Error: Invalid method');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    console.log('[CV Download API] Error: Invalid ID in query');
    res.status(400).json({ error: 'Invalid ID' });
    return;
  }

  await database(req, res, async () => {
    let downloadStream;
    try {
      console.log('[CV Download API] Database connection established');

      if (!ObjectId.isValid(id)) {
        console.log('[CV Download API] Error: Invalid ObjectId format:', id);
        res.status(400).json({ error: 'Invalid ID format' });
        return;
      }

      console.log('[CV Download API] Creating GridFS bucket');
      const bucket = new GridFSBucket(req.db, {
        bucketName: 'cvs'
      });

      // First check if the file exists
      console.log('[CV Download API] Checking if file exists in GridFS');
      const file = await req.db.collection('cvs.files').findOne({ _id: new ObjectId(id) });
      
      if (!file) {
        console.log('[CV Download API] Error: File not found in GridFS');
        res.status(404).json({ error: 'CV not found' });
        return;
      }

      console.log('[CV Download API] File found:', {
        id: file._id.toString(),
        filename: file.filename,
        size: file.length,
        contentType: file.contentType,
        metadata: file.metadata
      });

      console.log('[CV Download API] Opening download stream');
      downloadStream = bucket.openDownloadStream(new ObjectId(id));

      // Set response headers
      const headers = {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${file.metadata?.originalName || 'cv.pdf'}"`,
        'Content-Length': file.length
      };
      console.log('[CV Download API] Setting response headers:', headers);
      
      Object.entries(headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      console.log('[CV Download API] Starting file stream');
      let bytesRead = 0;
      downloadStream.on('data', (chunk) => {
        bytesRead += chunk.length;
        console.log('[CV Download API] Streaming progress:', {
          bytesRead,
          totalSize: file.length,
          percentage: Math.round((bytesRead / file.length) * 100)
        });
      });

      // Stream the file
      downloadStream.pipe(res);

      // Handle stream errors
      downloadStream.on('error', (error) => {
        console.error('[CV Download API] Stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error streaming CV' });
        }
      });

      // Cleanup on finish
      downloadStream.on('end', () => {
        console.log('[CV Download API] Stream finished successfully');
        if (downloadStream) {
          console.log('[CV Download API] Cleaning up download stream');
          downloadStream.destroy();
        }
        console.log('[CV Download API] ====== End Request Success ======\n');
      });

    } catch (error) {
      console.error('[CV Download API] ====== Error ======');
      console.error('[CV Download API] Error details:', error);
      console.error('[CV Download API] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('[CV Download API] ====== End Request Error ======\n');
      
      if (!res.headersSent) {
        res.status(500).json({ 
          error: 'Failed to fetch CV',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });
}