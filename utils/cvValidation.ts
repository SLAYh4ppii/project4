import path from 'path';

export interface CVValidationResult {
  isValid: boolean;
  fileId: string | null;
  error?: string;
}

export function validateCVId(id: unknown): CVValidationResult {
  if (!id) {
    return { isValid: false, fileId: null, error: 'No file ID provided' };
  }

  const fileId = String(id).trim();
  
  // Allow any filename with .pdf extension
  if (!fileId.endsWith('.pdf')) {
    return { isValid: false, fileId: null, error: 'Invalid file type' };
  }

  // Basic security check - prevent directory traversal
  const normalizedPath = path.normalize(fileId);
  if (normalizedPath !== fileId || fileId.includes('..')) {
    return { isValid: false, fileId: null, error: 'Invalid file path' };
  }

  return { isValid: true, fileId };
}