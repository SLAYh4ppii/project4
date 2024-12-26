import { NextApiRequest, NextApiResponse } from 'next';
import { validateCVId } from '@/utils/cvValidation';
import { getFilePath, streamFileToResponse } from '@/utils/files';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const fileId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    const validation = validateCVId(fileId);
    
    if (!validation.isValid || !validation.fileId) {
      return res.status(400).json({ error: validation.error });
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