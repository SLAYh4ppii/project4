import { NextApiRequest, NextApiResponse } from 'next';
import { getFilePath, streamFileToResponse } from '@/utils/files';
import { validateFileId } from '@/utils/validation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('\n[CV Download API] ====== Start Request ======');
  console.log('[CV Download API] Method:', req.method);
  console.log('[CV Download API] Query:', req.query);

  if (req.method !== 'GET') {
    console.log('[CV Download API] Error: Invalid method');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Validate and get file ID
    const fileId = validateFileId(req);
    console.log('[CV Download API] Validated file ID:', fileId);

    // Get file path and stats
    const { path: filePath, stats } = await getFilePath(fileId);
    console.log('[CV Download API] File found:', {
      path: filePath,
      size: stats.size
    });

    // Stream file to response
    await streamFileToResponse(filePath, fileId, stats, res);
    console.log('[CV Download API] ====== End Request Success ======\n');
  } catch (error) {
    console.error('[CV Download API] ====== Error ======');
    console.error('[CV Download API] Error details:', error);
    
    if (!res.headersSent) {
      if (error.message === 'Invalid file ID' || error.message === 'Invalid file ID format') {
        res.status(400).json({ error: error.message });
      } else if (error.code === 'ENOENT') {
        res.status(404).json({ error: 'CV not found' });
      } else {
        res.status(500).json({ 
          error: 'Failed to fetch CV',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    console.error('[CV Download API] ====== End Request Error ======\n');
  }
}