import path from 'path';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import { NextApiResponse } from 'next';

export const uploadDir = path.join(process.cwd(), 'uploads');

export async function ensureUploadDir() {
  await fs.mkdir(uploadDir, { recursive: true });
}

export function cleanFileName(fileName: string | string[] | undefined): string {
  if (!fileName || Array.isArray(fileName)) {
    throw new Error('Invalid file name');
  }
  return fileName.replace(/['"{}[\]]/g, '').trim();
}

export async function getFilePath(fileName: string): Promise<{ path: string; stats: fs.Stats }> {
  const filePath = path.join(uploadDir, fileName);
  const stats = await fs.stat(filePath);
  return { path: filePath, stats };
}

export async function streamFileToResponse(
  filePath: string, 
  fileName: string,
  stats: fs.Stats,
  res: NextApiResponse
): Promise<void> {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Content-Length', stats.size);

  const fileStream = createReadStream(filePath);
  return new Promise((resolve, reject) => {
    fileStream.pipe(res)
      .on('finish', resolve)
      .on('error', reject);
  });
}

export async function deleteFile(filePath: string): Promise<void> {
  await fs.unlink(filePath);
}