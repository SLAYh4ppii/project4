import { NextApiRequest } from 'next';

export function validateFileId(req: NextApiRequest): string {
  const { id } = req.query;
  
  // Handle case where id is an array
  const fileId = Array.isArray(id) ? id[0] : id;

  if (!fileId || typeof fileId !== 'string') {
    throw new Error('Invalid file ID');
  }

  // Basic validation to ensure the file ID is safe
  // Allow alphanumeric characters, hyphens, underscores and .pdf extension
  const safeFileRegex = /^[a-zA-Z0-9_-]+\.pdf$/i;
  if (!safeFileRegex.test(fileId)) {
    throw new Error('Invalid file ID format');
  }

  return fileId;
}