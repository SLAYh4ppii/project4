import { CVFileName } from './types';

export function extractFileName(input: unknown): string {
  if (input === null || input === undefined) {
    throw new Error('Input is null or undefined');
  }

  if (typeof input === 'string') {
    return input;
  }

  if (typeof input === 'object' && 'cv' in input && typeof (input as { cv: unknown }).cv === 'string') {
    return (input as { cv: string }).cv;
  }

  throw new Error('Invalid input format');
}

export function isValidFileName(fileName: string): boolean {
  if (!fileName) return false;
  const filenameRegex = /^[a-zA-Z0-9-_]+\.pdf$/;
  return filenameRegex.test(fileName.trim());
}