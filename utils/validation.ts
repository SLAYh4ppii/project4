import { NextApiRequest } from 'next';

export function validateFileId(req: NextApiRequest): string {
  const { id } = req.query;
  
  // Handle case where id is an array
  const fileId = Array.isArray(id) ? id[0] : id;

  if (!fileId || typeof fileId !== 'string') {
    throw new Error('Invalid file ID');
  }

  // Validate file ID format (should be UUID with extension)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(pdf|PDF)$/i;
  if (!uuidRegex.test(fileId)) {
    throw new Error('Invalid file ID format');
  }

  return fileId;
}