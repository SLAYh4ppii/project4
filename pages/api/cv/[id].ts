import { NextApiRequest, NextApiResponse } from 'next';
import { validateCVId } from '@/utils/cvValidation';
import { getFilePath, streamFileToResponse } from '@/utils/files';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const validation = validateCVId(req.query.id);
    
    if (!validation.isValid || !validation.fileId) {
      res.status(400).json({ error: validation.error });
      return;
    }

    const { path: filePath, stats } = await getFilePath(validation.fileId);
    await streamFileToResponse(filePath, validation.fileId, stats, res);
  } catch (error) {
    console.error('CV download error:', error);
    
    if (!res.headersSent) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        res.status(404).json({ error: 'CV not found' });
      } else {
        res.status(500).json({ error: 'Failed to fetch CV' });
      }
    }
  }
}