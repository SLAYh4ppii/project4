import { NextApiRequest, NextApiResponse } from 'next';
import { validateCVId } from '@/utils/cv/validation';
import { getFilePath, streamFileToResponse } from '@/utils/files';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('CV download request received:', {
    method: req.method,
    query: req.query,
    headers: req.headers
  });

  if (req.method !== 'GET') {
    console.log('Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const fileId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    console.log('Processing file ID:', fileId);

    const validation = validateCVId(fileId);
    console.log('Validation result:', validation);

    if (!validation.isValid || !validation.fileId) {
      console.log('CV ID validation failed:', validation.error);
      return res.status(400).json({ error: validation.error });
    }

    console.log('Getting file path for validated ID:', validation.fileId);
    const { path: filePath, stats } = await getFilePath(validation.fileId);
    
    console.log('Streaming file to response:', {
      path: filePath,
      size: stats.size
    });
    
    await streamFileToResponse(filePath, validation.fileId, stats, res);
    console.log('File stream completed successfully');
  } catch (error) {
    console.error('Error processing CV download:', error);
    
    if (!res.headersSent) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        console.log('File not found error');
        res.status(404).json({ error: 'CV not found' });
      } else {
        console.log('General server error');
        res.status(500).json({ error: 'Failed to fetch CV' });
      }
    }
  }
}