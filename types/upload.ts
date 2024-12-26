import { File } from 'formidable';

export interface UploadedFile extends Omit<File, 'originalFilename' | 'mimetype'> {
  filepath: string;
  originalFilename: string | null;
  mimetype: string | null;
}

export type UploadResponse = {
  filename: string;
  error?: never;
} | {
  filename?: never;
  error: string;
}