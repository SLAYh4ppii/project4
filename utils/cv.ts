import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { uploadDir } from './files';
import { UploadedFile } from '@/types/upload';

export async function processUploadedFile(file: UploadedFile): Promise<string> {
  const fileExtension = path.extname(file.originalFilename || '.pdf');
  const filename = `${uuidv4()}${fileExtension}`;
  const destinationPath = path.join(uploadDir, filename);

  const fileContent = await fs.readFile(file.filepath);
  await fs.writeFile(destinationPath, fileContent);
  await fs.unlink(file.filepath);

  return filename;
}

export function validateUpload(mimetype: string | null | undefined): boolean {
  if (!mimetype) return false;
  return mimetype === 'application/pdf';
}