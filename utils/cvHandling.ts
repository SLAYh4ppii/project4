import { NextApiRequest } from 'next';

interface CVValidationResult {
  isValid: boolean;
  fileId: string | null;
  error?: string;
}

export function validateAndSanitizeCVId(id: unknown): CVValidationResult {
  // Handle undefined or null
  if (!id) {
    return { isValid: false, fileId: null, error: 'No file ID provided' };
  }

  // Handle object - try to get cv property
  if (typeof id === 'object' && id !== null) {
    const cvObj = id as { cv?: string };
    if (cvObj.cv) {
      id = cvObj.cv;
    } else {
      return { isValid: false, fileId: null, error: 'Invalid file ID format' };
    }
  }

  // Convert to string and sanitize
  const fileId = String(id).trim();

  // Basic validation to ensure the file ID is safe
  const safeFileRegex = /^[a-zA-Z0-9_-]+\.pdf$/i;
  if (!safeFileRegex.test(fileId)) {
    return { isValid: false, fileId: null, error: 'Invalid file ID format' };
  }

  return { isValid: true, fileId };
}