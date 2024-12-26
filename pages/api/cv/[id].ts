import { NextApiRequest, NextApiResponse } from 'next';
import { validateCVId } from '@/utils/cvValidation';
import { getFilePath, streamFileToResponse } from '@/utils/files';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[CV API] Received request:', {
    method: req.method,
    query: req.query,
    headers: req.headers
  });

  if (req.method !== 'GET') {
    console.log('[CV API] Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('[CV API] Validating CV ID:', req.query.id);
    const validation = validateCVId(req.query.id);
    
    if (!validation.isValid || !validation.fileId) {
      console.error('[CV API] Validation failed:', validation.error);
      return res.status(400).json({ error: validation.error });
    }

    console.log('[CV API] Getting file path for:', validation.fileId);
    const { path: filePath, stats } = await getFilePath(validation.fileId);
    
    console.log('[CV API] File details:', {
      path: filePath,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime
    });

    console.log('[CV API] Starting file stream');
    await streamFileToResponse(filePath, validation.fileId, stats, res);
    console.log('[CV API] File stream completed');
  } catch (error) {
    console.error('[CV API] Error:', error);
    
    if (!res.headersSent) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        console.log('[CV API] File not found');
        res.status(404).json({ error: 'CV not found' });
      } else {
        console.log('[CV API] Server error');
        res.status(500).json({ error: 'Failed to fetch CV' });
      }
    }
  }
}