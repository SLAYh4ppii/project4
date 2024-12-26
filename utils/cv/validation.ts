import path from 'path';
import { CVValidationResult } from './types';

export function validateCVId(id: unknown): CVValidationResult {
  console.log('Validating CV ID:', id);

  // Handle undefined or null
  if (!id) {
    console.log('CV ID is null or undefined');
    return { isValid: false, fileId: null, error: 'No file ID provided' };
  }

  // Handle object - try to get cv property
  if (typeof id === 'object' && id !== null) {
    console.log('CV ID is an object, attempting to extract cv property');
    const cvObj = id as { cv?: string };
    if (cvObj.cv) {
      console.log('Found cv property:', cvObj.cv);
      id = cvObj.cv;
    } else {
      console.log('No cv property found in object');
      return { isValid: false, fileId: null, error: 'Invalid file ID format' };
    }
  }

  // Convert to string and sanitize
  const fileId = String(id).trim();
  console.log('Converted and trimmed file ID:', fileId);

  // Validate file extension
  if (!fileId.endsWith('.pdf')) {
    console.log('Invalid file extension, expected .pdf');
    return { isValid: false, fileId: null, error: 'Invalid file type' };
  }

  // Prevent directory traversal
  const normalizedPath = path.normalize(fileId);
  if (normalizedPath !== fileId || fileId.includes('..')) {
    console.log('Potential directory traversal detected');
    return { isValid: false, fileId: null, error: 'Invalid file path' };
  }

  console.log('CV ID validation successful:', fileId);
  return { isValid: true, fileId };
}