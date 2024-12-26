import { NextApiRequest, NextApiResponse } from 'next';
import { getFilePath, streamFileToResponse } from '@/utils/files';
import { validateAndSanitizeCVId } from '@/utils/cvHandling';

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
    const validation = validateAndSanitizeCVId(req.query.id);
    
    if (!validation.isValid || !validation.fileId) {
      console.error('[CV Download API] Validation failed:', validation.error);
      throw new Error(validation.error || 'Invalid file ID');
    }

    console.log('[CV Download API] Validated file ID:', validation.fileId);

    // Get file path and stats
    const { path: filePath, stats } = await getFilePath(validation.fileId);
    console.log('[CV Download API] File found:', {
      path: filePath,
      size: stats.size
    });

    // Stream file to response
    await streamFileToResponse(filePath, validation.fileId, stats, res);
    console.log('[CV Download API] ====== End Request Success ======\n');
  } catch (error) {
    console.error('[CV Download API] ====== Error ======');
    console.error('[CV Download API] Error details:', error);
    console.error('[CV Download API] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
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