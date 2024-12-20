import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { ensureUploadDir, uploadDir } from '@/utils/files';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('\n[CV Upload API] ====== Start Request ======');
  console.log('[CV Upload API] Method:', req.method);

  if (req.method !== 'POST') {
    console.log('[CV Upload API] Error: Invalid method');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    await ensureUploadDir();
    console.log('[CV Upload API] Upload directory ensured');

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

    // Generate unique filename
    const fileExtension = path.extname(file.originalFilename || 'cv.pdf');
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const destinationPath = path.join(uploadDir, uniqueFilename);

    // Copy file to uploads directory
    const fileContent = await fs.readFile(file.filepath);
    await fs.writeFile(destinationPath, fileContent);
    console.log('[CV Upload API] File saved:', destinationPath);

    // Clean up temp file
    await fs.unlink(file.filepath);

    console.log('[CV Upload API] ====== End Request Success ======\n');
    res.json({ message: uniqueFilename });
  } catch (error) {
    console.error('[CV Download API] ====== Error ======');
    console.error('[CV Download API] Error details:', error);
    console.error('[CV Download API] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('[CV Download API] ====== End Request Error ======\n');
    res.status(500).json({ error: 'Failed to upload CV' });
  }
}