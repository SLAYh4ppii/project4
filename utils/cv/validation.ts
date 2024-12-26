import path from 'path';
import { CVValidationResult } from './types';
import { extractFileName } from './helpers';

export function validateCVId(id: unknown): CVValidationResult {
  try {
    // Extract filename if id is an object
    const fileId = extractFileName(id);

    // Basic validation
    if (!fileId || typeof fileId !== 'string') {
      return { isValid: false, fileId: null, error: 'Invalid file ID' };
    }

    // Trim and validate file extension
    const trimmedId = fileId.trim();
    if (!trimmedId.endsWith('.pdf')) {
      return { isValid: false, fileId: null, error: 'Invalid file type' };
    }

    // Prevent directory traversal
    const normalizedPath = path.normalize(trimmedId);
    if (normalizedPath !== trimmedId || trimmedId.includes('..')) {
      return { isValid: false, fileId: null, error: 'Invalid file path' };
    }

    // Validate filename format
    const filenameRegex = /^[a-zA-Z0-9-_]+\.pdf$/;
    if (!filenameRegex.test(trimmedId)) {
      return { isValid: false, fileId: null, error: 'Invalid filename format' };
    }

    return { isValid: true, fileId: trimmedId };
  } catch (error) {
    return { 
      isValid: false, 
      fileId: null, 
      error: 'Failed to validate file ID' 
    };
  }
}